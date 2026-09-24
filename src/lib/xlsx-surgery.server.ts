/**
 * Minimal, integrity-preserving XLSX editing.
 *
 * The workbook is opened as a ZIP and only the XML of the specific cells being
 * changed is rewritten. Every other part (styles, formulas, named ranges, data
 * validations, links, charts, etc.) is copied byte-for-byte.
 */
import JSZip from "jszip";
import { WorkbookEditor, upsertCellXml, type StructOp } from "./xlsx-structure.server";

export type CellEdit = {
  sheet: string;
  cell: string;
  kind: "text" | "number" | "formula";
  value: string;
  reason?: string;
};

export type SheetInfo = { name: string; path: string; rid: string };

export type WorkbookOp = ({ op: "set_cell" } & CellEdit) | StructOp;

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
const encode = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function colIndex(ref: string) {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
}
function rowIndex(ref: string) {
  return Number(ref.match(/\d+$/)?.[0] ?? "0");
}

export async function openWorkbook(bytes: Uint8Array) {
  const zip = await JSZip.loadAsync(bytes);
  const wb = (await zip.file("xl/workbook.xml")?.async("string")) ?? "";
  const rels = (await zip.file("xl/_rels/workbook.xml.rels")?.async("string")) ?? "";
  const relMap = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = m[0].match(/\bId="([^"]+)"/)?.[1];
    const target = m[0].match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target) relMap.set(id, target.startsWith("/") ? target.slice(1) : `xl/${target}`);
  }
  const sheets: SheetInfo[] = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*\/?>/g)) {
    const name = decode(m[0].match(/\bname="([^"]*)"/)?.[1] ?? "");
    const rid = m[0].match(/\b[\w]+:id="([^"]+)"/)?.[1] ?? "";
    const path = relMap.get(rid);
    if (path && zip.file(path)) sheets.push({ name, path, rid });
  }
  const sstXml = (await zip.file("xl/sharedStrings.xml")?.async("string")) ?? "";
  const shared = [...sstXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...(m[1] ?? "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => decode(t[1] ?? "")).join(""),
  );
  const names = [...wb.matchAll(/<definedName\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/definedName>/g)].map(
    (m) => `${decode(m[1] ?? "")} = ${decode(m[2] ?? "")}`,
  );
  return { zip, sheets, shared, names };
}

/** Compact text map of labels and formulas so Claude can locate what to change. */
export async function describeWorkbook(bytes: Uint8Array, maxChars = 120_000) {
  const { zip, sheets, shared, names } = await openWorkbook(bytes);
  const lines: string[] = [`Sheets: ${sheets.map((s) => s.name).join(" | ")}`];
  if (names.length) lines.push(`Named ranges: ${names.slice(0, 200).join("; ")}`);
  const perSheet = Math.max(2000, Math.floor(maxChars / Math.max(1, sheets.length)));
  for (const sheet of sheets) {
    const xml = (await zip.file(sheet.path)!.async("string")) ?? "";
    const out: string[] = [];
    let used = 0;
    for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = m[1] ?? "";
      const inner = m[2] ?? "";
      const ref = attrs.match(/\br="([A-Z]+\d+)"/)?.[1];
      if (!ref) continue;
      const t = attrs.match(/\bt="([^"]+)"/)?.[1];
      const f = inner.match(/<f[^>]*>([\s\S]*?)<\/f>/)?.[1];
      const v = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let text: string | undefined;
      if (f) text = `=${decode(f)}`;
      else if (t === "s" && v !== undefined) text = JSON.stringify(shared[Number(v)] ?? "");
      else if (t === "inlineStr") text = JSON.stringify(decode(inner.replace(/<[^>]+>/g, "")));
      else if (t === "str" && v !== undefined) text = JSON.stringify(decode(v));
      else if (v !== undefined) text = v;
      if (text === undefined || text === '""') continue;
      const line = `${ref}: ${text.length > 160 ? `${text.slice(0, 160)}…` : text}`;
      used += line.length + 1;
      if (used > perSheet) {
        out.push("… (truncated)");
        break;
      }
      out.push(line);
    }
    lines.push(`\n### Sheet "${sheet.name}"\n${out.join("\n")}`);
  }
  return lines.join("\n");
}

function buildCell(ref: string, style: string, edit: CellEdit) {
  const s = style ? ` s="${style}"` : "";
  if (edit.kind === "formula") {
    const f = edit.value.replace(/^=/, "");
    return `<c r="${ref}"${s}><f>${encode(f)}</f></c>`;
  }
  if (edit.kind === "number" && edit.value.trim() !== "" && Number.isFinite(Number(edit.value))) {
    return `<c r="${ref}"${s}><v>${Number(edit.value)}</v></c>`;
  }
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${encode(edit.value)}</t></is></c>`;
}

function applyToSheet(xml: string, edit: CellEdit): { xml: string; skipped?: string } {
  const ref = edit.cell.toUpperCase().replace(/\$/g, "");
  if (!/^[A-Z]{1,3}\d+$/.test(ref)) return { xml, skipped: "invalid cell reference" };
  const cellRe = new RegExp(`<c\\b[^>]*\\br="${ref}"[^>]*?(?:/>|>[\\s\\S]*?</c>)`);
  const existing = xml.match(cellRe)?.[0];
  if (existing) {
    if (/<f\b[^>]*\bt="shared"[^>]*\bref="/.test(existing) || /<f\b[^>]*\bt="array"/.test(existing)) {
      return { xml, skipped: "cell anchors a shared/array formula; left intact to protect dependent cells" };
    }
    const style = existing.match(/\bs="(\d+)"/)?.[1] ?? "";
    return { xml: xml.replace(existing, buildCell(ref, style, edit)) };
  }
  return { xml: upsertCellXml(xml, ref, buildCell(ref, "", edit)) };
}

export async function applyOperations(bytes: Uint8Array, ops: WorkbookOp[]) {
  const { zip, sheets } = await openWorkbook(bytes);
  const ed = new WorkbookEditor(zip, sheets);
  const applied: string[] = [];
  const skipped: string[] = [];
  const label = (o: WorkbookOp) => {
    const why = o.reason ? ` (${o.reason})` : "";
    switch (o.op) {
      case "set_cell": return `${o.sheet}!${o.cell} → ${o.value}${why}`;
      case "insert_rows": case "delete_rows": return `${o.op.replace("_", " ")} ${o.count} at row ${o.at} on "${o.sheet}"${why}`;
      case "insert_columns": case "delete_columns": return `${o.op.replace("_", " ")} ${o.count} at column ${o.at} on "${o.sheet}"${why}`;
      case "copy_range": return `copy ${o.sheet}!${o.source} → ${o.targetSheet ?? o.sheet}!${o.target}${why}`;
      case "clear_range": return `clear ${o.sheet}!${o.range}${why}`;
      case "copy_sheet": return `copy sheet "${o.sheet}" as "${o.newName}"${why}`;
      case "delete_sheet": return `delete sheet "${o.sheet}"${why}`;
    }
  };
  for (const o of ops) {
    try {
      switch (o.op) {
        case "set_cell": {
          const sh = ed.sheet(o.sheet);
          const result = applyToSheet(await ed.read(sh.path), o);
          if (result.skipped) { skipped.push(`${label(o)}: ${result.skipped}`); continue; }
          ed.write(sh.path, result.xml);
          break;
        }
        case "insert_rows": case "delete_rows":
          if (!(o.at >= 1 && o.count >= 1)) throw new Error("invalid row position/count");
          await ed.shift(o.sheet, { axis: "row", at: o.at, count: o.op === "insert_rows" ? o.count : -o.count });
          break;
        case "insert_columns": case "delete_columns": {
          const at = colIndex(o.at.toUpperCase());
          if (!(at >= 1 && o.count >= 1)) throw new Error("invalid column position/count");
          await ed.shift(o.sheet, { axis: "col", at, count: o.op === "insert_columns" ? o.count : -o.count });
          break;
        }
        case "copy_range": {
          const notes = await ed.copyRange(o.sheet, o.source.toUpperCase(), o.target.toUpperCase(), o.targetSheet);
          notes.forEach((n) => skipped.push(`${label(o)}: ${n}`));
          break;
        }
        case "clear_range": await ed.clearRange(o.sheet, o.range.toUpperCase()); break;
        case "copy_sheet": {
          const notes = await ed.copySheet(o.sheet, o.newName);
          notes.forEach((n) => skipped.push(`${label(o)}: ${n}`));
          break;
        }
        case "delete_sheet": await ed.deleteSheet(o.sheet); break;
      }
      applied.push(label(o));
    } catch (e) {
      skipped.push(`${label(o)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  ed.flush();

  if (applied.length) {
    if (zip.file("xl/calcChain.xml")) {
      zip.remove("xl/calcChain.xml");
      const ct = await zip.file("[Content_Types].xml")!.async("string");
      zip.file("[Content_Types].xml", ct.replace(/<Override\b[^>]*PartName="\/xl\/calcChain\.xml"[^>]*\/>/, ""));
      const rels = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
      zip.file("xl/_rels/workbook.xml.rels", rels.replace(/<Relationship\b[^>]*Target="[^"]*calcChain\.xml"[^>]*\/>/, ""));
    }
    let wb = await zip.file("xl/workbook.xml")!.async("string");
    if (/<calcPr\b/.test(wb)) {
      wb = wb.replace(/<calcPr\b([^>]*?)\s*(\/?)>/, (_m, attrs: string, close: string) =>
        `<calcPr${attrs.replace(/\sfullCalcOnLoad="[^"]*"/, "")} fullCalcOnLoad="1"${close}>`);
    } else {
      const anchor = wb.includes("</definedNames>") ? "</definedNames>" : "</sheets>";
      wb = wb.replace(anchor, `${anchor}<calcPr fullCalcOnLoad="1"/>`);
    }
    zip.file("xl/workbook.xml", wb);
  }
  const out = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return { bytes: out, applied, skipped };
}

/**
 * Minimal, integrity-preserving XLSX editing.
 *
 * The workbook is opened as a ZIP and only the XML of the specific cells being
 * changed is rewritten. Every other part (styles, formulas, named ranges, data
 * validations, links, charts, etc.) is copied byte-for-byte.
 */
import JSZip from "jszip";

export type CellEdit = {
  sheet: string;
  cell: string;
  kind: "text" | "number" | "formula";
  value: string;
  reason?: string;
};

export type SheetInfo = { name: string; path: string };

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
    const rid = m[0].match(/\br:id="([^"]+)"/)?.[1] ?? "";
    const path = relMap.get(rid);
    if (path && zip.file(path)) sheets.push({ name, path });
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
  const r = rowIndex(ref);
  const rowRe = new RegExp(`<row\\b[^>]*\\br="${r}"[^>]*?(?:/>|>([\\s\\S]*?)</row>)`);
  const row = xml.match(rowRe);
  const cellXml = buildCell(ref, "", edit);
  if (row) {
    const whole = row[0];
    if (whole.endsWith("/>")) {
      return { xml: xml.replace(whole, `${whole.slice(0, -2)}>${cellXml}</row>`) };
    }
    const inner = row[1] ?? "";
    const cells = [...inner.matchAll(/<c\b[^>]*\br="([A-Z]+)\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)];
    const after = cells.find((c) => colIndex(c[1] ?? "") > colIndex(ref));
    const newInner = after ? inner.replace(after[0], cellXml + after[0]) : inner + cellXml;
    return { xml: xml.replace(whole, whole.replace(inner, newInner)) };
  }
  const rows = [...xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g)];
  const next = rows.find((m) => Number(m[1]) > r);
  const newRow = `<row r="${r}">${cellXml}</row>`;
  if (next) return { xml: xml.replace(next[0], newRow + next[0]) };
  if (xml.includes("<sheetData/>")) return { xml: xml.replace("<sheetData/>", `<sheetData>${newRow}</sheetData>`) };
  return { xml: xml.replace("</sheetData>", `${newRow}</sheetData>`) };
}

export async function applyEdits(bytes: Uint8Array, edits: CellEdit[]) {
  const { zip, sheets } = await openWorkbook(bytes);
  const applied: CellEdit[] = [];
  const skipped: (CellEdit & { why: string })[] = [];
  const cache = new Map<string, string>();
  for (const edit of edits) {
    const sheet = sheets.find((s) => s.name === edit.sheet);
    if (!sheet) {
      skipped.push({ ...edit, why: "sheet not found" });
      continue;
    }
    const xml = cache.get(sheet.path) ?? (await zip.file(sheet.path)!.async("string"));
    const result = applyToSheet(xml, edit);
    cache.set(sheet.path, result.xml);
    if (result.skipped) skipped.push({ ...edit, why: result.skipped });
    else applied.push(edit);
  }
  for (const [path, xml] of cache) zip.file(path, xml);

  if (applied.length) {
    // Excel rebuilds the calculation chain itself; a stale one can trigger repair prompts.
    if (zip.file("xl/calcChain.xml")) {
      zip.remove("xl/calcChain.xml");
      const ct = await zip.file("[Content_Types].xml")!.async("string");
      zip.file("[Content_Types].xml", ct.replace(/<Override\b[^>]*PartName="\/xl\/calcChain\.xml"[^>]*\/>/, ""));
      const rels = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
      zip.file("xl/_rels/workbook.xml.rels", rels.replace(/<Relationship\b[^>]*Target="[^"]*calcChain\.xml"[^>]*\/>/, ""));
    }
    // Force a full recalculation when the workbook is next opened.
    let wb = await zip.file("xl/workbook.xml")!.async("string");
    if (/<calcPr\b/.test(wb)) {
      wb = wb.replace(/<calcPr\b([^>]*?)\s*(\/?)>/, (_m, attrs: string, close: string) => {
        const cleaned = attrs.replace(/\sfullCalcOnLoad="[^"]*"/, "");
        return `<calcPr${cleaned} fullCalcOnLoad="1"${close}>`;
      });
    } else {
      const anchor = wb.includes("</definedNames>") ? "</definedNames>" : "</sheets>";
      wb = wb.replace(anchor, `${anchor}<calcPr fullCalcOnLoad="1"/>`);
    }
    zip.file("xl/workbook.xml", wb);
  }

  const out = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return { bytes: out, applied, skipped };
}

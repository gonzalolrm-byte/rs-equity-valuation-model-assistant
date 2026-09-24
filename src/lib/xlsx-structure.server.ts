/**
 * Structural XLSX operations (rows, columns, sheets, block copy/clear) applied
 * directly to the workbook XML. References in formulas, defined names, merged
 * cells, data validations and conditional formatting are shifted so the rest
 * of the workbook keeps working. Anything not touched stays byte-identical.
 */
import type JSZip from "jszip";

export type StructOp =
  | { op: "insert_rows" | "delete_rows"; sheet: string; at: number; count: number; reason?: string }
  | { op: "insert_columns" | "delete_columns"; sheet: string; at: string; count: number; reason?: string }
  | { op: "copy_range"; sheet: string; source: string; target: string; targetSheet?: string; reason?: string }
  | { op: "clear_range"; sheet: string; range: string; reason?: string }
  | { op: "copy_sheet"; sheet: string; newName: string; reason?: string }
  | { op: "delete_sheet"; sheet: string; reason?: string };

export type Sheet = { name: string; path: string; rid: string };

export const colToNum = (c: string) => [...c.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
export const numToCol = (n: number) => {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};
const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const encode = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Shift = { axis: "row" | "col"; at: number; count: number }; // count<0 = delete

function shiftIndex(i: number, s: Shift): number | null {
  if (i < s.at) return i;
  if (s.count > 0) return i + s.count;
  const end = s.at - s.count - 1;
  if (i <= end) return null;
  return i + s.count;
}

/** Shift a range's endpoints; returns null when the whole range is deleted. */
function shiftSpan(a: number, b: number, s: Shift): [number, number] | null {
  if (s.count > 0) return [shiftIndex(a, s)!, shiftIndex(b, s)!];
  const delEnd = s.at - s.count - 1;
  let na = a, nb = b;
  if (a >= s.at && b <= delEnd) return null;
  if (a > delEnd) na = a + s.count;
  else if (a >= s.at) na = s.at;
  if (b > delEnd) nb = b + s.count;
  else if (b >= s.at) nb = s.at - 1;
  return [na, nb];
}

const REF = /(\$?)([A-Z]{1,3})(\$?)(\d+)/;

function shiftRefText(ref: string, s: Shift): string {
  const parts = ref.split(":");
  const parsed = parts.map((p) => p.match(new RegExp(`^${REF.source}$`)));
  if (parsed.some((p) => !p)) return ref;
  const [a, b = a] = parsed as RegExpMatchArray[];
  const idx = (m: RegExpMatchArray) => (s.axis === "row" ? Number(m[4]) : colToNum(m[2]!));
  const span = shiftSpan(idx(a!), idx(b!), s);
  if (!span) return "#REF!";
  const put = (m: RegExpMatchArray, v: number) =>
    s.axis === "row" ? `${m[1]}${m[2]}${m[3]}${v}` : `${m[1]}${numToCol(v)}${m[3]}${m[4]}`;
  if (parts.length === 1) return put(a!, span[0]);
  return `${put(a!, span[0])}:${put(b!, span[1])}`;
}

function sheetPrefixName(prefix: string) {
  const p = prefix.slice(0, -1);
  return p.startsWith("'") ? p.slice(1, -1).replace(/''/g, "'") : p;
}

const TOKEN =
  /("(?:[^"]|"")*")|((?:'(?:[^']|'')+'|[A-Za-z_][\w.]*)!)?(\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?)(?![\w(])/g;

/** Rewrite each cell reference in a formula. `fn` receives (sheetName|null, ref) → new ref. */
export function mapFormulaRefs(formula: string, fn: (sheet: string | null, ref: string) => string) {
  return formula.replace(TOKEN, (m, str: string | undefined, prefix: string | undefined, ref: string, off: number, all: string) => {
    if (str) return m;
    const prev = all[off - 1];
    if (!prefix && prev && /[A-Za-z_\d.]/.test(prev)) return m;
    const out = fn(prefix ? sheetPrefixName(prefix) : null, ref);
    return out === "#REF!" ? "#REF!" : `${prefix ?? ""}${out}`;
  });
}

export class WorkbookEditor {
  cache = new Map<string, string>();
  constructor(public zip: JSZip, public sheets: Sheet[]) {}

  async read(path: string) {
    if (!this.cache.has(path)) this.cache.set(path, (await this.zip.file(path)?.async("string")) ?? "");
    return this.cache.get(path)!;
  }
  write(path: string, xml: string) {
    this.cache.set(path, xml);
  }
  flush() {
    for (const [p, x] of this.cache) this.zip.file(p, x);
  }
  sheet(name: string) {
    const s = this.sheets.find((x) => x.name === name);
    if (!s) throw new Error(`sheet "${name}" not found`);
    return s;
  }

  /** Apply a row/column shift on `target` sheet across the whole workbook. */
  async shift(target: string, s: Shift) {
    const tSheet = this.sheet(target);
    for (const sh of this.sheets) {
      let xml = await this.read(sh.path);
      const own = sh.name === target;
      xml = xml.replace(/<f\b([^>]*)>([\s\S]*?)<\/f>/g, (_m, attrs: string, body: string) => {
        const f = mapFormulaRefs(decode(body), (sheet, ref) =>
          (sheet ? sheet === target : own) ? shiftRefText(ref, s) : ref,
        );
        let a = attrs;
        if (own) a = a.replace(/\bref="([^"]+)"/, (_x, r: string) => `ref="${shiftRefText(r, s)}"`);
        return `<f${a}>${encode(f)}</f>`;
      });
      if (own) {
        // Move cells and rows.
        xml = xml.replace(/<row\b[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g, (row) => {
          const r = Number(row.match(/\br="(\d+)"/)?.[1] ?? 0);
          if (s.axis === "row") {
            const nr = shiftIndex(r, s);
            if (nr === null) return "";
            return row
              .replace(/(<row\b[^>]*\br=")\d+"/, `$1${nr}"`)
              .replace(/(<c\b[^>]*\br=")([A-Z]+)\d+"/g, `$1$2${nr}"`);
          }
          return row.replace(/<c\b[^>]*\br="([A-Z]+)(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g, (cell, col: string, rn: string) => {
            const nc = shiftIndex(colToNum(col), s);
            if (nc === null) return "";
            return cell.replace(/\br="[A-Z]+\d+"/, `r="${numToCol(nc)}${rn}"`);
          }).replace(/\bspans="[^"]*"/, "");
        });
        if (s.axis === "col") {
          xml = xml.replace(/<col\b([^>]*)\/>/g, (c, attrs: string) => {
            const min = Number(attrs.match(/\bmin="(\d+)"/)?.[1]);
            const max = Number(attrs.match(/\bmax="(\d+)"/)?.[1]);
            const span = shiftSpan(min, max, s);
            if (!span) return "";
            return c.replace(/\bmin="\d+"/, `min="${span[0]}"`).replace(/\bmax="\d+"/, `max="${span[1]}"`);
          });
        }
        const fixSqref = (v: string) =>
          v.split(/\s+/).map((r) => shiftRefText(r, s)).filter((r) => r !== "#REF!").join(" ");
        xml = xml.replace(/<mergeCell\b[^>]*\bref="([^"]+)"[^>]*\/>/g, (m, r: string) => {
          const n = shiftRefText(r, s);
          return n === "#REF!" ? "" : m.replace(r, n);
        });
        xml = xml.replace(/\bsqref="([^"]+)"/g, (_m, v: string) => `sqref="${fixSqref(v)}"`);
        xml = xml.replace(/<dimension\b[^>]*\/>/, "");
        xml = xml.replace(/<mergeCells count="\d+">/, () => {
          const n = (xml.match(/<mergeCell\b/g) ?? []).length;
          return `<mergeCells count="${n}">`;
        });
      }
      this.write(sh.path, xml);
    }
    await this.fixDefinedNames((sheet, ref) => (sheet === target ? shiftRefText(ref, s) : ref));
    void tSheet;
  }

  async fixDefinedNames(fn: (sheet: string | null, ref: string) => string) {
    let wb = await this.read("xl/workbook.xml");
    wb = wb.replace(/(<definedName\b[^>]*>)([\s\S]*?)(<\/definedName>)/g, (_m, a: string, body: string, c: string) =>
      `${a}${encode(mapFormulaRefs(decode(body), fn))}${c}`,
    );
    this.write("xl/workbook.xml", wb);
  }

  async clearRange(sheetName: string, range: string) {
    const sh = this.sheet(sheetName);
    const [a, b = a] = range.replace(/\$/g, "").split(":");
    const r1 = Number(a!.match(/\d+/)![0]), r2 = Number(b!.match(/\d+/)![0]);
    const c1 = colToNum(a!.match(/[A-Z]+/)![0]), c2 = colToNum(b!.match(/[A-Z]+/)![0]);
    let xml = await this.read(sh.path);
    xml = xml.replace(/<c\b[^>]*\br="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>[\s\S]*?<\/c>)/g, (cell, col: string, rn: string) => {
      const c = colToNum(col), r = Number(rn);
      if (r < r1 || r > r2 || c < c1 || c > c2) return cell;
      const style = cell.match(/\bs="(\d+)"/)?.[1];
      return `<c r="${col}${rn}"${style ? ` s="${style}"` : ""}/>`;
    });
    this.write(sh.path, xml);
  }

  /** Copy a block of cells (values, formulas, styles) to a new top-left position; relative refs move with it. */
  async copyRange(sheetName: string, source: string, target: string, targetSheet?: string) {
    const src = this.sheet(sheetName);
    const dst = this.sheet(targetSheet ?? sheetName);
    const [a, b = a] = source.replace(/\$/g, "").split(":");
    const r1 = Number(a!.match(/\d+/)![0]), r2 = Number(b!.match(/\d+/)![0]);
    const c1 = colToNum(a!.match(/[A-Z]+/)![0]), c2 = colToNum(b!.match(/[A-Z]+/)![0]);
    const tr = Number(target.match(/\d+/)![0]), tc = colToNum(target.match(/[A-Z]+/)![0]);
    const dr = tr - r1, dc = tc - c1;
    const srcXml = await this.read(src.path);
    const cells: { ref: string; xml: string }[] = [];
    const skipped: string[] = [];
    for (const m of srcXml.matchAll(/<c\b[^>]*\br="([A-Z]+)(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)) {
      const c = colToNum(m[1]!), r = Number(m[2]);
      if (r < r1 || r > r2 || c < c1 || c > c2) continue;
      const ref = `${numToCol(c + dc)}${r + dr}`;
      let cx = m[0].replace(/\br="[A-Z]+\d+"/, `r="${ref}"`);
      if (/<f\b[^>]*t="shared"[^>]*\/>/.test(cx) || /<f\b[^>]*t="shared"/.test(cx)) {
        // Shared formulas can't be copied as-is; keep the cached value only.
        cx = cx.replace(/<f\b[^>]*\/>|<f\b[^>]*>[\s\S]*?<\/f>/, "");
        skipped.push(`${m[1]}${m[2]} (shared formula copied as value)`);
      }
      cx = cx.replace(/<f\b([^>]*)>([\s\S]*?)<\/f>/, (_x, at: string, body: string) => {
        const f = mapFormulaRefs(decode(body), (_sheet, rf) =>
          rf.split(":").map((p) => {
            const q = p.match(new RegExp(`^${REF.source}$`));
            if (!q) return p;
            const col = q[1] ? q[2]! : numToCol(colToNum(q[2]!) + dc);
            const row = q[3] ? Number(q[4]) : Number(q[4]) + dr;
            return `${q[1]}${col}${q[3]}${row}`;
          }).join(":"),
        );
        return `<f${at}>${encode(f)}</f>`;
      });
      cx = cx.replace(/<v>[\s\S]*?<\/v>/, (v) => (/<f\b/.test(cx) ? "" : v));
      cells.push({ ref, xml: cx });
    }
    let xml = await this.read(dst.path);
    for (const cell of cells) xml = upsertCellXml(xml, cell.ref, cell.xml);
    this.write(dst.path, xml);
    return skipped;
  }

  async copySheet(name: string, newName: string) {
    const src = this.sheet(name);
    if (this.sheets.some((s) => s.name === newName)) throw new Error(`sheet "${newName}" already exists`);
    let n = this.sheets.length + 1;
    while (this.zip.file(`xl/worksheets/sheet${n}.xml`)) n++;
    const path = `xl/worksheets/sheet${n}.xml`;
    let xml = await this.read(src.path);
    const notes: string[] = [];
    if (this.zip.file(src.path.replace("worksheets/", "worksheets/_rels/") + ".rels")) {
      xml = xml
        .replace(/<drawing\b[^>]*\/>|<legacyDrawing\b[^>]*\/>|<picture\b[^>]*\/>/g, "")
        .replace(/<tableParts\b[\s\S]*?<\/tableParts>|<tableParts\b[^>]*\/>/g, "")
        .replace(/<hyperlinks>[\s\S]*?<\/hyperlinks>/g, "");
      notes.push("charts, tables, images and hyperlinks on the source sheet were not duplicated");
    }
    xml = xml.replace(/<sheetView\b([^>]*)\btabSelected="1"/, "<sheetView$1");
    this.write(path, xml);
    const rels = await this.read("xl/_rels/workbook.xml.rels");
    let rid = 1;
    while (rels.includes(`Id="rId${rid}"`)) rid++;
    this.write(
      "xl/_rels/workbook.xml.rels",
      rels.replace("</Relationships>", `<Relationship Id="rId${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n}.xml"/></Relationships>`),
    );
    const ct = await this.read("[Content_Types].xml");
    this.write(
      "[Content_Types].xml",
      ct.replace("</Types>", `<Override PartName="/${path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`),
    );
    let wb = await this.read("xl/workbook.xml");
    const ids = [...wb.matchAll(/<sheet\b[^>]*\bsheetId="(\d+)"/g)].map((m) => Number(m[1]));
    const sheetId = Math.max(0, ...ids) + 1;
    const safe = newName.replace(/[\\/?*[\]:]/g, " ").slice(0, 31);
    wb = wb.replace("</sheets>", `<sheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" name="${encode(safe).replace(/"/g, "&quot;")}" sheetId="${sheetId}" r:id="rId${rid}"/></sheets>`);
    this.write("xl/workbook.xml", wb);
    this.sheets.push({ name: safe, path, rid: `rId${rid}` });
    return notes;
  }

  async deleteSheet(name: string) {
    const sh = this.sheet(name);
    if (this.sheets.length <= 1) throw new Error("cannot delete the only sheet");
    const index = this.sheets.indexOf(sh);
    let wb = await this.read("xl/workbook.xml");
    wb = wb.replace(new RegExp(`<sheet\\b[^>]*\\b\\w+:id="${escRe(sh.rid)}"[^>]*/>`), "");
    wb = wb.replace(/<definedName\b([^>]*)>([\s\S]*?)<\/definedName>/g, (m, attrs: string) => {
      const local = attrs.match(/\blocalSheetId="(\d+)"/);
      if (!local) return m;
      const li = Number(local[1]);
      if (li === index) return "";
      return li > index ? m.replace(/\blocalSheetId="\d+"/, `localSheetId="${li - 1}"`) : m;
    });
    wb = wb.replace(/<definedNames>\s*<\/definedNames>/, "");
    wb = wb.replace(/\bactiveTab="\d+"/, 'activeTab="0"');
    this.write("xl/workbook.xml", wb);
    const rels = await this.read("xl/_rels/workbook.xml.rels");
    this.write("xl/_rels/workbook.xml.rels", rels.replace(new RegExp(`<Relationship\\b[^>]*\\bId="${escRe(sh.rid)}"[^>]*/>`), ""));
    const ct = await this.read("[Content_Types].xml");
    this.write("[Content_Types].xml", ct.replace(new RegExp(`<Override\\b[^>]*PartName="/${escRe(sh.path)}"[^>]*/>`), ""));
    this.cache.delete(sh.path);
    this.zip.remove(sh.path);
    this.sheets.splice(index, 1);
    // References into the deleted sheet become #REF!.
    for (const other of this.sheets) {
      const xml = await this.read(other.path);
      this.write(
        other.path,
        xml.replace(/<f\b([^>]*)>([\s\S]*?)<\/f>/g, (_m, a: string, body: string) =>
          `<f${a}>${encode(mapFormulaRefs(decode(body), (s, r) => (s === name ? "#REF!" : r)))}</f>`,
        ),
      );
    }
    await this.fixDefinedNames((s, r) => (s === name ? "#REF!" : r));
  }
}

/** Insert or replace a cell (full `<c>` XML) keeping row/column order. */
export function upsertCellXml(xml: string, ref: string, cellXml: string) {
  const cellRe = new RegExp(`<c\\b[^>]*\\br="${ref}"[^>]*?(?:/>|>[\\s\\S]*?</c>)`);
  const existing = xml.match(cellRe)?.[0];
  if (existing) return xml.replace(existing, cellXml);
  const r = Number(ref.match(/\d+$/)![0]);
  const col = colToNum(ref.match(/^[A-Z]+/)![0]);
  const rowRe = new RegExp(`<row\\b[^>]*\\br="${r}"[^>]*?(?:/>|>([\\s\\S]*?)</row>)`);
  const row = xml.match(rowRe);
  if (row) {
    const whole = row[0];
    if (whole.endsWith("/>")) return xml.replace(whole, `${whole.slice(0, -2).replace(/\sspans="[^"]*"/, "")}>${cellXml}</row>`);
    const inner = row[1] ?? "";
    const cells = [...inner.matchAll(/<c\b[^>]*\br="([A-Z]+)\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)];
    const after = cells.find((c) => colToNum(c[1] ?? "") > col);
    const newInner = after ? inner.replace(after[0], cellXml + after[0]) : inner + cellXml;
    const open = whole.slice(0, whole.indexOf(">") + 1).replace(/\sspans="[^"]*"/, "");
    return xml.replace(whole, `${open}${newInner}</row>`);
  }
  const rows = [...xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g)];
  const next = rows.find((m) => Number(m[1]) > r);
  const newRow = `<row r="${r}">${cellXml}</row>`;
  if (next) return xml.replace(next[0], newRow + next[0]);
  if (xml.includes("<sheetData/>")) return xml.replace("<sheetData/>", `<sheetData>${newRow}</sheetData>`);
  return xml.replace("</sheetData>", `${newRow}</sheetData>`);
}

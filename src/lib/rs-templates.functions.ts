import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BUCKET = "rs-templates";

const safeName = (name: string) => name.replace(/[\\/]+/g, "_").slice(0, 200);
const slugify = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Stores an uploaded master Generic RS template (.xlsx) in Cloud storage. */
export const uploadMasterTemplate = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ fileName: z.string().min(1).max(200), base64: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { requireDeveloper } = await import("./developer-session.server");
    await requireDeveloper();
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const sb = await admin();
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(`masters/${safeName(data.fileName)}`, bytes, {
        upsert: true,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    if (error) throw new Error(`Could not save the template: ${error.message}`);
    return { ok: true };
  });

export const listMasterTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const { requireDeveloper } = await import("./developer-session.server");
  await requireDeveloper();
  const sb = await admin();
  const { data, error } = await sb.storage.from(BUCKET).list("masters", { limit: 100 });
  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => f.name);
});

export const getTemplateDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { requireDeveloper } = await import("./developer-session.server");
    await requireDeveloper();
    const sb = await admin();
    const { data: signed, error } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(data.path, 60 * 10, { download: data.path.split("/").pop() ?? true });
    if (error || !signed) throw new Error(error?.message ?? "Could not create download link");
    return { url: signed.signedUrl };
  });

function pickMaster(files: string[], base: string) {
  if (files.includes(base)) return base;
  const key = /sotp/i.test(base) ? /sotp/i : /consolidated/i;
  return files.find((f) => key.test(f) && /\.xlsx$/i.test(f));
}

const SYSTEM = `You are an expert Excel financial-model engineer adapting an IFC Real Sector generic valuation template to a specific sub-sector.
You receive: a map of the workbook (each non-empty cell with its value or formula, plus named ranges), the Developer Specifications Summary, and the developer's selected prompt(s).

GOVERNING RULE: Preserve the Generic workbook exactly unless a change is explicitly required by the Developer Specifications Summary or the selected prompt(s).
- Structural changes (inserting/deleting rows or columns, copying or deleting revenue-stream blocks, copying or deleting sheets, building SOTP structures, relinking formulas) are allowed ONLY when those sources instruct them.
- Make no stylistic, cosmetic or "improvement" changes that were not instructed.
- The application applies your operations surgically, in order. Everything you do not touch stays byte-identical, and references in formulas, named ranges, merged cells and validations are shifted automatically for row/column/sheet operations.
- Operations run sequentially: coordinates in each operation refer to the workbook AFTER all previous operations.
- Use exact sheet names and A1 references from the map.

Available operations (JSON objects):
{"op":"set_cell","sheet":"S","cell":"B4","kind":"text|number|formula","value":"...","reason":"..."}   (formula values start with =)
{"op":"insert_rows","sheet":"S","at":12,"count":3,"reason":"..."}   (new blank rows start at row 12)
{"op":"delete_rows","sheet":"S","at":12,"count":3,"reason":"..."}
{"op":"insert_columns","sheet":"S","at":"F","count":2,"reason":"..."}
{"op":"delete_columns","sheet":"S","at":"F","count":2,"reason":"..."}
{"op":"copy_range","sheet":"S","source":"A10:M25","target":"A30","targetSheet":"optional","reason":"..."}   (copies values, formulas and formats; relative references move with the block)
{"op":"clear_range","sheet":"S","range":"A10:M25","reason":"..."}   (clears contents, keeps formatting)
{"op":"copy_sheet","sheet":"S","newName":"S (Stream 2)","reason":"..."}
{"op":"delete_sheet","sheet":"S","reason":"..."}
Every operation must have a reason citing the instruction that requires it (e.g. "Prompt A-001 step 2", "Spec: Units Sold in MT").

Reply with ONLY a JSON object: {"summary":"<2-5 sentences>","operations":[...]}`;

async function callClaude(userContent: string) {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) throw new Error("Your Anthropic API key is not configured.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-5",
      max_tokens: 16000,
      stream: true,
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Anthropic rejected your API key. Please check or replace it.");
    if (res.status === 429) throw new Error("Your Anthropic account is rate-limited right now. Please try again in a minute.");
    if (res.status === 400 && /credit/i.test(body)) throw new Error("Your Anthropic account has insufficient credit.");
    throw new Error(`Claude request failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let stop = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      try {
        const evt = JSON.parse(dataLine.slice(5).trim());
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") text += evt.delta.text;
        if (evt.type === "message_delta" && evt.delta?.stop_reason) stop = evt.delta.stop_reason;
        if (evt.type === "error") throw new Error(evt.error?.message ?? "Claude stream error");
      } catch (e) {
        if (e instanceof Error && !/JSON/.test(e.message)) throw e;
      }
    }
  }
  if (stop === "refusal") throw new Error("Claude declined to process this request.");
  return text;
}

/** Selected base Generic template + spec summary + prompts → Claude → adapted .xlsx in storage. */
export const adaptSubsectorTemplate = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        subsector: z.string().min(1).max(200),
        baseTemplate: z.string().min(1).max(200),
        instructions: z.string().max(20000),
        specificationSummary: z.string().max(5000),
        prompts: z
          .array(z.object({ id: z.string(), title: z.string(), text: z.string().max(60000) }))
          .max(30),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireDeveloper } = await import("./developer-session.server");
    await requireDeveloper();
    const { describeWorkbook, applyOperations } = await import("./xlsx-surgery.server");
    const sb = await admin();

    const { data: list } = await sb.storage.from(BUCKET).list("masters", { limit: 100 });
    const master = pickMaster((list ?? []).map((f) => f.name), data.baseTemplate);
    if (!master) {
      throw new Error(
        `The master file "${data.baseTemplate}" has not been uploaded yet. Upload it in Core Information → Generic RS Templates, then regenerate.`,
      );
    }
    const { data: blob, error } = await sb.storage.from(BUCKET).download(`masters/${master}`);
    if (error || !blob) throw new Error(`Could not read the master template: ${error?.message}`);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const map = await describeWorkbook(bytes);
    const promptBlock = data.prompts.length
      ? data.prompts.map((p) => `--- Prompt ${p.id}: ${p.title} ---\n${p.text}`).join("\n\n")
      : "(no additional prompts selected)";
    const userContent = `Sub-sector: ${data.subsector}
Base generic template: ${master}

DEVELOPER SPECIFICATIONS SUMMARY
${data.specificationSummary}

DEVELOPER INSTRUCTION
${data.instructions}

SELECTED PROMPTS
${promptBlock}

WORKBOOK MAP
${map}`;

    const reply = await callClaude(userContent);
    const json = reply.match(/\{[\s\S]*\}/)?.[0];
    let parsed: { summary?: string; operations?: unknown[]; edits?: unknown[] } = {};
    try {
      parsed = json ? JSON.parse(json) : {};
    } catch {
      throw new Error("Claude's reply could not be read. Please regenerate.");
    }
    const reason = z.string().optional();
    const opSchema = z.discriminatedUnion("op", [
      z.object({ op: z.literal("set_cell"), sheet: z.string(), cell: z.string(), kind: z.enum(["text", "number", "formula"]), value: z.union([z.string(), z.number()]).transform(String), reason }),
      z.object({ op: z.enum(["insert_rows", "delete_rows"]), sheet: z.string(), at: z.coerce.number().int(), count: z.coerce.number().int(), reason }),
      z.object({ op: z.enum(["insert_columns", "delete_columns"]), sheet: z.string(), at: z.string(), count: z.coerce.number().int(), reason }),
      z.object({ op: z.literal("copy_range"), sheet: z.string(), source: z.string(), target: z.string(), targetSheet: z.string().optional(), reason }),
      z.object({ op: z.literal("clear_range"), sheet: z.string(), range: z.string(), reason }),
      z.object({ op: z.literal("copy_sheet"), sheet: z.string(), newName: z.string().min(1), reason }),
      z.object({ op: z.literal("delete_sheet"), sheet: z.string(), reason }),
    ]);
    const rawOps = parsed.operations ?? (parsed.edits ?? []).map((e) => ({ op: "set_cell", ...(e as object) }));
    const invalid: string[] = [];
    const ops = rawOps.flatMap((o) => {
      const r = opSchema.safeParse(o);
      if (!r.success) {
        invalid.push(`Unrecognised operation ignored: ${JSON.stringify(o).slice(0, 160)}`);
        return [];
      }
      // Drop undefined optionals (exactOptionalPropertyTypes).
      return [JSON.parse(JSON.stringify(r.data))];
    });

    const result = await applyOperations(bytes, ops);
    const fileName = `Default_Template_${slugify(data.subsector)}.xlsx`;
    const path = `subsectors/${slugify(data.subsector)}/${fileName}`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, result.bytes, {
      upsert: true,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    if (upErr) throw new Error(`Could not save the adapted template: ${upErr.message}`);

    return {
      fileName,
      path,
      masterUsed: master,
      summary: parsed.summary ?? "",
      applied: result.applied,
      skipped: [...result.skipped, ...invalid],
    };
  });

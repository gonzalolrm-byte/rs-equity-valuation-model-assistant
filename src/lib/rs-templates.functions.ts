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
      .createSignedUrl(data.path, 60 * 10, { download: data.path.split("/").pop() });
    if (error || !signed) throw new Error(error?.message ?? "Could not create download link");
    return { url: signed.signedUrl };
  });

function pickMaster(files: string[], base: string) {
  if (files.includes(base)) return base;
  const key = /sotp/i.test(base) ? /sotp/i : /consolidated/i;
  return files.find((f) => key.test(f) && /\.xlsx$/i.test(f));
}

const SYSTEM = `You are an expert Excel financial-model engineer adapting an IFC Real Sector generic valuation template to a specific sub-sector.
You receive: a map of the workbook (each non-empty cell with its value or formula), the developer's specification summary, and the developer's prompt(s).
Decide the MINIMUM set of cell edits needed to apply the instructions. The application applies your edits surgically; everything you do not edit stays byte-for-byte identical (formulas, formatting, named ranges, links, validations).
Rules:
- Never restructure the workbook: do not add/remove sheets, rows or columns.
- Prefer changing labels, units text, and input/assumption cells. Only change a formula if a prompt explicitly requires it, and keep references valid.
- Use exact sheet names and A1 cell references from the map.
- kind "text" for labels, "number" for numeric inputs, "formula" for formulas (start with =).
Reply with ONLY a JSON object: {"summary": "<2-4 sentences>", "edits": [{"sheet": "...", "cell": "B4", "kind": "text", "value": "...", "reason": "..."}]}`;

async function callClaude(userContent: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-5",
      max_tokens: 16000,
      stream: true,
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    if (res.status === 402) throw new Error("AI credits are used up. Add credits to continue.");
    if (res.status === 429) throw new Error("The AI is busy right now. Please try again in a minute.");
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
    const { describeWorkbook, applyEdits } = await import("./xlsx-surgery.server");
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
    let parsed: { summary?: string; edits?: unknown[] } = {};
    try {
      parsed = json ? JSON.parse(json) : {};
    } catch {
      throw new Error("Claude's reply could not be read. Please regenerate.");
    }
    const editSchema = z.object({
      sheet: z.string(),
      cell: z.string(),
      kind: z.enum(["text", "number", "formula"]),
      value: z.union([z.string(), z.number()]).transform(String),
      reason: z.string().optional(),
    });
    const edits = (parsed.edits ?? []).flatMap((e) => {
      const r = editSchema.safeParse(e);
      return r.success ? [r.data] : [];
    });

    const result = await applyEdits(bytes, edits);
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
      applied: result.applied.map((e) => `${e.sheet}!${e.cell} → ${e.value}${e.reason ? ` (${e.reason})` : ""}`),
      skipped: result.skipped.map((e) => `${e.sheet}!${e.cell}: ${e.why}`),
    };
  });

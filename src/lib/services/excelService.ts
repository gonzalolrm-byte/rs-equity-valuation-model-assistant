/**
 * Excel model processing abstraction.
 *
 * PROTOTYPE: the workbook is not produced. This returns the metadata the UI
 * displays and a placeholder download so the workflow can be validated.
 * Phase 2: deterministic server-side workbook manipulation that preserves
 * worksheets, formulas, formatting and links. See ./README.md.
 */

export type GeneratedModel = {
  fileName: string;
  generatedAt: string;
  templateUsed: string;
  appliedActions: string[];
  simulated: true;
};

const slug = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "Company";

export function buildModel(input: {
  companyName: string;
  templateUsed: string;
  appliedActions: string[];
  prefix?: string;
}): GeneratedModel {
  const stamp = new Date();
  const quarter = `${stamp.getUTCFullYear()}Q${Math.floor(stamp.getUTCMonth() / 3) + 1}`;
  return {
    fileName: `${input.prefix ?? "IFC_Standardized_DCF"}_${slug(input.companyName)}_${quarter}.xlsx`,
    generatedAt: stamp.toISOString(),
    templateUsed: input.templateUsed,
    appliedActions: input.appliedActions,
    simulated: true,
  };
}

/**
 * PROTOTYPE download: writes a small text manifest instead of a workbook so it
 * is obvious no real model was produced.
 */
export function downloadModel(model: GeneratedModel, missing: string[]) {
  const lines = [
    "IFC VALUATION ASSISTANT — PROTOTYPE OUTPUT",
    "",
    "This is not a valuation model. The Excel generation engine is not",
    "connected in this prototype build.",
    "",
    `File name reserved: ${model.fileName}`,
    `Generated: ${new Date(model.generatedAt).toUTCString()}`,
    `Template: ${model.templateUsed}`,
    "",
    "Actions applied:",
    ...model.appliedActions.map((action) => `  - ${action}`),
    "",
    "Unresolved inputs:",
    ...(missing.length ? missing.map((item) => `  - ${item}`) : ["  none"]),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = model.fileName.replace(/\.xlsx$/, "_PROTOTYPE.txt");
  anchor.click();
  URL.revokeObjectURL(url);
}

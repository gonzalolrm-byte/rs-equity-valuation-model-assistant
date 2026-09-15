/**
 * Client-side extraction of plain text from uploaded prompt documents.
 *
 * Kept separate from UI so a future backend parsing endpoint can replace the
 * implementation without touching the Developer Console.
 */

export type ExtractedDocument = {
  fileName: string;
  text: string;
};

const DOCX_EXTENSIONS = [".docx"];
const TEXT_EXTENSIONS = [".txt", ".md"];

function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index).toLowerCase();
}

async function extractDocx(file: File) {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const buffer = await file.arrayBuffer();
  const result = await (mammoth as { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> })
    .extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function extractPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }
  return pages.filter(Boolean).join("\n\n");
}

export async function extractPromptText(file: File): Promise<ExtractedDocument> {
  const extension = extensionOf(file.name);

  if (DOCX_EXTENSIONS.includes(extension)) {
    return { fileName: file.name, text: (await extractDocx(file)).trim() };
  }
  if (extension === ".pdf") {
    return { fileName: file.name, text: (await extractPdf(file)).trim() };
  }
  if (TEXT_EXTENSIONS.includes(extension)) {
    return { fileName: file.name, text: (await file.text()).trim() };
  }
  if (extension === ".doc") {
    throw new Error(
      "Legacy .doc files are not supported. Please save the file as .docx or PDF and upload again.",
    );
  }
  throw new Error("Unsupported file type. Upload a Word (.docx), PDF, or plain text file.");
}

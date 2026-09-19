import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Info, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { EditableText } from "@/lib/ui-content";

export const Route = createFileRoute("/developer/generic-templates")({
  head: () => ({
    meta: [
      { title: "Generic DCF Templates — Developer Console" },
      {
        name: "description",
        content:
          "Upload and manage the generic DCF templates used when no sector-specific template applies, including unit economics and percentage based models.",
      },
      { property: "og:title", content: "Generic DCF Templates — Developer Console" },
      {
        property: "og:description",
        content: "Manage the generic DCF templates available to the valuation model assistant.",
      },
    ],
  }),
  component: GenericTemplates,
});

type GenericTemplate = {
  id: string;
  name: string;
  description: string;
  files: string[];
};

const INITIAL_TEMPLATES: GenericTemplate[] = [
  {
    id: "generic-unit-economics",
    name: "Generic - Unit Economics",
    description:
      "Standardized DCF template driven by units sold and price per unit, used when the company does not fit a sector-specific template.",
    files: [],
  },
  {
    id: "generic-percentage-based",
    name: "Generic - Percentage Based",
    description:
      "Standardized DCF template driven by revenue growth rates and margin percentages, without operational volume drivers.",
    files: [],
  },
];

function GenericTemplates() {
  const [templates, setTemplates] = useState<GenericTemplate[]>(INITIAL_TEMPLATES);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const update = (id: string, change: Partial<GenericTemplate>) =>
    setTemplates((prev) => prev.map((item) => (item.id === id ? { ...item, ...change } : item)));

  const submit = () => {
    if (!name.trim()) return;
    setTemplates((prev) => [
      ...prev,
      {
        id: `generic-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || "No description provided.",
        files: [],
      },
    ]);
    setName("");
    setDescription("");
    setAdding(false);
  };

  return (
    <div>
      <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Generic DCF Templates">
        Generic DCF Templates
      </EditableText>
      <EditableText as="p" className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground" group="Generic DCF Templates">
        Upload the generic standardized DCF templates used when a company does not match a sector-specific template. These files are visible to developers only.
      </EditableText>

      <div className="mt-6 space-y-4">
        {templates.map((template) => (
          <TemplateRow
            key={template.id}
            template={template}
            onChange={(change) => update(template.id, change)}
            onDelete={() => setTemplates((prev) => prev.filter((item) => item.id !== template.id))}
          />
        ))}
      </div>

      {adding ? (
        <section className="mt-4 rounded-xl border border-primary/40 bg-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[16px] font-bold">New generic template</h2>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Cancel new generic template"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            <label className="text-[13px] font-semibold text-navy">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Generic - Asset Heavy"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
            <label className="text-[13px] font-semibold text-navy">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="What this template is used for."
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="size-4" />
            Add template
          </button>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Plus className="size-4" />
          Add new generic template
        </button>
      )}

      <div className="mt-6 flex gap-3 rounded-xl border border-panel-border bg-panel p-5">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-navy-soft">
          Supported formats: Excel (.xlsx, .xls) and PDF (.pdf). Uploading a new file replaces the
          previous version of that template.
        </p>
      </div>
    </div>
  );
}

function TemplateRow({
  template,
  onChange,
  onDelete,
}: {
  template: GenericTemplate;
  onChange: (change: Partial<GenericTemplate>) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-[16px] font-bold">{template.name}</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-navy-soft">
              Generic DCF
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {template.description}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            <span className={template.files.length ? "text-success" : "text-warning"}>
              {template.files.length} file(s)
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3.5 py-2 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          Remove
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Upload className="size-4" />
          Upload / Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.pdf"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              onChange({ files: Array.from(event.target.files).map((file) => file.name) });
            }
            event.target.value = "";
          }}
        />
      </div>

      {template.files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {template.files.map((file) => (
            <li
              key={file}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
            >
              <FileSpreadsheet className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{file}</span>
              <button
                type="button"
                onClick={() =>
                  onChange({ files: template.files.filter((item) => item !== file) })
                }
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

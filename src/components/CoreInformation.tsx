import { ArrowLeft, FileSpreadsheet, Info, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { ResourceKind } from "@/lib/data";
import { useApp } from "@/lib/store";
import { EditableText } from "@/lib/ui-content";

export function CoreBackButton() {
  return (
    <Link
      to="/developer/resources"
      className="inline-flex items-center gap-1.5 rounded-lg border border-panel-border bg-panel px-3 py-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:bg-card hover:text-navy"
    >
      <ArrowLeft className="size-4" />
      Back to overview
    </Link>
  );
}

export function CoreSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Core Information">
        {title}
      </EditableText>
      <EditableText
        as="p"
        className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground"
        group="Core Information"
      >
        {description}
      </EditableText>
    </div>
  );
}

export function CoreInfoNote() {
  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-panel-border bg-panel p-5">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-[13px] leading-relaxed text-navy-soft">
        These files are used by the application to extract data, populate models and provide
        reference information. They are not visible to end users. Supported formats: Excel (.xlsx,
        .xls) and PDF (.pdf).
      </p>
    </div>
  );
}

/** Add-entry form, locked to a single resource kind. */
export function AddResourceSection({ kind, label }: { kind: ResourceKind; label: string }) {
  const { addResource } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    addResource({
      name: name.trim(),
      description: description.trim() || "No description provided.",
      kind,
    });
    setName("");
    setDescription("");
    setAdding(false);
  };

  return (
    <section className="mt-8 rounded-xl border border-panel-border bg-panel p-5">
      <EditableText as="h2" className="block font-heading text-[16px] font-bold" group="Core Information">
        {`Add new ${label}`}
      </EditableText>
      {adding ? (
        <div className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-semibold text-navy">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Country Risk Premium Report"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
            <label className="text-[13px] font-semibold text-navy sm:col-span-2">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="What this file is used for."
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add entry
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <X className="size-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Plus className="size-4" />
          {`Add new ${label}`}
        </button>
      )}
    </section>
  );
}

export type GenericTemplate = {
  id: string;
  name: string;
  description: string;
  files: string[];
};

const INITIAL_GENERIC_TEMPLATES: GenericTemplate[] = [
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

export function GenericTemplatesSection() {
  const {
    state,
    setGenericTemplateFiles,
    removeGenericTemplateFile,
    removeGenericTemplate,
  } = useApp();

  const templates = INITIAL_GENERIC_TEMPLATES.filter(
    (template) => !state.removedGenericTemplates.includes(template.id),
  ).map((template) => ({
    ...template,
    files: state.genericTemplateFiles[template.id] ?? [],
  }));

  return (
    <div className="mt-4 space-y-4">
      {templates.map((template) => (
        <GenericTemplateRow
          key={template.id}
          template={template}
          onUpload={(files) => setGenericTemplateFiles(template.id, files)}
          onRemoveFile={(fileName) => removeGenericTemplateFile(template.id, fileName)}
          onDelete={() => removeGenericTemplate(template.id)}
        />
      ))}
    </div>
  );
}

function GenericTemplateRow({
  template,
  onUpload,
  onRemoveFile,
  onDelete,
}: {
  template: GenericTemplate;
  onUpload: (files: File[]) => void;
  onRemoveFile: (fileName: string) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-[16px] font-bold">{template.name}</h3>
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
              onUpload(Array.from(event.target.files));
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
                onClick={() => onRemoveFile(file)}
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

export function ResourceList({ kind, emptyLabel }: { kind: ResourceKind; emptyLabel: string }) {
  const { state } = useApp();
  const items = state.resources.filter((resource) => resource.kind === kind);

  return (
    <div className="mt-4 space-y-4">
      {items.length === 0 && <p className="text-[13px] text-muted-foreground">{emptyLabel}</p>}
      {items.map((resource) => (
        <ResourceRow key={resource.id} id={resource.id} />
      ))}
    </div>
  );
}

function ResourceRow({ id }: { id: string }) {
  const { state, replaceResourceFiles, removeResourceFile, deleteResource } = useApp();
  const resource = state.resources.find((item) => item.id === id)!;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-[16px] font-bold">{resource.name}</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-navy-soft">
              {resource.kind === "template"
                ? "Template"
                : resource.kind === "reference"
                  ? "Reference data"
                  : "Guideline"}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {resource.description}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Last updated {resource.lastUpdated} ·{" "}
            <span className={resource.files.length ? "text-success" : "text-warning"}>
              {resource.files.length} file(s)
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => deleteResource(resource.id)}
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
              replaceResourceFiles(resource.id, Array.from(event.target.files));
            }
            event.target.value = "";
          }}
        />
      </div>

      {resource.files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {resource.files.map((file) => (
            <li
              key={file}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
            >
              <FileSpreadsheet className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{file}</span>
              <button
                type="button"
                onClick={() => removeResourceFile(resource.id, file)}
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

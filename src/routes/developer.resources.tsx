import { createFileRoute } from "@tanstack/react-router";
import { EditableText } from "@/lib/ui-content";
import { FileSpreadsheet, Info, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ResourceKind } from "@/lib/data";
import { useApp } from "@/lib/store";


export const Route = createFileRoute("/developer/resources")({
  head: () => ({
    meta: [
      { title: "Core Information — Developer Console" },
      {
        name: "description",
        content:
          "Upload and manage the core templates, market data and guidelines used by the application.",
      },
      { property: "og:title", content: "Core Information — Developer Console" },
      {
        property: "og:description",
        content: "Manage the internal templates, reference data and guidelines used to build valuation models.",
      },
    ],
  }),
  component: Resources,
});

function Resources() {
  const { state, addResource } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ResourceKind>("template");

  const templates = state.resources.filter((r) => r.kind === "template");
  const marketData = state.resources.filter((r) => r.kind === "reference");
  const guidelines = state.resources.filter((r) => r.kind === "guideline");

  const submit = () => {
    if (!name.trim()) return;
    addResource({
      name: name.trim(),
      description: description.trim() || "No description provided.",
      kind,
    });
    setName("");
    setDescription("");
    setKind("template");
    setAdding(false);
  };

  return (
    <div>
      <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Core Information">
        2. Core Information
      </EditableText>
      <EditableText as="p" className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground" group="Core Information">
        Upload and manage the core files and data sources used by the application. These files are accessible only to developers and are not visible to users.
      </EditableText>

      <section className="mt-8">
        <EditableText as="h2" className="block font-heading text-lg font-extrabold" group="Core Information">
          Core Templates
        </EditableText>
        <EditableText as="p" className="mt-1 block max-w-3xl text-[13px] leading-relaxed text-muted-foreground" group="Core Information">
          Standardized DCF, waterfall, put and generic templates used to build or update valuation models.
        </EditableText>
        <GenericTemplatesSection />
        <div className="mt-4 space-y-4">
          {templates.map((resource) => (
            <ResourceRow key={resource.id} id={resource.id} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <EditableText as="h2" className="block font-heading text-lg font-extrabold" group="Core Information">
          Core Market Data
        </EditableText>
        <EditableText as="p" className="mt-1 block max-w-3xl text-[13px] leading-relaxed text-muted-foreground" group="Core Information">
          Reference data such as cost of equity reports and macro assumptions that feed into the models.
        </EditableText>
        <div className="mt-4 space-y-4">
          {marketData.length === 0 && (
            <p className="text-[13px] text-muted-foreground">No market data entries yet.</p>
          )}
          {marketData.map((resource) => (
            <ResourceRow key={resource.id} id={resource.id} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <EditableText as="h2" className="block font-heading text-lg font-extrabold" group="Core Information">
          Core Guidelines
        </EditableText>
        <EditableText as="p" className="mt-1 block max-w-3xl text-[13px] leading-relaxed text-muted-foreground" group="Core Information">
          Guidance documents for completing the questionnaire and applying standardized modeling conventions.
        </EditableText>
        <div className="mt-4 space-y-4">
          {guidelines.length === 0 && (
            <p className="text-[13px] text-muted-foreground">No guideline documents yet.</p>
          )}
          {guidelines.map((resource) => (
            <ResourceRow key={resource.id} id={resource.id} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-panel-border bg-panel p-5">
        <EditableText as="h2" className="block font-heading text-[16px] font-bold" group="Core Information">
          Add new entry
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
              <label className="text-[13px] font-semibold text-navy">
                Type
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as ResourceKind)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
                >
                  <option value="template">Template</option>
                  <option value="reference">Reference data</option>
                  <option value="guideline">Guideline</option>
                </select>
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
            Add new entry
          </button>
        )}
      </section>

      <div className="mt-6 flex gap-3 rounded-xl border border-panel-border bg-panel p-5">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-navy-soft">
          These files are used by the application to extract data, populate models and provide
          reference information. They are not visible to end users. Supported formats: Excel (.xlsx,
          .xls) and PDF (.pdf).
        </p>
      </div>
    </div>
  );
}

type GenericTemplate = {
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

function GenericTemplatesSection() {
  const [templates, setTemplates] = useState<GenericTemplate[]>(INITIAL_GENERIC_TEMPLATES);
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
    <section className="mt-8">
      <EditableText as="h2" className="block font-heading text-lg font-extrabold" group="Market Data & Additional Templates">
        Generic DCF Templates
      </EditableText>
      <EditableText as="p" className="mt-1 block max-w-3xl text-[13px] leading-relaxed text-muted-foreground" group="Market Data & Additional Templates">
        Upload the generic standardized DCF templates used when a company does not match a sector-specific template.
      </EditableText>

      <div className="mt-4 space-y-4">
        {templates.map((template) => (
          <GenericTemplateRow
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
            <h3 className="font-heading text-[16px] font-bold">New generic template</h3>
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
    </section>
  );
}

function GenericTemplateRow({
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
              {resource.kind === "template" ? "Template" : "Reference data"}
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

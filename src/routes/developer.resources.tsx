import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Info, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ResourceKind } from "@/lib/data";
import { useApp } from "@/lib/store";


export const Route = createFileRoute("/developer/resources")({
  head: () => ({
    meta: [
      { title: "Market Data & Additional Templates — Developer Console" },
      {
        name: "description",
        content:
          "Upload and manage the standardized DCF templates, waterfall and put templates, cost of equity report and macro tool used by the application.",
      },
      { property: "og:title", content: "Market Data & Additional Templates — Developer Console" },
      {
        property: "og:description",
        content: "Manage the internal templates and reference data used to build valuation models.",
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
      <h1 className="font-heading text-2xl font-extrabold">2. Market Data &amp; Additional Templates</h1>
      <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        Upload and manage the core files and data sources used by the application. These files are
        accessible only to developers and are not visible to users.
      </p>

      <div className="mt-6 space-y-4">
        {state.resources.map((resource) => (
          <ResourceRow key={resource.id} id={resource.id} />
        ))}
      </div>

      {adding ? (
        <section className="mt-4 rounded-xl border border-primary/40 bg-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[16px] font-bold">New entry</h2>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Cancel new entry"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="size-4" />
            Add entry
          </button>
        </section>
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

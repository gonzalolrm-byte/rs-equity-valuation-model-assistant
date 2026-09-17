import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Info, Plus, RotateCcw, Trash2, Upload, Wand2 } from "lucide-react";
import { useRef, useState } from "react";

import {
  CAPACITY_MEASUREMENTS,
  OTHER_MEASUREMENT,
  OUTPUT_MEASUREMENTS,
  SAME_AS_OUTPUT_MEASUREMENT,
  SECTORS,
  SUBSECTORS,
  defaultSubsectorMeasurements,
} from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/developer/sector-specifics")({
  head: () => ({
    meta: [
      { title: "Sector Specifics — Developer Console" },
      {
        name: "description",
        content:
          "Set the default Maximum Output / Units Sold measurement and the capacity measurements offered for each sector and subsector template.",
      },
      { property: "og:title", content: "Sector Specifics — Developer Console" },
      {
        property: "og:description",
        content: "Edit the measurement units applied by default for each sector template.",
      },
    ],
  }),
  component: SectorSpecifics,
});

const GENERIC_TEMPLATES = ["Generic - Unit Economics", "Generic - Percentage Based"];

/** Capacity choices a developer can offer; the two special entries are implicit. */
const CAPACITY_CHOICES = CAPACITY_MEASUREMENTS.filter(
  (unit) => unit !== SAME_AS_OUTPUT_MEASUREMENT && unit !== OTHER_MEASUREMENT,
);

const OUTPUT_CHOICES = OUTPUT_MEASUREMENTS.filter((unit) => unit !== OTHER_MEASUREMENT);

function SectorSpecifics() {
  const { state, addCustomSubsector } = useApp();
  const [sector, setSector] = useState<string>(SECTORS[0]);
  const [newSubsector, setNewSubsector] = useState("");
  const removed = state.removedSubsectors[sector] ?? [];
  const custom = state.customSubsectors[sector] ?? [];
  const subsectors = [
    ...(SUBSECTORS[sector] ?? []).filter((item) => !removed.includes(item)),
    ...custom,
    ...GENERIC_TEMPLATES,
  ];

  const addSubsector = () => {
    const name = newSubsector.trim();
    if (!name) return;
    addCustomSubsector(sector, name);
    setNewSubsector("");
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold">1. Sector Specifics</h1>
      <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        Choose which measurement units are applied by default for each sector template. The default
        Maximum Output / Units Sold unit is pre-selected for users, and only the capacity units you
        check here appear in their capacity dropdown.
      </p>

      <div className="mt-6 max-w-md">
        <label className="block text-[13px] font-semibold text-navy" htmlFor="sector-select">
          Primary sector
        </label>
        <select
          id="sector-select"
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-navy focus:border-primary focus:outline-none"
        >
          {SECTORS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-[13px] font-semibold text-navy" htmlFor="new-subsector">
          Add sub-sector template
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="new-subsector"
            value={newSubsector}
            onChange={(event) => setNewSubsector(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSubsector();
              }
            }}
            placeholder="e.g. Specialty Chemicals"
            className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-navy focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={addSubsector}
            disabled={!newSubsector.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {subsectors.map((subsector) => (
          <SubsectorCard
            key={subsector}
            sector={sector}
            subsector={subsector}
            deletable={!GENERIC_TEMPLATES.includes(subsector)}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-panel-border bg-panel p-5">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-navy-soft">
          Changes apply immediately to new models. Users can still pick a different unit or enter a
          custom one, and “Same as Maximum Output / Units Sold” plus “Other Measurement” are always
          available in the capacity dropdown.
        </p>
      </div>
    </div>
  );
}

function SubsectorCard({
  sector,
  subsector,
  deletable = false,
}: {
  sector: string;
  subsector: string;
  deletable?: boolean;
}) {
  const { state, setSubsectorMeasurements, resetSubsectorMeasurements, deleteSubsector } =
    useApp();
  const shipped = defaultSubsectorMeasurements(subsector, sector);
  const override = state.sectorSpecifics[subsector];
  const current = {
    output: override?.output || shipped.output,
    outputOptions: override?.outputOptions ?? [],
    capacityOptions:
      override?.capacityOptions?.length ? override.capacityOptions : shipped.capacityOptions,
  };
  const edited = Boolean(override);

  const setOutput = (output: string) =>
    setSubsectorMeasurements(subsector, { ...current, output });

  // Option 1 / Option 2 are extra output units, only shown to users when the
  // sub-sector is modeled with multiple revenue streams.
  const setOutputOption = (index: number, value: string) => {
    const next = [current.outputOptions[0] ?? "", current.outputOptions[1] ?? ""];
    next[index] = value;
    setSubsectorMeasurements(subsector, {
      ...current,
      outputOptions: next.filter(Boolean),
    });
  };

  const toggleCapacity = (unit: string) => {
    const has = current.capacityOptions.includes(unit);
    const next = has
      ? current.capacityOptions.filter((item) => item !== unit)
      : [...current.capacityOptions, unit];
    if (!next.length) return; // at least one capacity unit must remain
    setSubsectorMeasurements(subsector, { ...current, capacityOptions: next });
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-[16px] font-bold">{subsector}</h2>
            {edited && (
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Edited
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Shipped default: {shipped.output}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {edited && (
            <button
              type="button"
              onClick={() => resetSubsectorMeasurements(subsector)}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          )}
          {deletable && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete the "${subsector}" sub-sector template?`)) {
                  deleteSubsector(sector, subsector);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
              aria-label={`Delete ${subsector}`}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <label
            className="block text-[13px] font-semibold text-navy"
            htmlFor={`output-${subsector}`}
          >
            Default Maximum Output / Units Sold measurement
          </label>
          <select
            id={`output-${subsector}`}
            value={current.output}
            onChange={(event) => setOutput(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-navy focus:border-primary focus:outline-none"
          >
            {[...new Set([current.output, ...OUTPUT_CHOICES])].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>

          {[0, 1].map((index) => (
            <div key={index} className="mt-3">
              <label
                className="block text-[13px] font-semibold text-navy"
                htmlFor={`output-opt-${index}-${subsector}`}
              >
                Maximum Output / Units Sold measurement (Option {index + 1})
              </label>
              <select
                id={`output-opt-${index}-${subsector}`}
                value={current.outputOptions[index] ?? ""}
                onChange={(event) => setOutputOption(index, event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-navy focus:border-primary focus:outline-none"
              >
                <option value="">Not offered</option>
                {[...new Set([current.outputOptions[index] ?? "", ...OUTPUT_CHOICES])]
                  .filter((unit) => Boolean(unit) && unit !== current.output)
                  .map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            Options 1 and 2 only appear in the questionnaire when the sub-sector is set to multiple
            revenue streams.
          </p>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-navy">
            Capacity measurements offered ({current.capacityOptions.length})
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            The first checked unit is used as the default capacity measurement.
          </p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {[...new Set([...current.capacityOptions, ...CAPACITY_CHOICES])].map((unit) => {
              const checked = current.capacityOptions.includes(unit);
              return (
                <label
                  key={unit}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-input px-2.5 py-2 text-[12px] leading-relaxed text-navy transition-colors hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCapacity(unit)}
                    className="mt-0.5 size-3.5 accent-[hsl(var(--primary))]"
                  />
                  <span>{unit}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <DefaultTemplateGenerator
        subsector={subsector}
        outputMeasurement={current.output}
        capacityMeasurements={current.capacityOptions}
      />

      <TemplateUpload subsector={subsector} />
    </section>
  );
}

/**
 * Generates a default template for the sub-sector from a generic DCF template
 * plus a developer prompt describing measurement units and other specifics.
 * PROTOTYPE: records the instruction set only; no workbook is produced.
 */
function DefaultTemplateGenerator({
  subsector,
  outputMeasurement,
  capacityMeasurements,
}: {
  subsector: string;
  outputMeasurement: string;
  capacityMeasurements: string[];
}) {
  const { state, generateSubsectorDefaultTemplate, clearSubsectorDefaultTemplate } = useApp();
  const existing = (state.subsectorDefaultTemplates ?? {})[subsector];
  const [base, setBase] = useState(existing?.baseTemplate ?? GENERIC_TEMPLATES[0]!);
  const [prompt, setPrompt] = useState(existing?.prompt ?? "");
  const [open, setOpen] = useState(false);

  const defaultPrompt = `Adapt the ${base} template for ${subsector}. Set the Maximum Output / Units Sold measurement to "${outputMeasurement}" and offer these capacity measurements: ${capacityMeasurements.join(", ") || "none"}. Keep all formulas, tabs and links intact.`;

  const generate = () => {
    generateSubsectorDefaultTemplate(subsector, {
      baseTemplate: base,
      prompt: prompt.trim() || defaultPrompt,
      outputMeasurement,
      capacityMeasurements,
    });
    setOpen(false);
  };

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-navy">Default template</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {existing
              ? `${existing.fileName} · based on ${existing.baseTemplate} · generated ${new Date(existing.generatedAt).toLocaleString()}`
              : "Generate a default template from a generic DCF template and adapt it with a prompt."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Wand2 className="size-4" />
          {existing ? "Regenerate" : "Generate default template"}
        </button>
        {existing && (
          <>
            <button
              type="button"
              onClick={() => openGenerated(existing.fileName, existing.content ?? "")}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3.5 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <ExternalLink className="size-4" />
              Open
            </button>
            <button
              type="button"
              onClick={() => downloadGenerated(existing.fileName, existing.content ?? "")}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3.5 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <Download className="size-4" />
              Download
            </button>
          </>
        )}
        {existing && (
          <button
            type="button"
            onClick={() => clearSubsectorDefaultTemplate(subsector)}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3.5 py-2 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Remove
          </button>
        )}
      </div>

      {existing && !open && (
        <p className="mt-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-[12px] leading-relaxed text-navy-soft">
          {existing.prompt}
        </p>
      )}

      {open && (
        <div className="mt-3 grid gap-3 rounded-lg border border-primary/30 bg-panel p-4">
          <label className="text-[13px] font-semibold text-navy">
            Base generic template
            <select
              value={base}
              onChange={(event) => setBase(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm font-normal text-navy focus:border-primary focus:outline-none"
            >
              {GENERIC_TEMPLATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] font-semibold text-navy">
            Prompt — measurement units and other specifics
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder={defaultPrompt}
              className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm font-normal leading-relaxed text-navy focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPrompt(defaultPrompt)}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3.5 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" />
              Use suggested prompt
            </button>
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Wand2 className="size-4" />
              Generate
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-navy-soft transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function TemplateUpload({ subsector }: { subsector: string }) {
  const { state, addSubsectorTemplateFiles, removeSubsectorTemplateFile } = useApp();
  const files = state.subsectorTemplates[subsector] ?? [];
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-navy">Template file</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {files.length
              ? `${files.length} file(s) uploaded for this template`
              : "No template uploaded yet · Excel (.xlsx, .xls) or PDF (.pdf)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Upload className="size-4" />
          {files.length ? "Upload / Replace" : "Upload template"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.pdf"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              addSubsectorTemplateFiles(subsector, Array.from(event.target.files));
            }
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
            >
              <FileSpreadsheet className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{file}</span>
              <button
                type="button"
                onClick={() => removeSubsectorTemplateFile(subsector, file)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


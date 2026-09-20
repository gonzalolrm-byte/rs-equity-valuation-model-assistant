import { createFileRoute } from "@tanstack/react-router";
import { EditableText } from "@/lib/ui-content";
import {
  Building2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Leaf,
  Lock,
  Plane,
  Plus,
  Refinery,
  RotateCcw,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
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
import { DEFAULT_SUBSECTOR_CONFIG, useApp, type SubsectorConfigDefaults } from "@/lib/store";

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

/** Saved generated templates are plain text, so they can be viewed or saved locally. */
function generatedUrl(content: string) {
  return URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
}

function openGenerated(fileName: string, content: string) {
  const url = generatedUrl(content || fileName);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function downloadGenerated(fileName: string, content: string) {
  const url = generatedUrl(content || fileName);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

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
      <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Sector Specifics">
        1. Sector Specifics
      </EditableText>
      <EditableText as="p" className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground" group="Sector Specifics">
        Choose which measurement units are applied by default for each sector template. The default Maximum Output / Units Sold unit is pre-selected for users, and only the capacity units you check here appear in their capacity dropdown.
      </EditableText>

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

      <UserCardDefaults
        subsector={subsector}
        output={current.output}
        capacity={current.capacityOptions[0] ?? shipped.capacityOptions[0] ?? ""}
        onOutputChange={setOutput}
        onCapacityChange={(capacity) =>
          setSubsectorMeasurements(subsector, {
            ...current,
            capacityOptions: [capacity, ...current.capacityOptions.filter((item) => item !== capacity)],
          })
        }
      />

      <DefaultTemplateGenerator
        subsector={subsector}
        outputMeasurement={current.output}
        capacityMeasurements={current.capacityOptions}
      />

      <TemplateUpload subsector={subsector} />
    </section>
  );
}

const STREAM_OPTIONS = [
  { value: "stream1", label: "Revenue Stream 1" },
  { value: "stream2", label: "Revenue Stream 2" },
  { value: "stream3", label: "Revenue Stream 3" },
  { value: "streamOther", label: "Other" },
];

/**
 * Developer defaults and locks for the user-facing Section A/B sub-sector card.
 * Only pre-selects values and prevents edits; question IDs, mappings and
 * workflow logic are untouched.
 */
function UserCardDefaults({ subsector }: { subsector: string }) {
  const { state, setSubsectorConfig, resetSubsectorConfig } = useApp();
  const saved = (state.subsectorConfigs ?? {})[subsector];
  const config: SubsectorConfigDefaults = { ...DEFAULT_SUBSECTOR_CONFIG, ...(saved ?? {}) };
  const set = (patch: Partial<SubsectorConfigDefaults>) => setSubsectorConfig(subsector, patch);

  const toggleStream = (value: string) => {
    if (value === "stream1") return; // Revenue Stream 1 is always included
    const index = STREAM_OPTIONS.findIndex((item) => item.value === value);
    const list = config.streams.includes(value)
      ? config.streams.filter(
          (item) => item !== value && STREAM_OPTIONS.findIndex((o) => o.value === item) < index,
        )
      : [...config.streams, value];
    set({ streams: STREAM_OPTIONS.map((o) => o.value).filter((v) => list.includes(v) || v === "stream1") });
  };

  const pillRow = (
    label: string,
    hint: string,
    options: { value: string; label: string }[],
    value: string,
    onPick: (value: string) => void,
    locked: boolean,
    onLock: (locked: boolean) => void,
  ) => (
    <div className="grid gap-2 rounded-lg border border-panel-border bg-card px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-[13px] font-semibold text-navy">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPick(option.value)}
              aria-pressed={value === option.value}
              className={[
                "whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                value === option.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-navy hover:bg-secondary",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-navy">
          <input
            type="checkbox"
            checked={locked}
            onChange={(event) => onLock(event.target.checked)}
            className="size-3.5 accent-[hsl(var(--primary))]"
          />
          <Lock className="size-3.5 text-navy-soft" /> Lock
        </label>
      </div>
    </div>
  );

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-navy">
            User card defaults — Sections A and B
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Pre-select what users see for this sub-sector. Locked settings are shown but cannot be
            changed by the user.
          </p>
        </div>
        {saved && (
          <button
            type="button"
            onClick={() => resetSubsectorConfig(subsector)}
            className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
          >
            <RotateCcw className="size-4" />
            Reset defaults
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {pillRow(
          "A. Revenue modeling approach",
          "How revenues are modeled for this sub-sector.",
          [
            { value: "unit_economics", label: "Unit Economics" },
            { value: "percentage", label: "% Based" },
          ],
          config.modelBasis,
          (value) => set({ modelBasis: value as SubsectorConfigDefaults["modelBasis"] }),
          config.modelBasisLocked,
          (modelBasisLocked) => set({ modelBasisLocked }),
        )}

        {pillRow(
          "B. Revenue structure",
          "Number of revenue streams offered by default.",
          [
            { value: "single", label: "Single Revenue Stream" },
            { value: "multi", label: "Multiple Revenue Streams" },
          ],
          config.streamMode,
          (value) => set({ streamMode: value as SubsectorConfigDefaults["streamMode"] }),
          config.streamModeLocked,
          (streamModeLocked) => set({ streamModeLocked }),
        )}

        {config.streamMode === "multi" && (
          <div className="rounded-lg border border-panel-border bg-panel/25 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-navy">Pre-selected revenue streams</p>
              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={config.streamsLocked}
                  onChange={(event) => set({ streamsLocked: event.target.checked })}
                  className="size-3.5 accent-[hsl(var(--primary))]"
                />
                <Lock className="size-3.5 text-navy-soft" /> Lock
              </label>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {STREAM_OPTIONS.map((stream, index) => {
                const active = config.streams.includes(stream.value);
                const previous = STREAM_OPTIONS[index - 1]?.value;
                const disabled = index === 0 || (previous ? !config.streams.includes(previous) : false);
                return (
                  <label
                    key={stream.value}
                    className={[
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] transition-colors",
                      active ? "border-primary bg-primary/10 text-navy" : "border-border bg-card text-navy-soft",
                      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary/60",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={disabled}
                      onChange={() => toggleStream(stream.value)}
                      className="size-3.5 accent-[hsl(var(--primary))]"
                    />
                    {stream.label}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {config.streamMode === "multi" &&
          pillRow(
            "C. COGS segmentation",
            "Default COGS approach for this sub-sector.",
            [
              { value: "business_line", label: "Sub-sector Level" },
              { value: "revenue_stream", label: "Revenue Stream Level" },
            ],
            config.cogsBasis,
            (value) => set({ cogsBasis: value as SubsectorConfigDefaults["cogsBasis"] }),
            config.cogsCapexLocked,
            (cogsCapexLocked) => set({ cogsCapexLocked }),
          )}

        {config.streamMode === "multi" &&
          pillRow(
            "C. CapEx segmentation",
            "Default CapEx approach for this sub-sector.",
            [
              { value: "business_line", label: "Sub-sector Level" },
              { value: "revenue_stream", label: "Revenue Stream Level" },
            ],
            config.capexBasis,
            (value) => set({ capexBasis: value as SubsectorConfigDefaults["capexBasis"] }),
            config.cogsCapexLocked,
            (cogsCapexLocked) => set({ cogsCapexLocked }),
          )}

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-panel-border bg-card px-3 py-3 text-[13px] font-semibold text-navy">
          <input
            type="checkbox"
            checked={config.unitsLocked}
            onChange={(event) => set({ unitsLocked: event.target.checked })}
            className="size-3.5 accent-[hsl(var(--primary))]"
          />
          <Lock className="size-3.5 text-navy-soft" />
          Lock the operational unit selections (Sales / Output Unit and Capacity Unit)
        </label>
      </div>
    </div>
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


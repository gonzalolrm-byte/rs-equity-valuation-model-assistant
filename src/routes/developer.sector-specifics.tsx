import { createFileRoute } from "@tanstack/react-router";
import { EditableText } from "@/lib/ui-content";
import {
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Info,
  Plus,
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
    <div className="rounded-xl border border-panel-border bg-card px-4 py-3 shadow-card">
      <EditableText as="h1" className="block font-heading text-[18px] font-extrabold" group="Sector Specifics">
        1. Sector Specifics
      </EditableText>
      <EditableText as="p" className="mt-0.5 block max-w-5xl text-[12px] leading-relaxed text-muted-foreground" group="Sector Specifics">
        Choose which measurement units are applied by default for each sector template. The default Maximum Output / Units Sold unit is pre-selected for users, and only the capacity units you check here appear in their capacity dropdown.
      </EditableText>

      <div className="mt-3 grid items-end gap-4 lg:grid-cols-[minmax(240px,420px)_minmax(340px,1fr)]">
        <label className="block text-[12px] font-semibold text-navy" htmlFor="sector-select">
          Primary sector
          <select
            id="sector-select"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-card px-3 text-[12px] font-normal text-navy focus:border-primary focus:outline-none"
          >
            {SECTORS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] font-semibold text-navy" htmlFor="new-subsector">
          Add sub-sector template
          <span className="mt-1.5 flex gap-2">
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
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-[12px] font-normal text-navy focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={addSubsector}
            disabled={!newSubsector.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-panel px-4 text-[12px] font-semibold text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            <Plus className="size-4" />
            Add
          </button>
          </span>
        </label>
      </div>

      <div className="mt-3 space-y-3">
        {subsectors.map((subsector) => (
          <SubsectorCard
            key={subsector}
            sector={sector}
            subsector={subsector}
            deletable={!GENERIC_TEMPLATES.includes(subsector)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-3 rounded-lg border border-panel-border bg-panel p-3">
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
  const {
    state,
    setSubsectorMeasurements,
    resetSubsectorMeasurements,
    resetSubsectorConfig,
    deleteSubsector,
  } = useApp();
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

  return (
    <section className="overflow-hidden rounded-lg border border-panel-border bg-card shadow-card">
      <div className="border-b border-panel-border bg-panel/30 px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-[15px] font-bold">{subsector}</h2>
            {edited && (
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Edited
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
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
              className="inline-flex items-center gap-2 rounded-md border border-destructive/35 bg-card px-3 py-1.5 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
              aria-label={`Delete ${subsector}`}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          )}
        </div>
      </div>
      </div>

      <div className="px-3 pb-3">
      <UserCardDefaults
        subsector={subsector}
        hasOverrides={Boolean(state.subsectorConfigs?.[subsector]) || edited}
        output={current.output}
        capacity={current.capacityOptions[0] ?? shipped.capacityOptions[0] ?? ""}
        onOutputChange={setOutput}
        onCapacityChange={(capacity) =>
          setSubsectorMeasurements(subsector, {
            ...current,
            capacityOptions: [capacity, ...current.capacityOptions.filter((item) => item !== capacity)],
          })
        }
        onReset={() => {
          resetSubsectorMeasurements(subsector);
          resetSubsectorConfig(subsector);
        }}
      />

      <DefaultTemplateGenerator
        subsector={subsector}
        outputMeasurement={current.output}
        capacityMeasurements={current.capacityOptions}
      />

      <TemplateUpload subsector={subsector} />
      </div>
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
const UNIT_ECONOMICS_APPROACHES = [
  {
    value: "v1" as const,
    title: "Approach 1",
    description: [
      "Revenue is segmented by revenue stream but projected using aggregate Units Sold (or equivalent).",
      "COGS and CapEx are not segmented and are modeled using aggregate Units Sold and Capacity, as applicable.",
    ],
    example: "An airport with separate passenger, retail, and parking revenue streams, all driven by aggregate passenger traffic.",
  },
  {
    value: "v2" as const,
    title: "Approach 2",
    description: [
      "Revenue is segmented by revenue stream and projected using individual Units Sold (or equivalent) for each stream.",
      "COGS and CapEx follow the same aggregate-level approach as Approach 1.",
    ],
    example: "A manufacturer selling different products with separate sales volumes, but operating from a common production facility with shared costs and CapEx.",
  },
  {
    value: "v3" as const,
    title: "Approach 3",
    description: [
      "Revenue and COGS are segmented by revenue stream and modeled using individual Units Sold (or equivalent).",
      "CapEx is not segmented and is therefore modeled at the aggregate level.",
    ],
    example: "An agricultural company with different crops, each with its own production volumes and direct costs, but with a shared investment program (and processing facilities).",
  },
  {
    value: "v4" as const,
    title: "Approach 4",
    description: [
      "Revenue, COGS, and CapEx are all segmented by revenue stream and modeled using individual Units Sold (or equivalent) and Capacity, as applicable.",
    ],
    example: "A power company with multiple generation assets, where each asset has its own generation, capacity, operating costs, and CapEx.",
  },
];

function UserCardDefaults({
  subsector,
  hasOverrides,
  output,
  capacity,
  onOutputChange,
  onCapacityChange,
  onReset,
}: {
  subsector: string;
  hasOverrides: boolean;
  output: string;
  capacity: string;
  onOutputChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onReset: () => void;
}) {
  const { state, setSubsectorConfig } = useApp();
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
    <div className="grid gap-3 rounded-lg border border-panel-border bg-card px-3 py-3 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="text-[13px] font-semibold text-navy">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid min-w-[320px] grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPick(option.value)}
              aria-pressed={value === option.value}
              className={[
                "whitespace-nowrap rounded-md px-3 py-2 text-[12px] font-semibold transition-colors",
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
          Lock
        </label>
      </div>
    </div>
  );

  return (
    <div className="pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-navy">
            User card defaults — Sections A and B
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pre-select what users see for this sub-sector. Locked settings are shown but cannot be
            changed by the user.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-[11px] font-semibold text-navy transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!hasOverrides}
        >
          <RotateCcw className="size-4" />
          Reset defaults
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
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
          <div className="rounded-lg border border-panel-border bg-card px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-navy">Pre-selected revenue streams</p>
              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={config.streamsLocked}
                  onChange={(event) => set({ streamsLocked: event.target.checked })}
                  className="size-3.5 accent-[hsl(var(--primary))]"
                />
                 Lock
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

        {config.streamMode === "multi" && config.modelBasis === "unit_economics" && (
          <div className="rounded-lg border border-primary/45 bg-panel/45 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-navy">
                  C. Unit Economics approach
                  <span className="ml-1 font-medium text-primary">(shown because Multiple Revenue Streams is selected)</span>
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Select the standard Unit Economics structure for this sub-sector. This will automatically configure revenue, COGS and CapEx settings.
                </p>
              </div>
              <LockToggle
                checked={config.unitEconomicsApproachLocked}
                onChange={(unitEconomicsApproachLocked) => set({ unitEconomicsApproachLocked })}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {UNIT_ECONOMICS_APPROACHES.map((approach) => {
                const selected = config.unitEconomicsApproach === approach.value;
                return (
                  <button
                    key={approach.value}
                    type="button"
                    onClick={() => {
                      const cogsBasis = approach.value === "v3" || approach.value === "v4" ? "revenue_stream" : "business_line";
                      const capexBasis = approach.value === "v4" ? "revenue_stream" : "business_line";
                      set({ unitEconomicsApproach: approach.value, cogsBasis, capexBasis });
                    }}
                    aria-pressed={selected}
                    className={[
                      "flex min-h-[300px] flex-col rounded-lg border bg-card p-4 text-left transition-colors",
                      selected ? "border-primary shadow-card" : "border-panel-border hover:border-primary/50",
                    ].join(" ")}
                  >
                    <span className="flex items-start gap-2">
                      <span className={[
                        "mt-0.5 size-4 shrink-0 rounded-full border",
                        selected ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--color-card)]" : "border-input",
                      ].join(" ")} />
                      <span>
                        <span className="block text-[14px] font-bold text-navy">{approach.title}</span>
                        <span className="mt-3 block space-y-3 text-[12px] leading-relaxed text-navy-soft">
                          {approach.description.map((paragraph) => (
                            <span key={paragraph} className="block">{paragraph}</span>
                          ))}
                        </span>
                      </span>
                    </span>
                    <span className="mt-auto block rounded-lg bg-panel/55 p-3 text-[12px] leading-relaxed text-navy-soft">
                      <span className="mb-2 flex items-center gap-2 border-b border-panel-border pb-2 font-bold text-primary">
                        <FileText className="size-4 text-navy" /> Example
                      </span>
                      {approach.example}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-3 rounded-lg border border-panel-border bg-card px-3 py-3 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[13px] font-bold text-navy">D. Operational units</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Define the units used for operational modeling.</p>
          </div>
          <label className="block text-[11px] font-semibold text-navy">
            Sales / Output Unit
            <select value={output} onChange={(event) => onOutputChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-[12px] text-navy outline-none focus:border-primary">
              {[...new Set([output, ...OUTPUT_CHOICES])].filter(Boolean).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </label>
          <label className="block text-[11px] font-semibold text-navy">
            Capacity Unit
            <select value={capacity} onChange={(event) => onCapacityChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-[12px] text-navy outline-none focus:border-primary">
              {[...new Set([capacity, ...CAPACITY_CHOICES])].filter(Boolean).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </label>
          <LockToggle checked={config.unitsLocked} onChange={(unitsLocked) => set({ unitsLocked })} />
        </div>
      </div>
    </div>
  );
}

function LockToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap pb-2 text-[12px] font-semibold text-navy">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-3.5 accent-[hsl(var(--primary))]" />
       Lock
    </label>
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


/**
 * Floating toolbar + property editor shown while the Developer Console's
 * "Edit User Interface" mode is active. Edits wording and presentation only —
 * system properties (IDs, conditions, mappings, prompts, workflow logic) are
 * displayed read-only so it is clear they cannot be changed here.
 */
import { Link, useLocation } from "@tanstack/react-router";
import {
  Check,
  Lock,
  MousePointerClick,
  Move,
  Pencil,
  RotateCcw,
  Type,
  X,
} from "lucide-react";
import {
  ALIGNMENTS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT_FIELDS,
  useUiContent,
  type UiLayoutOverride,
  type UiOverride,
} from "@/lib/ui-content";
import { scopeForPath } from "@/components/UiLayoutEditor";

export function UiEditBar() {
  const ui = useUiContent();
  const location = useLocation();
  if (!ui.editing) return null;

  const scope = scopeForPath(location.pathname);
  const layoutMode = ui.editMode === "layout";
  const selected = layoutMode ? null : ui.selectedKey;
  const entry = ui.registry.find((item) => item.key === selected);
  const override: UiOverride = (selected ? ui.draft[selected] : undefined) ?? {};
  const layoutPath = layoutMode ? ui.selectedPath : null;
  const layoutOverride: UiLayoutOverride = (layoutPath ? ui.layout[layoutPath] : undefined) ?? {};
  // Text picked directly off the page (boxes, tables, bars) rather than registered content.
  const textPath = !layoutMode && !selected ? ui.selectedPath : null;
  const textPathValue = textPath ? ui.pathText[textPath] : undefined;

  return (
    <>
      <div
        data-ui-editor
        className="fixed inset-x-0 top-0 z-50 border-b border-primary/40 bg-primary text-primary-foreground"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Pencil className="size-4" />
            Editing {scope === "developer" ? "developer console" : "user interface"}
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-primary-foreground/15 p-0.5">
            <button
              type="button"
              onClick={() => ui.setEditMode("text")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold ${
                layoutMode ? "opacity-80" : "bg-card text-primary"
              }`}
            >
              <Type className="size-3.5" />
              Text & format
            </button>
            <button
              type="button"
              onClick={() => ui.setEditMode("layout")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold ${
                layoutMode ? "bg-card text-primary" : "opacity-80"
              }`}
            >
              <Move className="size-3.5" />
              Layout & size
            </button>
          </div>
          <span className="hidden items-center gap-1.5 text-[13px] opacity-90 lg:flex">
            <MousePointerClick className="size-3.5" />
            {layoutMode
              ? "Click any component to resize it, or drag its edges"
              : "Click any text on the page to edit its wording or formatting"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={ui.cancelEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-foreground/40 px-3 py-1.5 text-[13px] font-semibold"
            >
              <X className="size-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={ui.saveEditing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-[13px] font-semibold text-primary"
            >
              <Check className="size-3.5" />
              Save Changes
            </button>
            <Link
              to="/developer"
              className="rounded-lg px-2 py-1.5 text-[13px] font-semibold underline"
            >
              Developer Console
            </Link>
          </div>
        </div>
      </div>

      {layoutPath && (
        <aside
          data-ui-editor
          className="fixed bottom-4 right-4 z-50 max-h-[80vh] w-[340px] overflow-auto rounded-2xl border border-panel-border bg-card p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-heading text-[15px] font-bold text-navy">Layout &amp; size</p>
            <button
              type="button"
              onClick={() => ui.selectPath(null)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Close editor"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Drag the component&apos;s edges on the page, or enter exact values. Leave a field empty
            to keep the original.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {LAYOUT_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-[12px] text-muted-foreground">{field.label}</span>
                <input
                  value={layoutOverride[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    ui.setLayoutOverride(layoutPath, { [field.key]: event.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-[13px] text-navy outline-none focus:border-primary"
                />
              </label>
            ))}
          </div>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tables &amp; cells
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Select
              label="Text wrapping"
              value={layoutOverride.whiteSpace ?? ""}
              options={WRAP_OPTIONS}
              onChange={(value) => ui.setLayoutOverride(layoutPath, { whiteSpace: value })}
            />
            <Select
              label="Horizontal align"
              value={layoutOverride.textAlign ?? ""}
              options={ALIGNMENTS}
              onChange={(value) => ui.setLayoutOverride(layoutPath, { textAlign: value })}
            />
            <Select
              label="Vertical align"
              value={layoutOverride.verticalAlign ?? ""}
              options={VERTICAL_ALIGNMENTS}
              onChange={(value) => ui.setLayoutOverride(layoutPath, { verticalAlign: value })}
            />
          </div>

          <button
            type="button"
            onClick={() => ui.resetLayout(layoutPath)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-[13px] font-semibold text-navy hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" />
            Reset to original size
          </button>

          <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Lock className="size-3.5" />
              Locked system properties
            </p>
            <dl className="mt-2 space-y-1 text-[12px] text-muted-foreground">
              <Row label="Interface" value={scope === "developer" ? "Developer Console" : "User"} />
              <Row label="Component ID" value={layoutPath.split("|")[1] ?? layoutPath} />
              <Row label="Logic & calculations" value="Unchanged" />
              <Row label="Field definitions" value="Unchanged" />
              <Row label="Template generation" value="Unchanged" />
            </dl>
          </div>
        </aside>
      )}

      {selected && (
        <aside
          data-ui-editor
          className="fixed bottom-4 right-4 z-50 max-h-[80vh] w-[340px] overflow-auto rounded-2xl border border-panel-border bg-card p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-heading text-[15px] font-bold text-navy">Edit content</p>
            <button
              type="button"
              onClick={() => ui.select(null)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Close editor"
            >
              <X className="size-4" />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Text</span>
            <textarea
              rows={3}
              value={override.text ?? entry?.defaultText ?? ""}
              onChange={(event) => ui.setDraftOverride(selected, { text: event.target.value })}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-[14px] text-navy outline-none focus:border-primary"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Select
              label="Font size"
              value={override.fontSize ?? ""}
              options={FONT_SIZES}
              onChange={(value) => ui.setDraftOverride(selected, { fontSize: value })}
            />
            <Select
              label="Font weight"
              value={override.fontWeight ?? ""}
              options={FONT_WEIGHTS}
              onChange={(value) => ui.setDraftOverride(selected, { fontWeight: value })}
            />
          </div>
          <div className="mt-3">
            <Select
              label="Alignment"
              value={override.align ?? ""}
              options={ALIGNMENTS}
              onChange={(value) =>
                ui.setDraftOverride(
                  selected,
                  value ? { align: value as "left" | "center" | "right" } : { align: undefined },
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={() => ui.resetOverride(selected)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-[13px] font-semibold text-navy hover:bg-secondary"
          >
            <RotateCcw className="size-3.5" />
            Reset to original
          </button>

          <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Lock className="size-3.5" />
              Locked system properties
            </p>
            <dl className="mt-2 space-y-1 text-[12px] text-muted-foreground">
              <Row label="Content ID" value={selected} />
              <Row label="Section" value={entry?.group ?? "—"} />
              <Row label="Field / variable" value="Unchanged" />
              <Row label="Conditional logic" value="Unchanged" />
              <Row label="Prompts & mappings" value="Unchanged" />
            </dl>
          </div>
        </aside>
      )}
    </>
  );
}

const WRAP_OPTIONS = [
  { value: "", label: "Default" },
  { value: "normal", label: "Wrap on" },
  { value: "nowrap", label: "Wrap off" },
] as const;

const VERTICAL_ALIGNMENTS = [
  { value: "", label: "Default" },
  { value: "top", label: "Top" },
  { value: "middle", label: "Middle" },
  { value: "bottom", label: "Bottom" },
] as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="truncate font-medium text-navy-soft">{value}</dd>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-[14px] text-navy outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Spacer so the fixed toolbar never covers page content. */
export function UiEditBarSpacer() {
  const ui = useUiContent();
  if (!ui.editing) return null;
  return <div className="h-11" />;
}

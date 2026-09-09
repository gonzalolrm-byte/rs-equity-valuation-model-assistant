import { ChevronDown, Info } from "lucide-react";
import { useState, type ReactNode } from "react";

export function PageHeading({
  step,
  title,
  intro,
  required = true,
}: {
  step: string;
  title: string;
  intro: string;
  required?: boolean;
}) {
  return (
    <div className="mb-8">
      <p className="eyebrow">{step}</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
      {required && (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Required field
        </p>
      )}
    </div>
  );
}

export function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/60"
      >
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <ChevronDown
          className={`size-5 shrink-0 text-navy-soft transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-8 border-t border-border px-5 py-6">{children}</div>}
    </section>
  );
}

export function Question({
  number,
  label,
  required = false,
  hint,
  children,
}: {
  number: number;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-navy">
        <span className="mr-1.5 text-navy-soft">{number}.</span>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </p>
      <div className="mt-3 space-y-3">{children}</div>
      {hint && (
        <p className="mt-3 flex gap-2 rounded-lg bg-panel px-3 py-2 text-[13px] leading-relaxed text-navy-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  errorMessage,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error}
        className={`w-full rounded-lg border bg-card px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/25 ${error ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"}`}
      />
      {error && errorMessage && (
        <span className="mt-1.5 block text-sm text-destructive">{errorMessage}</span>
      )}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-input bg-card px-3.5 py-2.5 pr-10 text-[15px] text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/25"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-navy-soft" />
      </div>
    </label>
  );
}

export function OptionRow({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-[15px] transition-colors",
              selected
                ? "border-primary bg-panel text-navy"
                : "border-border bg-card text-navy-soft hover:border-primary/50 hover:bg-secondary/60",
            ].join(" ")}
          >
            <span
              className={[
                "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-primary" : "border-input",
              ].join(" ")}
            >
              {selected && <span className="size-2 rounded-full bg-primary" />}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckItem({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={[
        "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
        checked
          ? "border-primary bg-panel"
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/60",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border-2 text-primary-foreground",
          checked ? "border-primary bg-primary" : "border-input",
        ].join(" ")}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M2 6.5 4.6 9 10 3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>
        <span className="block text-[15px] text-navy">{label}</span>
        {description && (
          <span className="mt-1 block text-[13px] text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  );
}

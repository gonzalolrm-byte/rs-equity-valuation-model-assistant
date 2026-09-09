import { Check } from "lucide-react";

export function StepProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 1-based
}) {
  return (
    <div className="border-b border-border bg-secondary/60">
      <ol className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-3">
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done
                    ? "bg-success text-success-foreground"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="size-4" /> : step}
              </span>
              <span
                className={[
                  "text-sm",
                  active ? "font-semibold text-navy" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
              {step < steps.length && (
                <span
                  className={[
                    "mx-3 hidden h-px flex-1 sm:block",
                    done ? "bg-success" : "bg-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

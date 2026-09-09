import { AlertTriangle, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "./Button";
import { downloadModel, type GeneratedModel } from "@/lib/services/excelService";
import type { ExecutionLog } from "@/lib/services/claudeService";

export function ModelOutputCard({
  title,
  model,
  log,
  downloadLabel,
}: {
  title: string;
  model: GeneratedModel;
  log: ExecutionLog | null;
  downloadLabel: string;
}) {
  const missing = log?.missing ?? [];
  return (
    <section className="rounded-xl border border-success/40 bg-success-soft/50 p-5">
      <p className="eyebrow text-success">{title}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
        <FileSpreadsheet className="size-9 shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[15px] font-bold">{model.fileName}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Generated {new Date(model.generatedAt).toLocaleString()} · Template:{" "}
            {model.templateUsed}
          </p>
        </div>
        <Button variant="success" onClick={() => downloadModel(model, missing.map((item) => `${item.worksheet} — ${item.field} (${item.status})`))}>
          <Download className="size-4" />
          {downloadLabel}
        </Button>
      </div>

      {model.appliedActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-navy">Selected updates applied</p>
          <ul className="mt-2 space-y-1 text-[13px] text-navy-soft">
            {model.appliedActions.map((action) => (
              <li key={action}>· {action}</li>
            ))}
          </ul>
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-4 rounded-xl border border-warning/40 bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
            <AlertTriangle className="size-4 text-warning" />
            Unresolved inputs — nothing was estimated
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-navy-soft">
            {missing.map((item) => (
              <li key={`${item.worksheet}-${item.field}`} className="flex flex-wrap gap-2">
                <span className="rounded bg-card px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  {item.status}
                </span>
                <span>
                  {item.worksheet} — {item.field}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[12px] text-muted-foreground">
        Prototype build: the workbook engine and Claude are not connected yet, so the download is a
        manifest of what would be produced.
      </p>
    </section>
  );
}

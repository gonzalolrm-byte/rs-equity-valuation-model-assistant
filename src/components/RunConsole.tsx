import { Loader2 } from "lucide-react";

export function RunConsole({ lines, running }: { lines: string[]; running: boolean }) {
  if (!lines.length) return null;
  return (
    <div className="rounded-xl border border-border bg-navy/[0.03] p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
        {running && <Loader2 className="size-4 animate-spin text-primary" />}
        {running ? "Executing predefined prompt actions…" : "Execution log"}
      </p>
      <ul className="mt-2 space-y-1 font-mono text-[12px] text-navy-soft">
        {lines.map((line, index) => (
          <li key={`${line}-${index}`}>▸ {line}</li>
        ))}
      </ul>
    </div>
  );
}

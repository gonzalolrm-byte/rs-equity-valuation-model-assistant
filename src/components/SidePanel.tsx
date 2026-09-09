import { Link } from "@tanstack/react-router";
import { Info, Lightbulb, LifeBuoy } from "lucide-react";

export function SidePanel({
  about,
  tips,
}: {
  about: string;
  tips: string[];
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-xl border border-panel-border bg-panel p-5">
        <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold">
          <Info className="size-4 text-primary" />
          About this step
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy-soft">{about}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold">
          <Lightbulb className="size-4 text-warning" />
          Tips
        </h3>
        <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold">
          <LifeBuoy className="size-4 text-success" />
          Need help?
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Check our Valuation Guidelines or contact the team.
        </p>
        <Link
          to="/guidelines"
          className="mt-3 inline-flex rounded-lg border border-primary/40 px-3 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          View Guidelines
        </Link>
      </div>
    </aside>
  );
}

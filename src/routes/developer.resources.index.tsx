import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CORE_INFORMATION_PAGES } from "./developer.resources";
import { CoreInfoNote, CoreSectionHeader } from "@/components/CoreInformation";

export const Route = createFileRoute("/developer/resources/")({
  head: () => ({
    meta: [
      { title: "Core Information — Developer Console" },
      {
        name: "description",
        content:
          "Parent section for the core templates, market data and guidelines used by the application.",
      },
      { property: "og:title", content: "Core Information — Developer Console" },
      {
        property: "og:description",
        content: "Open the core templates, market data or guidelines pages.",
      },
    ],
  }),
  component: CoreInformationIndex,
});

function CoreInformationIndex() {
  return (
    <div>
      <CoreSectionHeader
        title="2. Core Information"
        description="Upload and manage the core files and data sources used by the application. These files are accessible only to developers and are not visible to users."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {CORE_INFORMATION_PAGES.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            className="group rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/50"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-panel text-primary">
              {page.icon}
            </span>
            <h2 className="mt-3 font-heading text-[16px] font-bold text-navy">{page.label}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {page.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <CoreInfoNote />
    </div>
  );
}

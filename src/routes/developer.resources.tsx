import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileSpreadsheet, LineChart } from "lucide-react";
import { EditableText } from "@/lib/ui-content";

export const Route = createFileRoute("/developer/resources")({
  component: CoreInformationLayout,
});

export const CORE_INFORMATION_PAGES = [
  {
    to: "/developer/resources/templates",
    label: "Core Templates",
    icon: <FileSpreadsheet className="size-4" />,
    description:
      "Standardized DCF, waterfall, put and generic templates used to build or update valuation models.",
  },
  {
    to: "/developer/resources/market-data",
    label: "Core Market Data",
    icon: <LineChart className="size-4" />,
    description:
      "Reference data such as cost of equity reports and macro assumptions that feed into the models.",
  },
  {
    to: "/developer/resources/guidelines",
    label: "Core Guidelines",
    icon: <BookOpen className="size-4" />,
    description:
      "Guidance documents for completing the questionnaire and applying standardized modeling conventions.",
  },
] as const;

function CoreInformationLayout() {
  return (
    <div>
      <nav className="flex min-w-0 flex-wrap items-center gap-1 rounded-lg border border-panel-border bg-panel/45 p-1 shadow-card">
        {CORE_INFORMATION_PAGES.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            className="flex h-9 min-w-fit items-center gap-2 rounded-md px-4 text-[12px] font-semibold text-navy-soft transition-colors hover:bg-card hover:text-navy"
            activeProps={{ className: "bg-card text-navy shadow-card" }}
          >
            {page.icon}
            <EditableText group="Core Information navigation">{page.label}</EditableText>
          </Link>
        ))}
      </nav>
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}

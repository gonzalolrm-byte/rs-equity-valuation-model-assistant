import { Outlet, createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileSpreadsheet, LineChart } from "lucide-react";

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
      <Outlet />
    </div>
  );
}

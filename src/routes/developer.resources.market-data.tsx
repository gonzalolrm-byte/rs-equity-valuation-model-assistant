import { createFileRoute } from "@tanstack/react-router";
import {
  AddResourceSection,
  CoreBackButton,
  CoreInfoNote,
  CoreSectionHeader,
  ResourceList,
} from "@/components/CoreInformation";

export const Route = createFileRoute("/developer/resources/market-data")({
  head: () => ({
    meta: [
      { title: "Core Market Data — Developer Console" },
      {
        name: "description",
        content:
          "Manage reference data such as cost of equity reports and macro assumptions used by the models.",
      },
      { property: "og:title", content: "Core Market Data — Developer Console" },
      {
        property: "og:description",
        content: "Upload and manage market and macro reference data.",
      },
    ],
  }),
  component: CoreMarketData,
});

function CoreMarketData() {
  return (
    <div>
      <div className="mb-4">
        <CoreBackButton />
      </div>
      <CoreSectionHeader
        title="Core Market Data"
        description="Reference data such as cost of equity reports and macro assumptions that feed into the models."
      />
      <ResourceList kind="reference" emptyLabel="No market data entries yet." />
      <AddResourceSection kind="reference" label="market data entry" />
      <CoreInfoNote />
    </div>
  );
}

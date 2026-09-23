import { createFileRoute } from "@tanstack/react-router";
import {
  AddResourceSection,
  CoreBackButton,
  CoreInfoNote,
  CoreSectionHeader,
  GenericTemplatesSection,
  ResourceList,
} from "@/components/CoreInformation";

export const Route = createFileRoute("/developer/resources/templates")({
  head: () => ({
    meta: [
      { title: "Core Templates — Developer Console" },
      {
        name: "description",
        content:
          "Manage the standardized DCF, waterfall, put and generic templates used to build valuation models.",
      },
      { property: "og:title", content: "Core Templates — Developer Console" },
      {
        property: "og:description",
        content: "Upload and manage the core valuation model templates.",
      },
    ],
  }),
  component: CoreTemplates,
});

function CoreTemplates() {
  return (
    <div>
      <CoreSectionHeader
        title="Core Templates"
        description="Standardized DCF, waterfall, put and generic templates used to build or update valuation models."
      />
      <GenericTemplatesSection />
      <ResourceList kind="template" emptyLabel="No template entries yet." />
      <AddResourceSection kind="template" label="template" />
      <CoreInfoNote />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  AddResourceSection,
  CoreBackButton,
  CoreInfoNote,
  CoreSectionHeader,
  ResourceList,
} from "@/components/CoreInformation";

export const Route = createFileRoute("/developer/resources/guidelines")({
  head: () => ({
    meta: [
      { title: "Core Guidelines — Developer Console" },
      {
        name: "description",
        content:
          "Manage guidance documents for completing the questionnaire and applying standardized modeling conventions.",
      },
      { property: "og:title", content: "Core Guidelines — Developer Console" },
      {
        property: "og:description",
        content: "Upload and manage internal valuation guideline documents.",
      },
    ],
  }),
  component: CoreGuidelines,
});

function CoreGuidelines() {
  return (
    <div>
      <CoreSectionHeader
        title="Core Guidelines"
        description="Guidance documents for completing the questionnaire and applying standardized modeling conventions."
      />
      <ResourceList kind="guideline" emptyLabel="No guideline documents yet." />
      <AddResourceSection kind="guideline" label="guideline" />
      <CoreInfoNote />
    </div>
  );
}

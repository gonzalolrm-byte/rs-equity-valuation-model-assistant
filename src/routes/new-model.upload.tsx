import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, ButtonLink } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import { StepProgress } from "@/components/StepProgress";
import { PageHeading } from "@/components/form";
import { UploadCard, type UploadSlot } from "@/components/UploadCard";
import { useApp } from "@/lib/store";
import { WORKFLOW_A_STEPS } from "./new-model.company-information";

export const NEW_MODEL_SLOTS: UploadSlot[] = [
  {
    key: "historical_financials",
    index: 1,
    title: "Historical Audited Consolidated Financial Statements",
    description:
      "Upload historical audited consolidated financial statements (e.g., last 3–5 years).",
    formats: "PDF, Excel (XLS/XLSX)",
    accept: ".pdf,.xls,.xlsx",
    required: true,
  },
  {
    key: "operational_reports",
    index: 2,
    title: "Historical Annual Operational Reports",
    description:
      "Any report that includes operational drivers, operational drivers by segment, revenue / COGS / CapEx by segment, and a breakdown of COGS.",
    formats: "PDF, Excel (XLS/XLSX)",
    accept: ".pdf,.xls,.xlsx",
  },
  {
    key: "latest_valuation_model",
    index: 3,
    title: "Latest Full Valuation Model",
    description: "The Excel model used in the most recent quarterly valuation.",
    formats: "Excel (XLS/XLSX)",
    accept: ".xls,.xlsx",
    multiple: false,
  },
  {
    key: "additional_documents",
    index: 4,
    title: "Additional Documents (Optional)",
    description:
      "Investor presentations, management reports, sector studies, budget, YTD financials or any other relevant information.",
    formats: "PDF, Excel (XLS/XLSX), PowerPoint (PPTX)",
    accept: ".pdf,.xls,.xlsx,.ppt,.pptx",
  },
];

export const Route = createFileRoute("/new-model/upload")({
  head: () => ({
    meta: [
      { title: "Upload Company Information — Real Sector – Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Step 2 of 3: upload audited financial statements, operational reports and the latest valuation model used to populate your standardized template.",
      },
      { property: "og:title", content: "Upload Company Information — Real Sector – Equity Valuation Model Assistant" },
      {
        property: "og:description",
        content: "Step 2 of 3 of the standardized DCF template workflow.",
      },
    ],
  }),
  component: UploadStep,
});

function UploadStep() {
  const { state, saveProgress } = useApp();
  const navigate = useNavigate();
  const ready = NEW_MODEL_SLOTS.filter((slot) => slot.required).every(
    (slot) => (state.newFiles[slot.key]?.length ?? 0) > 0,
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_A_STEPS} current={2} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <PageHeading
              step="Step 2 of 3"
              title="Upload Company Information"
              intro="Please upload the relevant documents below. These files will be used to populate and customize your valuation template."
            />

            <div className="space-y-5">
              {NEW_MODEL_SLOTS.map((slot) => (
                <UploadCard key={slot.key} group="newFiles" slot={slot} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <ButtonLink to="/new-model/company-information" variant="secondary">
                <ArrowLeft className="size-4" />
                Back
              </ButtonLink>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={saveProgress}>
                  Save &amp; Exit
                </Button>
                <Button disabled={!ready} onClick={() => navigate({ to: "/new-model/generate" })}>
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
            {!ready && (
              <p className="mt-2 text-right text-sm text-muted-foreground">
                Upload the required Historical Audited Financial Statements to continue.
              </p>
            )}
          </div>

          <SidePanel
            about="Upload the key documents listed here. These files will be used to extract relevant information and populate the standardized valuation template."
            tips={[
              "Use the most recent and complete information available.",
              "Ensure documents are in PDF, Excel or PowerPoint format.",
              "If a document is very large, you may compress it or upload key sections.",
              "You can upload multiple files for each category if needed.",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

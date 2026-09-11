import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, ButtonLink } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import { StepProgress } from "@/components/StepProgress";
import { PageHeading } from "@/components/form";
import { UploadCard, type UploadSlot } from "@/components/UploadCard";
import { useApp } from "@/lib/store";

export const WORKFLOW_B_STEPS = [
  "Populate Template",
  "Update Valuation Model",
  "Review and Save",
];

export const UPDATE_MODEL_SLOTS: UploadSlot[] = [
  {
    key: "last_quarter_model",
    index: 1,
    title: "Last Quarter Standardized Valuation Model",
    description: "The standardized valuation model used in the most recent quarterly valuation.",
    formats: "Excel (XLS/XLSX)",
    accept: ".xls,.xlsx",
    required: true,
    multiple: false,
  },
  {
    key: "audited_financials",
    index: 2,
    title: "Historical Annual Audited Financial Statements",
    description: "The most recent audited financial information available.",
    formats: "PDF, Excel (XLS/XLSX)",
    accept: ".pdf,.xls,.xlsx",
    required: false,
  },
  {
    key: "client_model",
    index: 3,
    title: "Client's Full Financial Model",
    description: "The latest management / company financial model.",
    formats: "Excel (XLS/XLSX)",
    accept: ".xls,.xlsx",
    required: false,
  },
  {
    key: "additional_documents",
    index: 4,
    title: "Additional Documents (Optional)",
    description:
      "Budget, YTD financials, management reports, sector studies, presentations or other relevant documents.",
    formats: "PDF, Excel (XLS/XLSX), PowerPoint (PPTX)",
    accept: ".pdf,.xls,.xlsx,.ppt,.pptx",
  },
];

export const Route = createFileRoute("/update-model/upload")({
  head: () => ({
    meta: [
      { title: "Populate Template — Update Model" },
      {
        name: "description",
        content:
          "Step 1 of 3: upload the last quarter standardized valuation model, audited financials and the client's financial model used to update your model.",
      },
      { property: "og:title", content: "Populate Template — Update Model" },
      {
        property: "og:description",
        content: "Step 1 of 3 of the portfolio company model update workflow.",
      },
    ],
  }),
  component: UpdateUpload,
});

function UpdateUpload() {
  const { state, saveProgress } = useApp();
  const navigate = useNavigate();
  const ready = UPDATE_MODEL_SLOTS.filter((slot) => slot.required).every(
    (slot) => (state.updateFiles[slot.key]?.length ?? 0) > 0,
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_B_STEPS} current={1} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <PageHeading
              step="Step 1 of 3"
              title="Populate Template"
              intro="Please upload the relevant documents below. These files will be used to update your standardized valuation model."
            />

            <div className="space-y-5">
              {UPDATE_MODEL_SLOTS.map((slot) => (
                <UploadCard key={slot.key} group="updateFiles" slot={slot} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <ButtonLink to="/" variant="secondary">
                <ArrowLeft className="size-4" />
                Cancel
              </ButtonLink>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={saveProgress}>
                  Save &amp; Exit
                </Button>
                <Button disabled={!ready} onClick={() => navigate({ to: "/update-model/updates" })}>
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
            {!ready && (
              <p className="mt-2 text-right text-sm text-muted-foreground">
                Upload the Last Quarter Standardized Valuation Model to continue.
              </p>
            )}
          </div>

          <SidePanel
            about="Upload the key documents listed on this page. These files will be used to extract relevant information and update your standardized valuation model."
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

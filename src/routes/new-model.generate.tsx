import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, ButtonLink } from "@/components/Button";
import { ModelOutputCard } from "@/components/ModelOutputCard";
import { RunConsole } from "@/components/RunConsole";
import { SidePanel } from "@/components/SidePanel";
import { StepProgress } from "@/components/StepProgress";
import { PageHeading } from "@/components/form";
import { runActions } from "@/lib/services/claudeService";
import { buildModel } from "@/lib/services/excelService";
import { useApp } from "@/lib/store";
import { WORKFLOW_A_STEPS } from "./new-model.company-information";

export const Route = createFileRoute("/new-model/generate")({
  head: () => ({
    meta: [
      { title: "Generate Standardized Model — IFC Valuation Assistant" },
      {
        name: "description",
        content:
          "Step 3 of 3: review your inputs, save your configuration and generate the standardized DCF valuation model.",
      },
      { property: "og:title", content: "Generate Standardized Model — IFC Valuation Assistant" },
      {
        property: "og:description",
        content: "Step 3 of 3 of the standardized DCF template workflow.",
      },
    ],
  }),
  component: GenerateStep,
});

function GenerateStep() {
  const { state, patch, saveProgress } = useApp();
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const answers = state.answers;

  const documents = Object.values(state.newFiles)
    .flat()
    .map((file) => file.name);

  const generate = async () => {
    setRunning(true);
    setLines(["Selecting standardized template from developer resources…"]);
    const prompts = state.prompts.filter(
      (prompt) => prompt.status === "Active" && prompt.step.startsWith("Workflow A"),
    );
    const log = await runActions(prompts, { documents, answers }, (message) =>
      setLines((prev) => [...prev, message]),
    );
    const model = buildModel({
      companyName: answers.companyName || "Company",
      templateUsed:
        state.resources.find((resource) => resource.id === "res-dcf")?.files[0] ??
        "IFC_Standard_DCF_RealSector.xlsx",
      appliedActions: [],
    });
    setLines((prev) => [...prev, "Adapting template and populating available data…", "Done."]);
    patch({ generated: model, log, savedAt: new Date().toISOString() });
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_A_STEPS} current={3} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <PageHeading
              step="Step 3 of 3"
              title="Generate Standardized Model"
              intro="Review your inputs and create the standardized valuation model. You can also save your configuration for future use."
              required={false}
            />

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-semibold text-navy">Configuration summary</p>
              <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
                <Row label="Company" value={answers.companyName || "—"} />
                <Row label="Sector" value={answers.sector || "—"} />
                <Row
                  label="Countries"
                  value={
                    [answers.mainCountry, answers.secondCountry, answers.thirdCountry]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <Row label="Reporting currency" value={answers.reportingCurrency || "—"} />
                <Row
                  label="Segmentation"
                  value={
                    answers.segmentBasis === "business_line"
                      ? `Business line · ${answers.segmentCount || "?"} segments`
                      : answers.segmentBasis === "revenue_stream"
                        ? `Revenue stream · ${answers.segmentCount || "?"} segments`
                        : "—"
                  }
                />
                <Row
                  label="Projection horizon"
                  value={
                    answers.projectionYears === "custom"
                      ? `${answers.customYears || "?"} years`
                      : answers.projectionYears
                        ? `${answers.projectionYears} years`
                        : "—"
                  }
                />
                <Row label="Documents uploaded" value={`${documents.length} file(s)`} />
                <Row
                  label="Liquidity put"
                  value={
                    answers.liquidityPut === "yes"
                      ? answers.putMechanisms.join(", ") || "Yes"
                      : answers.liquidityPut === "no"
                        ? "No"
                        : "—"
                  }
                />
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-panel font-heading text-sm font-bold text-primary">
                  1
                </span>
                <div>
                  <h3 className="font-heading text-[16px] font-bold">Save Information</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    Saves your questionnaire responses, uploaded files and configuration so you can
                    return later.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={saveProgress}>
                  <Save className="size-4" />
                  Save Information
                </Button>
                {state.savedAt && (
                  <span className="text-[13px] text-success">
                    Saved {new Date(state.savedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-panel font-heading text-sm font-bold text-primary">
                  2
                </span>
                <div>
                  <h3 className="font-heading text-[16px] font-bold">Generate Standardized Model</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    Identifies the appropriate standardized DCF template, applies your configuration,
                    runs the predefined prompt actions over your documents, populates what is
                    available and flags whatever is missing. Nothing is estimated or invented.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={generate} disabled={running}>
                  {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {running ? "Generating…" : "Generate Model"}
                </Button>
              </div>
              <div className="mt-4">
                <RunConsole lines={lines} running={running} />
              </div>
            </section>

            {state.generated && !running && (
              <ModelOutputCard
                title="Generated Template"
                model={state.generated}
                log={state.log}
                downloadLabel="Download Template"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <ButtonLink to="/new-model/upload" variant="secondary">
                <ArrowLeft className="size-4" />
                Back
              </ButtonLink>
              <ButtonLink to="/" variant="ghost">
                Start Over
              </ButtonLink>
            </div>
          </div>

          <SidePanel
            about="Save your information and generate the standardized valuation model. The model is based on your responses in Step 1, the documents uploaded in Step 2 and IFC's standard templates."
            tips={[
              "You can save your information and return later to make changes.",
              "The generated model is a standardized template. You may need to review and refine certain inputs.",
              "Unresolved inputs are flagged rather than estimated.",
              "If you encounter any issues, check the Guidelines or contact the team.",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  );
}

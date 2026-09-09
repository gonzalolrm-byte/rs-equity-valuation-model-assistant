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
import { UPDATE_ACTIONS } from "@/lib/data";
import { runActions } from "@/lib/services/claudeService";
import { buildModel } from "@/lib/services/excelService";
import { useApp } from "@/lib/store";
import { WORKFLOW_B_STEPS } from "./update-model.upload";

export const Route = createFileRoute("/update-model/review")({
  head: () => ({
    meta: [
      { title: "Review and Save — IFC Valuation Assistant" },
      {
        name: "description",
        content:
          "Step 3 of 3: save your selections for later, or apply the selected updates and download the updated standardized valuation model.",
      },
      { property: "og:title", content: "Review and Save — IFC Valuation Assistant" },
      {
        property: "og:description",
        content: "Step 3 of 3 of the portfolio company model update workflow.",
      },
    ],
  }),
  component: ReviewAndSave,
});

function ReviewAndSave() {
  const { state, patch, saveProgress } = useApp();
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const selected = UPDATE_ACTIONS.filter((action) =>
    state.selectedActions.includes(action.actionId),
  );
  const documents = Object.values(state.updateFiles)
    .flat()
    .map((file) => file.name);

  const run = async () => {
    setRunning(true);
    setLines(["Opening last quarter standardized model…"]);
    const prompts = state.prompts.filter(
      (prompt) => state.selectedActions.includes(prompt.id) && prompt.status === "Active",
    );
    const log = await runActions(prompts, { documents }, (message) =>
      setLines((prev) => [...prev, message]),
    );
    const model = buildModel({
      prefix: "IFC_Updated_Model",
      companyName: state.answers.companyName || "Portfolio_Company",
      templateUsed:
        state.updateFiles["last_quarter_model"]?.[0]?.name ?? "Last quarter standardized model",
      appliedActions: selected.map((action) => `${action.actionId} · ${action.label}`),
    });
    setLines((prev) => [...prev, "Writing values, preserving formulas and structure…", "Done."]);
    patch({ updated: model, log, savedAt: new Date().toISOString() });
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_B_STEPS} current={3} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <PageHeading
              step="Step 3 of 3"
              title="Review and Save"
              intro="Your updated valuation model is ready to be generated. You can save it for later or finalize and download it now."
              required={false}
            />

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-semibold text-navy">Selected updates</p>
              <ul className="mt-3 space-y-2 text-[13px] text-navy-soft">
                {selected.length === 0 && <li>No updates selected.</li>}
                {selected.map((action) => (
                  <li key={action.actionId} className="flex gap-2">
                    <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                      {action.actionId}
                    </span>
                    <span>{action.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-muted-foreground">
                {documents.length} document(s) uploaded in Step 1.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading text-[16px] font-bold">Save for Later</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Save your inputs and settings so you can return later to review or make further
                changes.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={saveProgress}>
                  <Save className="size-4" />
                  Save for Later
                </Button>
                {state.savedAt && (
                  <span className="text-[13px] text-success">
                    Saved {new Date(state.savedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading text-[16px] font-bold">Update and Generate Model</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Runs the predefined prompt action for each selected update, applies the results to
                the standardized model, and flags anything that could not be found.
              </p>
              <div className="mt-4">
                <Button onClick={run} disabled={running || selected.length === 0}>
                  {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {running ? "Updating…" : "Update and Generate Model"}
                </Button>
              </div>
              <div className="mt-4">
                <RunConsole lines={lines} running={running} />
              </div>
            </section>

            {state.updated && !running && (
              <ModelOutputCard
                title="Updated Valuation Model"
                model={state.updated}
                log={state.log}
                downloadLabel="Download Model"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <ButtonLink to="/update-model/updates" variant="secondary">
                <ArrowLeft className="size-4" />
                Back
              </ButtonLink>
              <ButtonLink to="/" variant="ghost">
                Start Over
              </ButtonLink>
            </div>
          </div>

          <SidePanel
            about="You can save your inputs for later or generate and download the updated standardized valuation model based on the selections made in Step 2."
            tips={[
              "Review the model before using it for valuation purposes.",
              "If you want to make further changes, you can go back to Step 2.",
              "The downloaded file is a standardized template with your selected updates applied.",
              "For additional guidance, refer to the Valuation Guidelines.",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

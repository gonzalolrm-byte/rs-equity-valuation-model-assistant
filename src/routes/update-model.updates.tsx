import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, ButtonLink } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import { StepProgress } from "@/components/StepProgress";
import { CheckItem, PageHeading } from "@/components/form";
import { UPDATE_ACTIONS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { WORKFLOW_B_STEPS } from "./update-model.upload";

export const Route = createFileRoute("/update-model/updates")({
  head: () => ({
    meta: [
      { title: "Update Standardized Valuation Model — Real Sector – Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Step 2 of 3: select the updates to apply — historicals roll-up, cost of equity, macro variables, YTD financials, calibration factors and debt inputs.",
      },
      {
        property: "og:title",
        content: "Update Standardized Valuation Model — Real Sector – Equity Valuation Model Assistant",
      },
      {
        property: "og:description",
        content: "Step 2 of 3 of the portfolio company model update workflow.",
      },
    ],
  }),
  component: UpdateSelections,
});

function UpdateSelections() {
  const { state, toggleAction } = useApp();
  const navigate = useNavigate();
  const promptById = new Map(state.prompts.map((prompt) => [prompt.id, prompt]));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_B_STEPS} current={2} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <PageHeading
              step="Step 2 of 3"
              title="Update Standardized Valuation Model"
              intro="Select the updates you want to apply to the standardized model. You can choose one or more options."
              required={false}
            />

            <div className="space-y-3">
              {UPDATE_ACTIONS.map((action) => {
                const prompt = promptById.get(action.actionId);
                const inactive = prompt && prompt.status !== "Active";
                return (
                  <div key={action.actionId} className="relative">
                    <CheckItem
                      label={action.label}
                      description={action.hint}
                      checked={state.selectedActions.includes(action.actionId)}
                      onChange={() => toggleAction(action.actionId)}
                    />
                    {inactive && (
                      <span className="absolute right-4 top-3 rounded bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                        Prompt inactive
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <ButtonLink to="/update-model/upload" variant="secondary">
                <ArrowLeft className="size-4" />
                Back
              </ButtonLink>
              <Button
                disabled={
                  state.navigationMode !== "free" && state.selectedActions.length === 0
                }
                onClick={() => navigate({ to: "/update-model/review" })}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
            {state.navigationMode !== "free" && state.selectedActions.length === 0 && (
              <p className="mt-2 text-right text-sm text-muted-foreground">
                Select at least one update to continue.
              </p>
            )}
          </div>

          <SidePanel
            about="Select the updates you want to apply to the standardized valuation model. You can choose one or more options. The system updates the model based on your selections."
            tips={[
              "Only select the updates that are relevant for this valuation cycle.",
              "You can combine multiple updates.",
              "Review the Guidelines if you need more information on each input.",
              "You will be able to review the updated model before saving.",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

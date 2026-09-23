import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { EditableText } from "@/lib/ui-content";

export const Route = createFileRoute("/role/user")({
  head: () => ({
    meta: [
      { title: "Model User — Real Sector Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Generate a standardized valuation model for the first time with the latest data.",
      },
      { property: "og:title", content: "Model User — Real Sector Equity Valuation Model Assistant" },
      {
        property: "og:description",
        content: "Generate a standardized valuation model.",
      },
    ],
  }),
  component: ModelUserPage,
});

function ModelUserPage() {
  const { state, patch } = useApp();
  const navigate = useNavigate();
  const selected = state.workflow === "new";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <div className="text-center">
          <EditableText as="p" className="eyebrow" group="Page heading">
            Model User
          </EditableText>
          <EditableText as="h1" className="mt-3 text-4xl font-extrabold sm:text-5xl" group="Page heading">
            What would you like to do?
          </EditableText>
          <EditableText as="p" className="mt-3 text-lg text-muted-foreground" group="Page heading">
            Select one option to get started.
          </EditableText>
        </div>

        <div className="mx-auto mt-10 grid max-w-xl gap-6">
          <ChoiceCard
            selected={selected}
            onSelect={() => patch({ workflow: "new" })}
            tone="primary"
            icon={<FileText className="size-7 text-primary" />}
            title="Generate a Standardized Model"
            description="Select this option if you want the app to identify the appropriate valuation template, adapt it based on your answers, and populate it using the information you provide."
            benefits={[
              "Find the right template",
              "Automatically adapt and populate",
              "Highlight missing information",
            ]}
          />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to roles
          </Link>
          <div className="flex flex-col items-center gap-2">
            <Button
              disabled={!selected}
              className="min-w-48 py-3"
              onClick={() => navigate({ to: "/new-model/company-information" })}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
            {!selected && (
              <p className="text-sm text-muted-foreground">Please select an option to continue.</p>
            )}
          </div>
          <span className="w-24" />
        </div>
      </main>
    </div>
  );
}

function ChoiceCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  benefits,
  tone,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  tone: "primary" | "success";
}) {
  const check = tone === "primary" ? "text-primary" : "text-success";
  const circleBg = tone === "primary" ? "bg-panel" : "bg-success-soft";
  const listBg = tone === "primary" ? "bg-panel/70" : "bg-success-soft/70";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "flex h-full flex-col rounded-2xl border bg-card p-7 text-left shadow-card transition-all",
        selected
          ? "border-primary ring-2 ring-ring/25"
          : "border-border hover:border-primary/50 hover:shadow-card-hover",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <span className={["flex size-14 items-center justify-center rounded-full", circleBg].join(" ")}>
          {icon}
        </span>
        <span
          className={[
            "flex size-6 items-center justify-center rounded-full border-2",
            selected ? "border-primary" : "border-input",
          ].join(" ")}
        >
          {selected && <span className="size-3 rounded-full bg-primary" />}
        </span>
      </div>

      <EditableText as="h2" className="mt-6 font-heading text-2xl font-bold leading-snug" group="Option title">
        {title}
      </EditableText>
      <EditableText as="p" className="mt-3 text-[15px] leading-relaxed text-muted-foreground" group="Option description">
        {description}
      </EditableText>

      <ul className={["mt-6 space-y-2.5 rounded-xl p-4", listBg].join(" ")}>
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5 text-sm text-navy">
            <CheckCircle2 className={`size-4.5 shrink-0 ${check}`} />
            <EditableText group="Option benefit">{benefit}</EditableText>
          </li>
        ))}
      </ul>
    </button>
  );
}

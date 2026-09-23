import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Lock, Settings, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { useApp } from "@/lib/store";
import { EditableText } from "@/lib/ui-content";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Real Sector – Equity Valuation Model Assistant — Standardized DCF Models" },
      {
        name: "description",
        content:
          "Create a standardized DCF valuation model for the first time, or update an existing portfolio company model with the latest financial, operational and market information.",
      },
      { property: "og:title", content: "Real Sector – Equity Valuation Model Assistant — Standardized DCF Models" },
      {
        property: "og:description",
        content:
          "Create a standardized DCF valuation model, or update an existing portfolio company model with the latest data.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { state, patch } = useApp();
  const navigate = useNavigate();
  const selected = state.workflow;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="text-center">
          <EditableText as="p" className="eyebrow" group="Page heading">
            Welcome to Real Sector – Equity Valuation Model Assistant
          </EditableText>
          <EditableText
            as="h1"
            className="mt-3 text-4xl font-extrabold sm:text-5xl"
            group="Page heading"
          >
            What would you like to do?
          </EditableText>
          <EditableText as="p" className="mt-3 text-lg text-muted-foreground" group="Page heading">
            Select one option to get started.
          </EditableText>
        </div>


        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <OptionCard
            selected={selected === "developer"}
            onSelect={() => patch({ workflow: "developer" })}
            tone="developer"
            icon={
              <span className="flex items-center gap-1">
                <Settings className="size-6 text-navy" />
                <Lock className="size-4 text-navy-soft" />
              </span>
            }
            title="Developer Console"
            description="Manage templates, resources, prompts, and application configuration."
            benefits={[
              "Manage templates & resources",
              "Edit prompts & actions",
              "Configure application settings",
            ]}
          />
          <OptionCard
            selected={selected === "new"}
            onSelect={() => patch({ workflow: "new" })}
            tone="primary"
            icon={<FileText className="size-7 text-primary" />}
            title="Use a Standardized DCF Template for the First Time"
            description="Select this option if you want the app to identify the appropriate valuation template, adapt it based on your answers, and populate it using the information you provide."
            benefits={[
              "Find the right template",
              "Automatically adapt and populate",
              "Highlight missing information",
            ]}
          />
          <OptionCard
            selected={selected === "update"}
            onSelect={() => patch({ workflow: "update" })}
            tone="success"
            icon={<TrendingUp className="size-7 text-success" />}
            title="Update an Existing Standardized Portfolio Company Model"
            description="Select this option if you already have a standardized valuation model and want to update it with the latest financial, operational, and market information."
            benefits={[
              "Upload your existing model",
              "Update with latest data",
              "Highlight missing information",
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <Button
            disabled={!selected}
            className="min-w-48 py-3"
            onClick={() =>
              navigate({
                to:
                  selected === "new"
                    ? "/new-model/company-information"
                    : selected === "update"
                      ? "/update-model/upload"
                      : "/developer/resources",
              })
            }
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
          {!selected && (
            <p className="text-sm text-muted-foreground">Please select an option to continue.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function OptionCard({
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
  tone: "primary" | "success" | "developer";
}) {
  const check = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-navy";
  const circleBg =
    tone === "primary" ? "bg-panel" : tone === "success" ? "bg-success-soft" : "bg-secondary";
  const listBg =
    tone === "primary"
      ? "bg-panel/70"
      : tone === "success"
        ? "bg-success-soft/70"
        : "bg-secondary/70";

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
        <span
          className={[
            "flex size-14 items-center justify-center rounded-full",
            circleBg,
          ].join(" ")}
        >
          {icon}
        </span>
        <span className="flex flex-col items-end gap-2">
          {tone === "developer" && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Developer Only
            </span>
          )}
          <span
            className={[
              "flex size-6 items-center justify-center rounded-full border-2",
              selected ? "border-primary" : "border-input",
            ].join(" ")}
          >
            {selected && <span className="size-3 rounded-full bg-primary" />}
          </span>
        </span>
      </div>

      <EditableText
        as="h2"
        className="mt-6 font-heading text-2xl font-bold leading-snug"
        group="Option title"
      >
        {title}
      </EditableText>
      <EditableText
        as="p"
        className="mt-3 text-[15px] leading-relaxed text-muted-foreground"
        group="Option description"
      >
        {description}
      </EditableText>

      <ul
        className={[
          "mt-6 space-y-2.5 rounded-xl p-4",
          listBg,
        ].join(" ")}
      >
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

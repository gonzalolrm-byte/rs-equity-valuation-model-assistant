import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Lock, SearchCheck, Settings, User } from "lucide-react";
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
          "Select your role in the standardized valuation model lifecycle: Model Owner / Developer, Model User, or Model Validator.",
      },
      { property: "og:title", content: "Real Sector – Equity Valuation Model Assistant — Standardized DCF Models" },
      {
        property: "og:description",
        content:
          "Select your role: develop and maintain standardized valuation models, use them for transactions, or validate them.",
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
      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="text-center">
          <EditableText as="p" className="text-lg text-muted-foreground" group="Page heading">
            Choose the option that best matches your role in the model lifecycle.
          </EditableText>
        </div>


        <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
            badge="Restricted Access"
            title="Model Owner / Developer"
            description="Create and maintain standardized valuation models, manage templates and resources, and configure application settings."
            benefits={[
              "Manage templates & resources",
              "Edit prompts & actions",
              "Configure application settings",
              "Maintain and develop models",
            ]}
          />
          <OptionCard
            selected={selected === "user"}
            onSelect={() => patch({ workflow: "user" })}
            tone="primary"
            icon={<User className="size-7 text-primary" />}
            title="Model User"
            description="Use standardized valuation models for transactions, either generate a new model or update an existing one with the latest data."
            benefits={[
              "Generate a standardized model",
              "Update an existing model",
              "Input financial, operational, and market data",
              "Generate results and reports",
              "Highlight missing information",
            ]}
          />
          <OptionCard
            selected={selected === "validator"}
            onSelect={() => patch({ workflow: "validator" })}
            tone="success"
            icon={<SearchCheck className="size-7 text-success" />}
            title="Model Validator"
            description="Review and validate standardized valuation models to ensure compliance, accuracy, and robustness."
            benefits={[
              "Assess model design and logic",
              "Perform independent testing",
              "Benchmark against standards",
              "Document findings and recommendations",
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
                  selected === "developer"
                    ? "/developer/resources"
                    : selected === "user"
                      ? "/role/user"
                      : "/validator",
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
  badge,
  title,
  description,
  benefits,
  tone,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  badge?: string;
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
          <span
            className={[
              "flex size-6 items-center justify-center rounded-full border-2",
              selected ? "border-primary" : "border-input",
            ].join(" ")}
          >
            {selected && <span className="size-3 rounded-full bg-primary" />}
          </span>
          {badge && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {badge}
            </span>
          )}
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

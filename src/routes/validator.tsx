import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, SearchCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { EditableText } from "@/lib/ui-content";

export const Route = createFileRoute("/validator")({
  head: () => ({
    meta: [
      { title: "Model Validator — Real Sector Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Review and validate standardized valuation models to ensure compliance, accuracy, and robustness.",
      },
      { property: "og:title", content: "Model Validator — Real Sector Equity Valuation Model Assistant" },
      {
        property: "og:description",
        content: "Review and validate standardized valuation models.",
      },
    ],
  }),
  component: ValidatorPage,
});

function ValidatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="text-center">
          <EditableText as="p" className="eyebrow" group="Page heading">
            Model Validator
          </EditableText>
          <EditableText as="h1" className="mt-3 text-4xl font-extrabold sm:text-5xl" group="Page heading">
            Model Validation
          </EditableText>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft">
            <SearchCheck className="size-7 text-success" />
          </span>
          <EditableText
            as="h2"
            className="mt-6 font-heading text-2xl font-bold leading-snug"
            group="Section heading"
          >
            Validation tools are on the way
          </EditableText>
          <EditableText
            as="p"
            className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
            group="Section description"
          >
            The model-validation workflow and related tools are currently being defined. This area
            will provide access to validation checks, benchmarking, and documentation of findings.
          </EditableText>
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to roles
          </Link>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { COGS_CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Valuation Guidelines — IFC Valuation Assistant" },
      {
        name: "description",
        content:
          "Guidance on segmentation, COGS categories, CapEx modeling, projection horizons, share classes and liquidity put mechanics for standardized DCF models.",
      },
      { property: "og:title", content: "Valuation Guidelines — IFC Valuation Assistant" },
      {
        property: "og:description",
        content: "Segmentation, COGS, CapEx, projection horizon and liquidity put guidance.",
      },
    ],
  }),
  component: Guidelines,
});

function Guidelines() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow">Reference</p>
        <h1 className="mt-2 text-3xl font-extrabold">Valuation Guidelines</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Summary guidance for completing the questionnaire. The full guidelines document will be
          linked here once the document library is connected.
        </p>

        <div className="mt-8 space-y-6">
          <Section title="Segmentation">
            Segment by <strong>business line</strong> when the business is managed and reported by
            line (Retail, Online, Wholesale). Segment by <strong>revenue stream</strong> when the
            economics differ by product or service type. Standardized templates support up to four
            segments, including “Other”.
          </Section>

          <Section title="COGS categories">
            Keep the standard categories separate wherever data allows — the breakdown drives more
            robust forecasting. Only combine categories under “Other Direct Costs” when the data is
            unavailable or the category is not relevant. Standard categories:
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {COGS_CATEGORIES.map((category) => (
                <li key={category}>· {category}</li>
              ))}
            </ul>
          </Section>

          <Section title="CapEx">
            Segment CapEx when investment needs differ materially across segments and segment-level
            data exists; otherwise model at company level.
          </Section>

          <Section title="Projection horizon">
            Five years suits stable, mature businesses. Ten years suits businesses still ramping.
            Horizons beyond ten years should be justified — typically long-lived concessions or
            infrastructure assets.
          </Section>

          <Section title="Share classes and liquidity puts">
            Where preferred shares exist, the preferred waterfall template is appended. Put pricing
            may combine mechanisms (for example the maximum of an IRR-based and a multiple-based
            price), so select every applicable mechanism.
          </Section>

          <Section title="Missing information">
            Data is never estimated. Unresolved required inputs are reported as “Data not found”,
            “Missing information” or “Requires user input” and must be completed before the model is
            used for valuation purposes.
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-[16px] font-bold">{title}</h2>
      <div className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

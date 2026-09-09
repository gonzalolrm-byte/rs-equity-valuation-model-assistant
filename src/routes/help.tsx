import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ButtonLink } from "@/components/Button";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — IFC Valuation Assistant" },
      {
        name: "description",
        content:
          "How the IFC Valuation Assistant works: the two workflows, what to upload, how missing information is flagged, and where to get support.",
      },
      { property: "og:title", content: "Help — IFC Valuation Assistant" },
      {
        property: "og:description",
        content: "How the two valuation workflows work and what to upload for each.",
      },
    ],
  }),
  component: Help,
});

function Help() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow">Support</p>
        <h1 className="mt-2 text-3xl font-extrabold">Help</h1>

        <div className="mt-8 space-y-6">
          <Block title="Which option should I choose?">
            Choose <strong>Use a Standardized DCF Template for the First Time</strong> when a company
            has no standardized model yet. Choose{" "}
            <strong>Update an Existing Standardized Portfolio Company Model</strong> when you already
            hold last quarter's standardized model and only need to refresh it.
          </Block>
          <Block title="What happens to my documents?">
            Documents are used only to extract the information needed to adapt and populate the
            standardized template. In this prototype build nothing is uploaded to a server — files
            stay in your browser session.
          </Block>
          <Block title="What if information is missing?">
            The assistant never estimates or invents financial data. Anything it cannot find is
            reported as <em>Data not found</em>, <em>Missing information</em> or{" "}
            <em>Requires user input</em>, listed alongside the generated model.
          </Block>
          <Block title="Can I stop and return later?">
            Yes. Use <strong>Save Information</strong> or <strong>Save for Later</strong> at any
            step; your answers, selections and file list are kept.
          </Block>
          <Block title="Prototype limitations">
            Claude and the Excel generation engine are not connected in this build, so downloads are
            a manifest of what would be produced rather than a workbook.
          </Block>
        </div>

        <div className="mt-10 flex gap-3">
          <ButtonLink to="/guidelines" variant="secondary">
            View Guidelines
          </ButtonLink>
          <ButtonLink to="/contact">Contact the team</ButtonLink>
        </div>
      </main>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-[16px] font-bold">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}

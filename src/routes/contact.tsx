import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Mail, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Real Sector – Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Reach the valuation team for questions on standardized templates, model updates or access to the Developer Console.",
      },
      { property: "og:title", content: "Contact — Real Sector – Equity Valuation Model Assistant" },
      {
        property: "og:description",
        content: "Reach the valuation team for template, model update or access questions.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow">Get in touch</p>
        <h1 className="mt-2 text-3xl font-extrabold">Contact</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Contact details below are placeholders for the prototype — send me the real team names,
          mailboxes and links and I will put them in.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card
            icon={<Mail className="size-5 text-primary" />}
            title="Valuation support"
            lines={["[team mailbox — to be provided]", "Response within 2 business days"]}
          />
          <Card
            icon={<Users className="size-5 text-success" />}
            title="Developer Console access"
            lines={["[owner name — to be provided]", "Role-based access is added with the backend"]}
          />
          <Card
            icon={<BookOpen className="size-5 text-warning" />}
            title="Guidelines and methodology"
            lines={["[guidelines document link — to be provided]"]}
          />
        </div>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-full bg-panel">{icon}</span>
      <h2 className="mt-3 font-heading text-[16px] font-bold">{title}</h2>
      <ul className="mt-2 space-y-1 text-[14px] text-muted-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

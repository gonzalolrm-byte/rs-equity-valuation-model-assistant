import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, FolderOpen, MessageSquareCode, Settings, SlidersHorizontal } from "lucide-react";
import { IfcLockup } from "@/components/AppHeader";
import { useApp, type NavigationMode } from "@/lib/store";

export const Route = createFileRoute("/developer")({
  component: DeveloperLayout,
});


function DeveloperLayout() {
  const { state, patch } = useApp();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <span className="flex items-center gap-4">
            <IfcLockup />
            <span className="hidden h-10 w-px bg-border md:block" />
            <span className="hidden md:block">
              <span className="block font-heading text-lg font-bold leading-tight text-navy">
                Real Sector – Equity Valuation Model Assistant
              </span>
              <span className="block text-sm text-muted-foreground">Developer Console</span>
            </span>
          </span>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="size-4" />
            Back to User Interface
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-panel-border bg-panel p-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-card">
              <Settings className="size-5 text-primary" />
            </span>
            <p className="mt-3 font-heading text-[15px] font-bold">Developer</p>
            <p className="mt-1 text-[13px] leading-relaxed text-navy-soft">
              Access developer tools, manage prompts and templates.
            </p>
          </div>
          <nav className="space-y-1.5">
            <NavItem
              to="/developer/sector-specifics"
              icon={<SlidersHorizontal className="size-4" />}
              label="Sector Specifics"
            />
            <NavItem
              to="/developer/resources"
              icon={<FolderOpen className="size-4" />}
              label="Market Data & Additional Templates"
            />
            <NavItem
              to="/developer/prompts"
              icon={<MessageSquareCode className="size-4" />}
              label="Prompts & Actions"
            />
          </nav>
          <div className="rounded-xl border border-panel-border bg-card p-4">
            <p className="font-heading text-[14px] font-bold text-navy">Navigation Mode</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Controls whether required fields must be completed before moving between steps.
            </p>
            <div className="mt-3 space-y-2">
              <ModeOption
                value="required"
                current={state.navigationMode}
                onSelect={(mode) => patch({ navigationMode: mode })}
                label="Complete Required Data"
                description="Follow the standard workflow and complete all required fields before proceeding."
              />
              <ModeOption
                value="free"
                current={state.navigationMode}
                onSelect={(mode) => patch({ navigationMode: mode })}
                label="Free Navigation"
                description="Navigate freely across all sections without completing the required questionnaire or fields."
              />
            </div>
          </div>
          <p className="rounded-xl border border-border bg-card p-4 text-[12px] leading-relaxed text-muted-foreground">
            Prototype access control: this console is unprotected in this build. Role-based
            authorization is added with the backend in the next phase.
          </p>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ModeOption({
  value,
  current,
  onSelect,
  label,
  description,
}: {
  value: NavigationMode;
  current: NavigationMode;
  onSelect: (mode: NavigationMode) => void;
  label: string;
  description: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-primary bg-panel"
          : "border-input hover:bg-secondary"
      }`}
      aria-pressed={active}
    >
      <span className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
            active ? "border-primary" : "border-input"
          }`}
        >
          {active && <span className="size-2 rounded-full bg-primary" />}
        </span>
        <span>
          <span className="block text-[13px] font-semibold text-navy">{label}</span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-navy-soft transition-colors hover:bg-secondary hover:text-navy"
      activeProps={{ className: "bg-panel text-navy border border-panel-border" }}
    >
      {icon}
      {label}
    </Link>
  );
}

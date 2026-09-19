import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, FileSpreadsheet, FolderOpen, KeyRound, Lock, MessageSquareCode, Pencil, Settings, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { IfcLockup } from "@/components/AppHeader";
import { useApp, type NavigationMode } from "@/lib/store";
import { EditableText, useUiContent } from "@/lib/ui-content";
import {
  isDeveloperUnlocked,
  lockDeveloper,
  unlockDeveloper,
} from "@/lib/developer-gate.functions";

export const Route = createFileRoute("/developer")({
  component: DeveloperGate,
});

/** Passcode gate in front of the Developer Console. */
function DeveloperGate() {
  const checkUnlocked = useServerFn(isDeveloperUnlocked);
  const unlock = useServerFn(unlockDeveloper);
  const lock = useServerFn(lockDeveloper);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    checkUnlocked()
      .then((r) => active && setUnlocked(r.unlocked))
      .catch(() => active && setUnlocked(false));
    return () => {
      active = false;
    };
  }, [checkUnlocked]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const { ok } = await unlock({ data: { passcode } });
      if (ok) {
        setUnlocked(true);
        setPasscode("");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-[15px] text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-2xl border border-panel-border bg-card p-7 shadow-card"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-panel">
            <Lock className="size-5 text-primary" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-navy">Developer Only</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Enter the passcode to open the Developer Console.
          </p>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="mt-4 h-11 w-full rounded-lg border border-input bg-card px-3 text-[15px] text-navy outline-none focus:border-primary"
          />
          {error && (
            <p className="mt-2 text-[13px] font-medium text-destructive">Incorrect passcode.</p>
          )}
          <button
            type="submit"
            disabled={busy || passcode.length === 0}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <KeyRound className="size-4" />
            {busy ? "Checking…" : "Unlock"}
          </button>
          <Link
            to="/"
            className="mt-3 block text-center text-[13px] font-semibold text-primary hover:underline"
          >
            Back to User Interface
          </Link>
        </form>
      </div>
    );
  }

  return (
    <DeveloperLayout
      onLock={async () => {
        await lock({ data: undefined });
        setUnlocked(false);
      }}
    />
  );
}

function DeveloperLayout({ onLock }: { onLock: () => void }) {

  const { state, patch } = useApp();
  const ui = useUiContent();
  const navigate = useNavigate();
  const startUiEditing = () => {
    ui.startEditing();
    navigate({ to: "/" });
  };
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
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={startUiEditing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Pencil className="size-4" />
              Edit User Interface
            </button>
            <button
              type="button"
              onClick={ui.startEditing}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-panel"
            >
              <Pencil className="size-4" />
              Edit Developer Console
            </button>
            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <Lock className="size-4" />
              Lock Console
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-4" />
              Back to User Interface
            </Link>
          </div>

        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-panel-border bg-panel p-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-card">
              <Settings className="size-5 text-primary" />
            </span>
            <EditableText as="p" className="mt-3 block font-heading text-[15px] font-bold" group="Developer Console">
              Developer
            </EditableText>
            <EditableText as="p" className="mt-1 block text-[13px] leading-relaxed text-navy-soft" group="Developer Console">
              Access developer tools, manage prompts and templates.
            </EditableText>
          </div>
          <nav className="space-y-1.5">
            <NavItem
              to="/developer/generic-templates"
              icon={<FileSpreadsheet className="size-4" />}
              label="Generic DCF Templates"
            />
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
            <NavItem
              to="/developer/governance"
              icon={<ShieldCheck className="size-4" />}
              label="Governance"
            />
          </nav>
          <div className="rounded-xl border border-panel-border bg-card p-4">
            <EditableText as="p" className="block font-heading text-[14px] font-bold text-navy" group="Developer Console">
              Navigation Mode
            </EditableText>
            <EditableText as="p" className="mt-1 block text-[12px] leading-relaxed text-muted-foreground" group="Developer Console">
              Controls whether required fields must be completed before moving between steps.
            </EditableText>
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
            This console is protected by a shared passcode. Individual accounts and role-based
            authorization are added with the backend in the next phase.
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
            <EditableText className="block text-[13px] font-semibold text-navy" group="Developer Console">
              {label}
            </EditableText>
            <EditableText className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground" group="Developer Console">
              {description}
            </EditableText>
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
      <EditableText group="Developer Console navigation">{label}</EditableText>
    </Link>
  );
}

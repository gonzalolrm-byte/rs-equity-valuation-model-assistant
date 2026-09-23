import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { FolderOpen, Home, KeyRound, Lock, MessageSquareCode, Pencil, ShieldCheck, SlidersHorizontal } from "lucide-react";
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
        <div className="mx-auto grid max-w-[1560px] grid-cols-[auto_1fr_auto] items-start gap-x-6 gap-y-1 px-5 py-2">
          <div className="col-start-1 row-span-3 row-start-1 flex items-start pt-0.5">
            <IfcLockup />
          </div>

          <div className="col-start-2 row-start-1 flex items-center">
            <span className="block font-heading text-[17px] font-bold leading-tight text-navy">
              Real Sector – Equity Valuation Model Assistant
            </span>
          </div>

          <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-navy-soft transition-colors hover:text-navy"
            >
              <Home className="size-4" />
              Home
            </Link>
            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-navy-soft transition-colors hover:text-navy"
            >
              <Lock className="size-4" />
              Protected Console
            </button>
            <span className="flex size-8 items-center justify-center rounded-full bg-panel text-[11px] font-bold text-navy">GL</span>
          </div>

          <div className="col-start-2 row-start-2 flex items-center">
            <span className="block text-[13px] text-muted-foreground">Developer Console</span>
          </div>

          <div className="col-start-2 row-start-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startUiEditing}
              className="hidden items-center gap-2 rounded-lg border border-input px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-secondary lg:inline-flex"
            >
              <Pencil className="size-4" />
              Edit UI
            </button>
            <button
              type="button"
              onClick={ui.startEditing}
              className="hidden items-center gap-2 rounded-lg border border-input px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-panel lg:inline-flex"
            >
              <Pencil className="size-4" />
              Edit Console
            </button>
            <div className="flex items-center gap-2">
              <EditableText as="span" className="hidden text-[11px] font-semibold text-navy sm:inline" group="Developer Console">
                Navigation Mode:
              </EditableText>
              <select
                value={state.navigationMode}
                onChange={(event) => patch({ navigationMode: event.target.value as NavigationMode })}
                className="h-8 rounded-md border border-input bg-card px-3 text-[11px] font-semibold text-navy outline-none focus:border-primary"
                aria-label="Navigation mode"
              >
                <option value="required">Complete Required Data</option>
                <option value="free">Free Navigation</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1560px] px-2.5 py-2">
        <div className="flex min-w-0 flex-col gap-2">
          <nav className="flex min-w-0 flex-wrap items-center gap-1 rounded-lg border border-panel-border bg-panel/45 p-1 shadow-card">
            <NavItem
              to="/developer/sector-specifics"
              icon={<SlidersHorizontal className="size-4" />}
              label="Sector Specifics"
            />

            <NavItem
              to="/developer/resources"
              icon={<FolderOpen className="size-4" />}
              label="Core Information"
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
          <main className="min-w-0">
          <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex h-9 min-w-fit items-center gap-2 border-b-2 border-transparent px-4 text-[12px] font-semibold text-navy-soft transition-colors hover:bg-card hover:text-navy"
      activeProps={{ className: "border-primary bg-card text-navy" }}
    >
      {icon}
      <EditableText group="Developer Console navigation">{label}</EditableText>
    </Link>
  );
}

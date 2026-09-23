import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Home, KeyRound, Lock, Pencil } from "lucide-react";
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
        <div className="mx-auto flex max-w-[1560px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4">
            <IfcLockup />
            <span className="font-heading text-[17px] font-bold leading-none text-navy">
              Real Sector – Equity Valuation Model Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        <div className="border-t border-border bg-panel/30">
          <div className="mx-auto flex max-w-[1560px] items-center justify-between px-5 py-2.5">
            <span className="text-[13px] font-semibold leading-none text-muted-foreground">Developer Console</span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={startUiEditing}
                className="hidden items-center gap-2 rounded-full border border-input bg-card px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-secondary lg:inline-flex"
              >
                <Pencil className="size-4" />
                Edit UI
              </button>
              <button
                type="button"
                onClick={ui.startEditing}
                className="hidden items-center gap-2 rounded-full border border-input bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-panel lg:inline-flex"
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
                  className="h-8 rounded-full border border-input bg-card px-4 text-[11px] font-semibold text-navy outline-none focus:border-primary"
                  aria-label="Navigation mode"
                >
                  <option value="required">Complete Required Data</option>
                  <option value="free">Free Navigation</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1560px] px-2.5 pt-1 pb-2">
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

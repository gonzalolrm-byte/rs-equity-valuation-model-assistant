import { Link } from "@tanstack/react-router";
import { BookOpen, CircleHelp, Mail, UserRound } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
        <Link to="/" className="flex items-center gap-4">
          <IfcLockup />
          <span className="hidden h-10 w-px bg-border md:block" />
          <span className="hidden md:block">
            <span className="block font-heading text-lg font-bold leading-tight text-navy">
              Real Sector – Equity Valuation Model Assistant
            </span>
            <span className="block text-sm text-muted-foreground">
              CROMC Equity Team
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <HeaderLink to="/help" icon={<CircleHelp className="size-4" />} label="Help" />
          <HeaderLink to="/guidelines" icon={<BookOpen className="size-4" />} label="Guidelines" />
          <HeaderLink to="/contact" icon={<Mail className="size-4" />} label="Contact" />
          <span className="ml-1 flex size-9 items-center justify-center rounded-full bg-secondary text-navy-soft">
            <UserRound className="size-4" />
          </span>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
      activeProps={{ className: "text-navy bg-secondary" }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function IfcLockup() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary font-heading text-[11px] font-extrabold tracking-tight text-primary-foreground">
        IFC
      </span>
      <span className="hidden leading-[1.15] sm:block">
        <span className="block font-heading text-[11px] font-bold text-primary">
          International
        </span>
        <span className="block font-heading text-[11px] font-bold text-primary">
          Finance Corporation
        </span>
        <span className="block text-[8px] font-semibold tracking-[0.14em] text-navy-soft">
          WORLD BANK GROUP
        </span>
      </span>
    </span>
  );
}

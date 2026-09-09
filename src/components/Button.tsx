import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground",
  success: "bg-success text-success-foreground hover:bg-success/90",
  secondary: "border border-input bg-card text-navy hover:bg-secondary",
  ghost: "text-navy-soft hover:bg-secondary hover:text-navy",
  danger: "border border-destructive/30 text-destructive hover:bg-destructive/10",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  variant?: Variant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  children,
  className = "",
}: {
  to: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

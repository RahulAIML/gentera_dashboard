"use client";
// ============================================================
// PAGE SHELL — unified layout primitive
// Every dashboard page composes through PageShell + PageSection
// to enforce consistent rhythm, spacing, typography and hierarchy.
// ============================================================
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";
import { useResolvedScope } from "@/hooks/useAnalyticsData";
import { Building2 } from "lucide-react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;            // small label above title
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
}: PageShellProps) {
  const { t } = useI18n();
  const scope = useResolvedScope();

  return (
    <div className="min-h-full bg-surface-950">
      {/* ── Page Header ─────────────────────────────────── */}
      <header className="px-8 pt-7 pb-5 border-b border-border bg-gradient-to-b from-surface-900/40 to-transparent">
        <div className="max-w-[1440px] mx-auto">
          {eyebrow && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400 mb-1.5">
              {eyebrow}
            </div>
          )}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-bold text-text-primary leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[13px] text-text-muted mt-1.5 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>

          {/* Context strip — always shows the active scope */}
          {scope && (
            <div className="mt-4 flex items-center gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-800/60 border border-border text-text-muted">
                <Building2 className="w-3 h-3 text-brand-400" />
                <span className="text-text-disabled uppercase tracking-wider text-[9px] font-semibold">
                  {t.scope.viewingAs}
                </span>
                <span className="text-text-primary font-medium">{scope.label}</span>
                <span className="text-text-disabled">·</span>
                <span className="text-text-muted">{scope.description}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="px-8 py-7">
        <div className="max-w-[1440px] mx-auto space-y-6">{children}</div>
      </div>
    </div>
  );
}

// ── PageSection — consistent section block ────────────
interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
  variant?: "card" | "bare";
}

export function PageSection({
  title,
  description,
  actions,
  className,
  children,
  variant = "card",
}: PageSectionProps) {
  const wrap =
    variant === "card"
      ? "rounded-2xl border border-border bg-surface-900/60 backdrop-blur-sm"
      : "";

  return (
    <section className={cn(wrap, className)}>
      {(title || actions) && (
        <header
          className={cn(
            "flex items-center justify-between gap-4 flex-wrap",
            variant === "card" ? "px-5 pt-4 pb-3" : "pb-3",
          )}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="text-[13px] font-semibold text-text-primary leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[11px] text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cn(variant === "card" ? "px-5 pb-5" : "")}>{children}</div>
    </section>
  );
}

// ── Empty state — consistent placeholder ──────────────
export function PageEmpty({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-center py-16 text-[12px] text-text-disabled">
      {message ?? t.scope.noData}
    </div>
  );
}

"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ExecutiveLayoutProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  aiAssistant?: ReactNode;
}

export function ExecutiveLayout({
  children,
  className,
  header,
  sidebar,
  actions,
  filters,
  aiAssistant,
}: ExecutiveLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-surface-950", className)}>
      {/* Sidebar */}
      {sidebar && (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden xl:flex fixed left-0 top-0 h-full w-72 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 z-40">
            {sidebar}
          </aside>
          
          {/* Mobile Sidebar Overlay */}
          <div className="xl:hidden fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-40 peer" />
          
          {/* Mobile Sidebar */}
          <aside className="xl:hidden fixed left-0 top-0 h-full w-72 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 z-50 transform -translate-x-full peer-hover:translate-x-0 transition-transform duration-300">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebar ? "xl:ml-72" : "ml-0")}>
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-surface-900/95 backdrop-blur-xl border-b border-surface-800/50">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              {sidebar && (
                <button className="xl:hidden p-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-200 hover:bg-surface-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              {header}
              {filters && (
                <div className="hidden lg:block">
                  {filters}
                </div>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Filters */}
        {filters && (
          <div className="lg:hidden border-b border-surface-800/50 bg-surface-900/95">
            <div className="container py-3">
              {filters}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="container py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      {aiAssistant}
    </div>
  );
}

/* ============================================================
   EXECUTIVE PAGE SECTIONS
   Modular, reusable page sections with consistent spacing
   ============================================================ */

interface ExecutiveSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "card" | "elevated" | "minimal";
}

export function ExecutiveSection({
  children,
  title,
  subtitle,
  actions,
  className,
  size = "lg",
  variant = "default",
}: ExecutiveSectionProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  const variantClasses = {
    default: "",
    card: "bg-surface-800/60 backdrop-blur-sm border border-surface-700/60 rounded-2xl p-6",
    elevated: "bg-surface-850/80 backdrop-blur-md border border-surface-700/80 rounded-2xl p-8 shadow-xl",
    minimal: "py-12",
  };

  return (
    <section className={cn("mb-12", className)}>
      {title && (
        <div className="container mb-8">
          <div className="flex items-center justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-surface-50 leading-tight mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-base text-surface-300 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={cn("container", sizeClasses[size])}>
        <div className={cn(variantClasses[variant])}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EXECUTIVE GRID SYSTEM
   Consistent, responsive grid layouts
   ============================================================ */

interface ExecutiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ExecutiveGrid({
  children,
  cols = 3,
  gap = "lg",
  className,
}: ExecutiveGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  };

  return (
    <div className={cn(
      "grid",
      gridClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

/* ============================================================
   EXECUTIVE METRIC ROW
   Horizontal KPI display with consistent spacing
   ============================================================ */

interface ExecutiveMetricRowProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function ExecutiveMetricRow({
  children,
  className,
  scrollable = false,
}: ExecutiveMetricRowProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-2",
      scrollable && "overflow-x-auto scrollbar-hide lg:grid-cols-4 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

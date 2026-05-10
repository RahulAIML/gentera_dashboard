import Link from "next/link";
import { Zap, BarChart3, Brain, Users, TrendingUp, Shield, ArrowRight, Check } from "lucide-react";

// Real validated metrics
const REAL_STATS = [
  { label: "Simulaciones analizadas", value: "146", sub: "Oct 2025 – Abr 2026" },
  { label: "Asesores únicos",         value: "74",  sub: "en 7 meses de datos" },
  { label: "Tasa de aprobación",      value: "38.4%", sub: "56 de 146 sesiones" },
  { label: "Puntaje promedio",        value: "26.8%", sub: "global del período" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Analytics Conversacional",
    description:
      "Visualiza el rendimiento de cada asesor por interacción. Detecta patrones de fallo y fortalezas con datos en tiempo real.",
  },
  {
    icon: Brain,
    title: "Coaching con IA",
    description:
      "El copiloto IA genera insights automáticos basados en datos reales — identifica quién necesita atención inmediata.",
  },
  {
    icon: Users,
    title: "Inteligencia Organizacional",
    description:
      "Visibilidad completa del equipo: rankings, tendencias, actividades críticas y usuarios en riesgo — todo en un solo lugar.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-950 text-text-primary overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 65%)" }}
        />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-border bg-surface-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-text-primary">Gentera Intelligence</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {["Funcionalidades", "Analytics", "Enterprise"].map((item) => (
              <span key={item} className="text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm text-text-muted hover:text-text-primary transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Ver demo
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot text-emerald-400" />
            Plataforma activa · Datos en tiempo real
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            <span className="text-text-primary">Inteligencia Conversacional</span>
            <br />
            <span className="gradient-brand">para asesores financieros</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
            Analiza, entrena y optimiza el desempeño de tu equipo de asesores con IA.
            Insights en tiempo real, coaching personalizado y métricas organizacionales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all text-sm shadow-lg shadow-brand-900/30 hover:shadow-brand-900/50"
            >
              Ir al dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border-strong transition-all text-sm"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section className="relative z-10 py-12 px-6 border-y border-border bg-surface-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {REAL_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black gradient-brand mb-1">{s.value}</div>
              <div className="text-xs font-semibold text-text-secondary mb-0.5">{s.label}</div>
              <div className="text-[10px] text-text-disabled">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Todo lo que necesitas para entrenar tu equipo
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Una plataforma unificada que conecta simulaciones, analytics y coaching IA
              para mejorar el rendimiento de tus asesores financieros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 border border-border card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/15 transition-colors">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ───────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 bg-surface-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Dashboard ejecutivo en tiempo real
            </h2>
            <p className="text-text-secondary text-sm">
              Visualizaciones limpias, jerárquicas y accionables.
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="glass rounded-2xl border border-border overflow-hidden shadow-2xl">
            {/* Fake topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-text-disabled">Gentera Intelligence · Executive Overview</div>
              <div className="w-4" />
            </div>

            {/* Fake KPI row */}
            <div className="p-5 grid grid-cols-4 gap-3">
              {[
                { label: "Simulaciones", val: "146", color: "text-brand-400" },
                { label: "Tasa aprobación", val: "38.4%", color: "text-rose-400" },
                { label: "Puntaje prom.", val: "26.8%", color: "text-amber-400" },
                { label: "Asesores", val: "74", color: "text-emerald-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-surface-800 rounded-xl p-3 border border-border">
                  <div className="text-[9px] text-text-disabled uppercase tracking-wider mb-1">{kpi.label}</div>
                  <div className={`text-lg font-bold ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* Fake chart area */}
            <div className="px-5 pb-5 grid grid-cols-3 gap-3">
              <div className="col-span-2 bg-surface-800 rounded-xl border border-border h-32 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-text-disabled" />
                <span className="text-xs text-text-disabled ml-2">Tendencia de puntaje</span>
              </div>
              <div className="bg-surface-800 rounded-xl border border-border h-32 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-text-disabled" />
                <span className="text-xs text-text-disabled ml-2">Insights IA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800 border border-border text-text-muted text-xs mb-8">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Confiado por equipos de Gentera
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Plataforma lista para producción
          </h2>
          <p className="text-text-secondary mb-8">
            Construida sobre datos reales de simulaciones de asesores financieros con más de 7 meses de historial analítico.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              "Datos encriptados en tránsito y reposo",
              "Acceso basado en roles (RBAC)",
              "Logs de auditoría completos",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 border border-border-accent">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Comienza a analizar hoy
            </h2>
            <p className="text-text-secondary mb-8">
              Accede al dashboard con datos reales de tu equipo y activa el copiloto IA.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all text-sm shadow-lg shadow-brand-900/30"
            >
              Acceder al dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-text-primary">Gentera Intelligence</span>
          </div>
          <p className="text-xs text-text-disabled">
            © 2026 Gentera. Plataforma de Inteligencia Conversacional. v2.0 Enterprise.
          </p>
        </div>
      </footer>
    </div>
  );
}

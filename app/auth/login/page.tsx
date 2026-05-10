"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, BarChart3, Brain, Shield } from "lucide-react";

const FEATURES = [
  { icon: BarChart3, label: "Analytics en tiempo real",   sub: "146 simulaciones analizadas" },
  { icon: Brain,     label: "Copiloto IA integrado",       sub: "Insights automáticos basados en datos" },
  { icon: Shield,    label: "Plataforma enterprise segura", sub: "Datos encriptados, acceso RBAC" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function fillDemo() {
    setEmail("demo@gentera.com");
    setPassword("demo1234");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true);
    setError("");
    // Simulate auth — redirect to dashboard
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-surface-900 border-r border-border p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold gradient-brand">Gentera</div>
            <div className="text-[9px] text-text-disabled uppercase tracking-[0.18em]">Intelligence Platform</div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-3 leading-snug">
            Inteligencia conversacional<br />para asesores financieros
          </h2>
          <p className="text-text-muted text-sm mb-10 leading-relaxed">
            Analiza el rendimiento de tu equipo con datos en tiempo real, insights IA y coaching personalizado.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{f.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-text-disabled">
          © 2026 Gentera · v2.0 Enterprise
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold gradient-brand">Gentera Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">Bienvenido de regreso</h1>
          <p className="text-text-muted text-sm mb-8">Inicia sesión para acceder al dashboard.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  className="w-full bg-surface-800 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-surface-800 border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md shadow-brand-900/30"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={fillDemo}
              className="w-full py-2.5 rounded-xl border border-border text-text-muted text-xs hover:text-text-primary hover:border-border-strong transition-all"
            >
              Demo: rellenar credenciales
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Crear cuenta
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

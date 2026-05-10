"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function fillDemo() {
    setName("Asesor Demo");
    setEmail("demo@gentera.com");
    setPassword("demo1234");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError("Completa todos los campos."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setLoading(true);
    setError("");
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
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Tu equipo merece la mejor plataforma de analytics
          </h2>
          <p className="text-text-muted text-sm mb-10 leading-relaxed">
            Únete a equipos de Gentera que usan inteligencia conversacional para mejorar el rendimiento de sus asesores.
          </p>

          <div className="space-y-3">
            {[
              "Acceso completo al dashboard ejecutivo",
              "Copiloto IA con insights automáticos",
              "Coaching personalizado por asesor",
              "Historial de 7+ meses de simulaciones",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-text-disabled">© 2026 Gentera · v2.0 Enterprise</div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold gradient-brand">Gentera Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">Crear cuenta</h1>
          <p className="text-text-muted text-sm mb-8">Accede a toda la plataforma de analytics.</p>

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
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="w-full bg-surface-800 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Correo electrónico</label>
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
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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
              {password.length > 0 && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all"
                      style={{
                        background: password.length >= i * 2
                          ? i <= 2 ? "#f59e0b" : "#10b981"
                          : "#252840",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md shadow-brand-900/30"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Crear cuenta <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={fillDemo}
              className="w-full py-2.5 rounded-xl border border-border text-text-muted text-xs hover:text-text-primary hover:border-border-strong transition-all"
            >
              Demo: rellenar campos
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Iniciar sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

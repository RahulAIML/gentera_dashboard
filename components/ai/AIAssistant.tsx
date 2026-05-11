"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalytics } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrendLocalized,
  computeActivityKPIs,
  computeInteractionKPIsLocalized,
  computeLeaderboard,
} from "@/lib/analytics/kpiEngine";

export function AIAssistant() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextIdRef = useRef(0);

  const { simulations, activities, members, scope, isLoading } = useAnalytics();

  const dashboardContext = useMemo(() => {
    const kpis = computeKPISummary(simulations, []);
    const monthly = computeMonthlyTrendLocalized(simulations, locale);
    const trend = monthly.slice(Math.max(0, monthly.length - 6)).map((p) => ({
      period: p.period,
      label: p.label,
      simulations: p.simulations,
      averageScore: Number(p.averageScore.toFixed(1)),
      passRate: Number((p.passRate * 100).toFixed(1)),
      uniqueUsers: p.uniqueUsers,
    }));

    const activityKPIs = computeActivityKPIs(simulations).slice(0, 8).map((a) => ({
      activityId: a.activityId,
      activityName: a.activityName,
      simulations: a.simulationCount,
      averageScore: Number(a.averageScore.toFixed(1)),
      passRate: Number((a.passRate * 100).toFixed(1)),
      uniqueUsers: a.uniqueUsers,
    }));

    const interactionKPIs = computeInteractionKPIsLocalized(simulations, locale)
      .filter((r) => r.roundIndex <= 5)
      .map((r) => ({
        round: r.roundIndex,
        passRate: Number((r.passRate * 100).toFixed(1)),
        totalApplicable: r.totalApplicable,
      }));

    const topUsers = computeLeaderboard(simulations).slice(0, 8).map((u) => ({
      rank: u.rank,
      userName: u.userName,
      simulations: u.simulations,
      avgScore: Number(u.avgScore.toFixed(1)),
      passRate: Number((u.passRate * 100).toFixed(1)),
    }));

    return {
      page: typeof window !== "undefined" ? window.location.pathname : "",
      locale,
      scope: scope ? { label: scope.label, description: scope.description } : null,
      totals: {
        simulations: kpis.totalSimulations,
        uniqueUsers: kpis.uniqueUsers,
        averageScore: Number(kpis.averageScore.toFixed(1)),
        passRate: Number((kpis.passRate * 100).toFixed(1)),
        activities: kpis.totalActivities,
        activeDays: kpis.activeDays,
        members: members.length,
        activitiesCatalog: activities.length,
      },
      trend,
      interactions: interactionKPIs,
      topActivities: activityKPIs,
      leaderboard: topUsers,
    };
  }, [simulations, activities, members, scope, locale]);

  const quickPrompts = useMemo(() => {
    if (locale === "en") {
      return [
        "Summarize the key KPIs for the current scope and date range.",
        "What trend stands out in the last periods, and why?",
        "Which interaction round is the biggest risk, and what should we coach?",
        "Which activities are driving most volume, and how are they performing?",
      ];
    }
    return [
      "Resume los KPIs clave del periodo y alcance actual.",
      "¿Qué tendencia destaca en los últimos periodos y por qué?",
      "¿Qué interacción representa mayor riesgo y qué debemos reforzar?",
      "¿Qué actividades concentran más volumen y cómo están rindiendo?",
    ];
  }, [locale]);

  const nextId = () => {
    nextIdRef.current += 1;
    return String(nextIdRef.current);
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, streaming]);

  async function sendMessage(text: string) {
    const msg = text.trim();
    if (!msg || streaming) return;

    setError(null);
    setDraft("");

    const userMessage = { id: nextId(), role: "user" as const, text: msg };
    const assistantMessage = { id: nextId(), role: "assistant" as const, text: "" };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setStreaming(true);

    // Cancel any in-flight request.
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const history = [...messages, userMessage].slice(-12).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          messages: history,
          locale,
          context: dashboardContext,
          stream: true,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = (data?.error as string) || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const lines = frame.split(/\r?\n/);
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          const event = eventLine ? eventLine.slice("event:".length).trim() : "message";
          const raw = dataLine.slice("data:".length).trim();
          let payload: unknown = null;
          try {
            payload = JSON.parse(raw);
          } catch {
            payload = null;
          }

          if (event === "delta" && typeof (payload as { text?: unknown } | null)?.text === "string") {
            const delta = (payload as { text: string }).text;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (!last || last.role !== "assistant") return prev;
              next[next.length - 1] = { ...last, text: last.text + delta };
              return next;
            });
          }

          if (event === "error") {
            const errMsg =
              typeof (payload as { error?: unknown } | null)?.error === "string"
                ? (payload as { error: string }).error
                : "AI stream error";
            throw new Error(errMsg);
          }

          if (event === "done") {
            setStreaming(false);
          }
        }
      }
    } catch (err) {
      if (ac.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "AI request failed";
      setError(msg);
      setStreaming(false);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.text) {
          next[next.length - 1] = { ...last, text: `Error: ${msg}` };
        }
        return next;
      });
    }
  }

  return (
    <>
      {/* Toggle Button - Fixed bottom right */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 h-12 px-4 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center shadow-xl shadow-black/50 text-white transition-all gap-2 border border-brand-600/30"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[12px] font-semibold hidden sm:block">AI</span>
      </motion.button>

      {/* Right Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-[420px] max-w-full h-screen z-50 flex flex-col bg-surface-800 border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-700/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-text-primary truncate">{t.ai.copilot}</div>
                  <div className="text-[11px] text-text-muted truncate">
                    {scope ? scope.label : t.scope.organization}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-xl bg-surface-800 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors" aria-label={t.ai.close}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-750/30">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-text-muted leading-relaxed">
                    {locale === "en"
                      ? "Ask about KPIs, trends, interaction risks, and coaching opportunities. Answers are grounded in the current dashboard scope and filters."
                      : "Pregunta sobre KPIs, tendencias, riesgos por interacción y oportunidades de coaching. Las respuestas se basan en el alcance y filtros actuales."}
                  </p>
                  <div className="space-y-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left text-[12px] p-3 rounded-xl bg-surface-700/60 hover:bg-surface-700 border border-border/70 text-text-primary transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[320px] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed border ${
                        msg.role === "user"
                          ? "bg-brand-500/20 text-text-primary border-brand-500/40"
                          : "bg-surface-700/80 text-text-secondary border-border/80"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {streaming && (
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 live-dot text-brand-400" />
                  {t.ai.generating}
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 text-[12px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border px-5 py-4 space-y-2 bg-surface-800/90">
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(draft);
                    }
                  }}
                  placeholder={locale === "en" ? "Ask about KPIs, trends, coaching…" : "Pregunta sobre KPIs, tendencias, coaching…"}
                  className="flex-1 h-10 px-3 rounded-xl bg-surface-700 border border-border/80 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/60"
                  disabled={streaming}
                />
                <button
                  onClick={() => void sendMessage(draft)}
                  disabled={streaming || !draft.trim()}
                  className="h-10 w-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 transition-colors flex items-center justify-center"
                  aria-label={t.table.viewDetails}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-text-disabled">
                {isLoading ? t.common.loading : `${t.common.active}: ${dashboardContext?.scope?.label ?? "—"}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

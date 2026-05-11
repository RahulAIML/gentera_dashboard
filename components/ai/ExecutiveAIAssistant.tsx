"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  Brain,
  ChevronDown,
  Plus,
  History
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalytics } from "@/hooks/useAnalyticsData";
import {
  computeKPISummary,
  computeMonthlyTrendLocalized,
  computeActivityKPIs,
  computeInteractionKPIsLocalized,
  computeLeaderboard,
} from "@/lib/analytics/kpiEngine";

export function ExecutiveAIAssistant() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string; timestamp: Date }>>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
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

  const contextualSuggestions = useMemo(() => {
    if (locale === "en") {
      return [
        {
          icon: TrendingUp,
          text: "What are the key performance trends this month?",
          category: "trends"
        },
        {
          icon: Users,
          text: "Who are the top performing advisors?",
          category: "performance"
        },
        {
          icon: Target,
          text: "Which interactions need the most coaching?",
          category: "coaching"
        },
        {
          icon: Brain,
          text: "Generate a comprehensive performance summary",
          category: "summary"
        },
      ];
    }
    return [
      {
        icon: TrendingUp,
        text: "¿Cuáles son las tendencias clave de rendimiento este mes?",
        category: "trends"
      },
      {
        icon: Users,
        text: "¿Quiénes son los asesores con mejor desempeño?",
        category: "performance"
      },
      {
        icon: Target,
        text: "¿Qué interacciones necesitan más coaching?",
        category: "coaching"
      },
      {
        icon: Brain,
        text: "Generar un resumen completo del desempeño",
        category: "summary"
      },
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
    setShowSuggestions(false);

    const userMessage = { 
      id: nextId(), 
      role: "user" as const, 
      text: msg,
      timestamp: new Date()
    };
    const assistantMessage = { 
      id: nextId(), 
      role: "assistant" as const, 
      text: "",
      timestamp: new Date()
    };

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
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open ? "0 0 20px rgba(59, 130, 246, 0.4)" : "0 0 0px rgba(59, 130, 246, 0)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className="fixed bottom-8 right-8 z-40 h-14 px-5 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-brand-500/30 text-white transition-all duration-300 hover:shadow-brand-500/40 border border-brand-400/20 gpu-accelerated"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-semibold">AI Assistant</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-[480px] max-w-full h-screen z-50 flex flex-col bg-surface-900 border-l border-surface-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-800 bg-surface-850/80">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-600/20 border border-brand-500/30 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-brand-400" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-surface-50 truncate">
                    {t.ai.copilot}
                  </div>
                  <div className="text-xs text-surface-400 truncate">
                    {scope ? scope.label : t.scope.organization}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="h-8 w-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setOpen(false)} 
                  className="h-8 w-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-50 mb-3">
                    {locale === "en" ? "Ask me anything about your data" : "Pregúntame anything sobre tus datos"}
                  </h3>
                  <p className="text-sm text-surface-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    {locale === "en" 
                      ? "I can help you analyze performance trends, identify coaching opportunities, and provide insights about your team's conversational intelligence."
                      : "Puedo ayudarte a analizar tendencias de rendimiento, identificar oportunidades de coaching y proporcionar insights sobre la inteligencia conversacional de tu equipo."
                    }
                  </p>
                  
                  {showSuggestions && (
                    <div className="space-y-3">
                      <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-3">
                        {locale === "en" ? "Suggested Questions" : "Preguntas Sugeridas"}
                      </p>
                      {contextualSuggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => sendMessage(suggestion.text)}
                            className="w-full text-left p-4 rounded-xl bg-surface-800/60 border border-surface-700/50 hover:bg-surface-700/80 hover:border-surface-600/50 transition-all duration-200 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-surface-700/50 border border-surface-600/50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-brand-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-surface-200 leading-relaxed">
                                  {suggestion.text}
                                </p>
                                <div className="text-xs text-surface-500 mt-1 capitalize">
                                  {suggestion.category}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[380px] px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
                          msg.role === "user"
                            ? "bg-brand-500/15 text-surface-200 border-brand-500/30"
                            : "bg-surface-800/60 text-surface-300 border-surface-700/50"
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === "user" 
                              ? "bg-brand-500 text-white" 
                              : "bg-surface-700 text-surface-300"
                          }`}>
                            {msg.role === "user" ? (
                              <span className="text-xs font-bold">U</span>
                            ) : (
                              <Brain className="w-3 h-3" />
                            )}
                          </div>
                          <div className="text-xs text-surface-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {streaming && (
                    <div className="flex justify-start">
                      <div className="max-w-[380px] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-surface-800/60 text-surface-300 border-surface-700/50 border border-surface-600/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center">
                            <Brain className="w-3 h-3 text-surface-300" />
                          </div>
                          <div className="text-xs text-surface-500">
                            {locale === "en" ? "Thinking..." : "Pensando..."}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                          <span className="text-xs text-surface-500">
                            {locale === "en" ? "Generating response..." : "Generando respuesta..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-start">
                      <div className="max-w-[380px] p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                          <div className="leading-relaxed">
                            <div className="text-sm font-medium text-rose-300 mb-1">
                              {locale === "en" ? "Error" : "Error"}
                            </div>
                            <div className="text-xs text-rose-400">
                              {error}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-surface-800 px-6 py-4 bg-surface-900">
              <div className="flex gap-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(draft);
                    }
                  }}
                  placeholder={locale === "en" ? "Ask about performance, trends, coaching..." : "Pregunta sobre rendimiento, tendencias, coaching..."}
                  className="flex-1 h-12 px-4 rounded-xl bg-surface-800 border border-surface-700 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 focus:bg-surface-750/50 transition-all duration-200"
                  disabled={streaming}
                />
                <button
                  onClick={() => void sendMessage(draft)}
                  disabled={streaming || !draft.trim()}
                  className="h-12 w-12 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-surface-600">
                  {isLoading ? t.common.loading : `${t.common.active}: ${dashboardContext?.scope?.label ?? "—"}`}
                </div>
                <button className="text-xs text-surface-500 hover:text-surface-400 transition-colors flex items-center gap-1">
                  <History className="w-3 h-3" />
                  {locale === "en" ? "Clear History" : "Limpiar Historial"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

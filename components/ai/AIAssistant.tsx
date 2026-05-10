"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AIAssistant() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "¿Cuáles son los KPIs clave?",
    "¿Quién necesita coaching?",
    "¿Cuáles interacciones fallan más?",
    "¿Cómo ha sido la tendencia?",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const pageContext = getPageContext(pathname);

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: pageContext,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: `Error: ${error.error || "Failed to get response"}`,
          },
        ]);
        return;
      }

      const data = await response.json();
      setMessages((m) => [...m, { role: "ai", text: data.response }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Connection error";
      setMessages((m) => [
        ...m,
        { role: "ai", text: `Error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function getPageContext(pathname: string) {
    const context: any = {
      page: pathname.replace("/dashboard", "").replace(/\/$/, "") || "overview",
    };
    context.organization = "Gentera Organization";
    return context;
  }

  return (
    <>
      {/* Toggle Button - Fixed bottom right */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg text-white transition-colors"
      >
        {open ? <ChevronLeft className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Right Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-96 h-screen z-50 flex flex-col bg-surface-900 border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-800/50">
              <h2 className="font-semibold text-text-primary text-sm">Asistente IA</h2>
              <span className="text-xs text-text-muted">Últimos 30 días</span>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-700 rounded-lg transition">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">¡Hola! Puedo ayudarte a analizar los datos de tu panel. Pregúntame sobre evaluaciones, puntuaciones, tasas de aprobación o tendencias.</p>
                  <div className="space-y-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => {
                            setMessages([{ role: "user", text: prompt }]);
                            setTimeout(() => handleSend(), 100);
                          }, 0);
                        }}
                        className="w-full text-left text-xs p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-border/50 text-text-primary transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-xs leading-relaxed ${
                        msg.role === "user" ? "bg-red-500/20 text-text-primary border border-red-500/30" : "bg-surface-800 text-text-muted"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {loading && <div className="text-xs text-text-muted italic">Generando respuesta...</div>}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 space-y-2">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pregunta sobre KPIs, tasas de aprobación..."
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-border text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-red-500/50"
                />
                <button onClick={handleSend} disabled={loading} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-text-disabled">Powered by Gemini AI · Context-aware insights</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

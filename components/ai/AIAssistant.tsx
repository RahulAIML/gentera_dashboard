"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AIAssistant() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Summarize this dashboard",
    "Which teams underperform?",
    "What interactions fail most?",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Get page context from pathname
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

  /**
   * Extract context from current page pathname
   */
  function getPageContext(pathname: string) {
    const context: any = {
      page: pathname.replace("/dashboard", "").replace(/\/$/, "") || "overview",
    };

    // Could enhance with filter state if using Zustand/Redux
    // For now, just page name and general organization scope
    context.organization = "Gentera Organization";

    return context;
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg border border-brand-400/30 ${
          open ? "hidden" : ""
        }`}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-black/20 z-40" />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-[400px] h-full z-50 flex flex-col bg-surface-900 border-l border-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-400" />
                  <h2 className="font-semibold text-text-primary">{t.ai.copilot}</h2>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-800 rounded-lg transition">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-muted">Ask me about your dashboard data.</p>
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => {
                            setMessages([{ role: "user", text: prompt }]);
                          }, 0);
                        }}
                        className="w-full text-left text-xs p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-border/50 text-text-primary transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-xs ${
                          msg.role === "user" ? "bg-brand-500/20 text-text-primary border border-brand-500/30" : "bg-surface-800 text-text-muted"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {loading && <div className="text-xs text-text-muted italic">{t.ai.generating}</div>}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about your data..."
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-border text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500/50"
                  />
                  <button onClick={handleSend} disabled={loading} className="p-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-text-disabled">Powered by AI · Context-aware insights</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

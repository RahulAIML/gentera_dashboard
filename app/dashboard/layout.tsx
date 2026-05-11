"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PanelLeft, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { useI18n } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { locale } = useI18n();

  return (
    <div className="h-screen bg-surface-950">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[256px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main column */}
        <div className="min-w-0 flex flex-col h-full">
          {/* Mobile header (nav toggle only). Page headers live inside pages. */}
          <div className="lg:hidden h-12 border-b border-border bg-surface-900/92 backdrop-blur-xl flex items-center px-3">
            <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="h-9 w-9 rounded-xl border border-border bg-surface-800/70 text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors flex items-center justify-center"
                  aria-label="Open navigation"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-40" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[320px] max-w-[85vw] bg-surface-900 border-r border-border shadow-2xl">
                  <div className="h-12 px-3 border-b border-border flex items-center justify-between">
                    <div className="text-[12px] font-semibold text-text-primary">Gentera</div>
                    <Dialog.Close asChild>
                      <button
                        className="h-9 w-9 rounded-xl border border-border bg-surface-800/70 text-text-muted hover:text-text-primary hover:bg-surface-800 transition-colors flex items-center justify-center"
                        aria-label="Close navigation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Sidebar onNavigate={() => setMobileNavOpen(false)} />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <main className="flex-1 overflow-y-auto min-w-0" style={{ scrollbarGutter: 'stable' }}>
            {children}
          </main>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant key={locale} />
    </div>
  );
}

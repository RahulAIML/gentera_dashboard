"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { FilterBar } from "@/components/layout/FilterBar";
import { AIAssistant } from "@/components/ai/AIAssistant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 ml-56">
        <FilterBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant />
    </div>
  );
}

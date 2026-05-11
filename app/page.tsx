"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace("/dashboard");
  }, [router]);

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4">
          <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
        </div>
        <p className="text-sm text-text-muted">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}

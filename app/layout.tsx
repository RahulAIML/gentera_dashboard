import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gentera Intelligence Platform",
  description: "Plataforma de Inteligencia Conversacional para Simulaciones de Roleplay",
  icons: { icon: "/favicon.ico" },
  // Prevent Chrome / Google Translate from rewriting the DOM before
  // React hydrates — the user toggles language inside the app instead.
  other: {
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      translate="no"
      className={`${inter.variable} h-full notranslate`}
      suppressHydrationWarning
    >
      <body className="h-full bg-surface-900 text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

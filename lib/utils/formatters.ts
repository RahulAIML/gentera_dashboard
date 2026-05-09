import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export function fmtScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function fmtPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

export function fmtDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy", { locale: es });
}

export function fmtDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy HH:mm", { locale: es });
}

export function fmtTimeAgo(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function fmtMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return format(d, "MMM yy", { locale: es });
}

export function fmtDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function scoreToBand(score: number): "critical" | "low" | "medium" | "high" | "excellent" {
  if (score < 40) return "critical";
  if (score < 60) return "low";
  if (score < 75) return "medium";
  if (score < 90) return "high";
  return "excellent";
}

export function scoreBandColor(band: ReturnType<typeof scoreToBand>): string {
  const map: Record<string, string> = {
    critical: "#EF4444",
    low: "#F97316",
    medium: "#F59E0B",
    high: "#10B981",
    excellent: "#3B82F6",
  };
  return map[band];
}

export function scoreLabel(score: number): string {
  const band = scoreToBand(score);
  const labels: Record<string, string> = {
    critical: "Crítico",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    excellent: "Excelente",
  };
  return labels[band];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugToLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

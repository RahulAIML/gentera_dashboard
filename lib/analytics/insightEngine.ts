import type { NormalizedSimulation, AIInsight, InteractionKPI, ActivityKPI, UserKPI } from "@/types/analytics";

let insightCounter = 0;
function id() { return `insight-${++insightCounter}`; }

export function generateInsights(
  sims: NormalizedSimulation[],
  interactionKPIs: InteractionKPI[],
  activityKPIs: ActivityKPI[],
  userKPIs: UserKPI[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  if (!sims.length) return insights;

  // ---- Lowest-performing interaction ----------------------------------------
  const applicableInteractions = interactionKPIs.filter((i) => i.totalApplicable > 5);
  if (applicableInteractions.length) {
    const worst = applicableInteractions.reduce((a, b) => a.passRate < b.passRate ? a : b);
    if (worst.passRate < 0.6) {
      insights.push({
        id: id(),
        type: "risk",
        severity: worst.passRate < 0.4 ? "critical" : "warning",
        title: `${worst.label} con la tasa de aprobación más baja`,
        description: `Solo el ${(worst.passRate * 100).toFixed(0)}% de los asesores superan esta interacción. Representa la mayor oportunidad de mejora en el flujo conversacional.`,
        metric: `${(worst.passRate * 100).toFixed(0)}% aprobación`,
        relatedEntity: worst.label,
      });
    }
  }

  // ---- Best-performing interaction -------------------------------------------
  if (applicableInteractions.length) {
    const best = applicableInteractions.reduce((a, b) => a.passRate > b.passRate ? a : b);
    if (best.passRate > 0.8) {
      insights.push({
        id: id(),
        type: "achievement",
        severity: "success",
        title: `${best.label} destaca con alto rendimiento`,
        description: `El ${(best.passRate * 100).toFixed(0)}% de los asesores domina esta interacción. Puede usarse como referencia de entrenamiento para otras etapas.`,
        metric: `${(best.passRate * 100).toFixed(0)}% aprobación`,
        relatedEntity: best.label,
      });
    }
  }

  // ---- Overall pass rate alert -----------------------------------------------
  const overallPassRate = sims.filter((s) => s.passed).length / sims.length;
  if (overallPassRate < 0.5) {
    insights.push({
      id: id(),
      type: "anomaly",
      severity: "critical",
      title: "Tasa de aprobación global por debajo del umbral",
      description: `Solo el ${(overallPassRate * 100).toFixed(0)}% de las simulaciones concluyen con diagnóstico aprobatorio. Se recomienda revisión urgente del proceso de entrenamiento.`,
      metric: `${(overallPassRate * 100).toFixed(0)}% aprobados`,
    });
  } else if (overallPassRate > 0.75) {
    insights.push({
      id: id(),
      type: "achievement",
      severity: "success",
      title: "Tasa de aprobación global en niveles óptimos",
      description: `El ${(overallPassRate * 100).toFixed(0)}% de las simulaciones obtienen diagnóstico aprobatorio, indicando un entrenamiento efectivo.`,
      metric: `${(overallPassRate * 100).toFixed(0)}% aprobados`,
    });
  }

  // ---- Activity engagement drop ----------------------------------------------
  if (activityKPIs.length >= 2) {
    const sorted = [...activityKPIs].sort((a, b) => b.simulationCount - a.simulationCount);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    if (top.simulationCount > bottom.simulationCount * 5) {
      insights.push({
        id: id(),
        type: "trend",
        severity: "warning",
        title: `Concentración alta en "${top.activityName}"`,
        description: `"${top.activityName}" concentra el ${((top.simulationCount / sims.length) * 100).toFixed(0)}% de todas las simulaciones. Actividades como "${bottom.activityName}" tienen muy poca adopción.`,
        relatedEntity: bottom.activityName,
      });
    }
  }

  // ---- Top user excellence ---------------------------------------------------
  if (userKPIs.length) {
    const topUser = userKPIs[0];
    if (topUser.averageScore >= 80) {
      insights.push({
        id: id(),
        type: "achievement",
        severity: "success",
        title: `${topUser.userName} lidera el ranking de desempeño`,
        description: `Con un promedio de ${topUser.averageScore.toFixed(0)}% y ${topUser.simulationCount} simulaciones completadas, es el asesor con mayor rendimiento del período.`,
        metric: `${topUser.averageScore.toFixed(0)}% promedio`,
        relatedEntity: topUser.userName,
      });
    }
  }

  // ---- Low engagement users --------------------------------------------------
  const singleSimUsers = userKPIs.filter((u) => u.simulationCount === 1);
  if (singleSimUsers.length > userKPIs.length * 0.4) {
    insights.push({
      id: id(),
      type: "risk",
      severity: "warning",
      title: "Alto porcentaje de usuarios con baja participación",
      description: `El ${((singleSimUsers.length / userKPIs.length) * 100).toFixed(0)}% de los usuarios activos completaron solo 1 simulación. Implementar estrategias de re-enganche.`,
      metric: `${singleSimUsers.length} usuarios`,
    });
  }

  // ---- Score trend detection -------------------------------------------------
  const byMonth = new Map<string, number[]>();
  for (const s of sims) {
    if (!byMonth.has(s.monthKey)) byMonth.set(s.monthKey, []);
    byMonth.get(s.monthKey)!.push(s.score);
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    const lastAvg = last[1].reduce((a, b) => a + b, 0) / last[1].length;
    const prevAvg = prev[1].reduce((a, b) => a + b, 0) / prev[1].length;
    const delta = lastAvg - prevAvg;
    if (Math.abs(delta) > 5) {
      insights.push({
        id: id(),
        type: "trend",
        severity: delta > 0 ? "success" : "warning",
        title: delta > 0 ? "Puntaje promedio en tendencia positiva" : "Puntaje promedio en declive",
        description: delta > 0
          ? `El puntaje promedio aumentó ${delta.toFixed(1)} puntos respecto al mes anterior.`
          : `El puntaje promedio cayó ${Math.abs(delta).toFixed(1)} puntos respecto al mes anterior. Evaluar factores de desempeño.`,
        metric: `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts`,
        delta,
      });
    }
  }

  return insights.slice(0, 8);
}

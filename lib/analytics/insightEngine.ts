import type {
  NormalizedSimulation,
  AIInsight,
  InteractionKPI,
  ActivityKPI,
  UserKPI,
} from "@/types/analytics";

type Locale = "es" | "en";

let insightCounter = 0;
function id() {
  insightCounter += 1;
  return `insight-${insightCounter}`;
}

function pct0(n: number) {
  return (n * 100).toFixed(0);
}

export function generateInsights(
  sims: NormalizedSimulation[],
  interactionKPIs: InteractionKPI[],
  activityKPIs: ActivityKPI[],
  userKPIs: UserKPI[],
  locale: Locale,
): AIInsight[] {
  const insights: AIInsight[] = [];
  if (!sims.length) return insights;

  const copy =
    locale === "en"
      ? {
          lowestPassTitle: (label: string) => `${label} has the lowest pass rate`,
          lowestPassDesc: (pct: string) =>
            `Only ${pct}% of advisors pass this interaction. This is the biggest coaching leverage point in the conversational flow.`,
          passRateMetric: (pct: string) => `${pct}% pass rate`,

          bestPassTitle: (label: string) => `${label} stands out with strong performance`,
          bestPassDesc: (pct: string) =>
            `${pct}% of advisors pass this interaction. Use it as a reference pattern for earlier rounds.`,

          overallLowTitle: "Overall pass rate is below threshold",
          overallLowDesc: (pct: string) =>
            `Only ${pct}% of simulations end with a passing diagnosis. Prioritize reinforcement of the weakest interaction(s).`,
          overallHighTitle: "Overall pass rate is strong",
          overallHighDesc: (pct: string) =>
            `${pct}% of simulations end with a passing diagnosis, indicating effective training for the current scope.`,
          overallMetric: (pct: string) => `${pct}% passed`,

          concentrationTitle: (name: string) => `High concentration in “${name}”`,
          concentrationDesc: (topName: string, topPct: string, bottomName: string) =>
            `“${topName}” represents ${topPct}% of simulations. Activities like “${bottomName}” show very low adoption.`,

          topUserTitle: (user: string) => `${user} leads the performance ranking`,
          topUserDesc: (avg: string, simsCount: number) =>
            `With an average score of ${avg}% across ${simsCount} simulations, this advisor is the top performer in the current period.`,
          avgMetric: (avg: string) => `${avg}% avg`,

          lowEngagementTitle: "High share of users with low engagement",
          lowEngagementDesc: (pct: string) =>
            `${pct}% of active users completed only 1 simulation. Consider a re-engagement routine and manager nudges.`,
          usersMetric: (n: number) => `${n} users`,

          scoreUpTitle: "Average score is trending up",
          scoreDownTitle: "Average score is trending down",
          scoreUpDesc: (deltaAbs: string) => `Average score increased by ${deltaAbs} points vs last month.`,
          scoreDownDesc: (deltaAbs: string) =>
            `Average score decreased by ${deltaAbs} points vs last month. Review activity mix, coaching coverage, and diagnosis outcomes.`,
          pointsMetric: (deltaAbs: string) => `${deltaAbs} pts`,
        }
      : {
          lowestPassTitle: (label: string) => `${label} con la tasa de aprobación más baja`,
          lowestPassDesc: (pct: string) =>
            `Solo el ${pct}% de los asesores superan esta interacción. Representa la mayor oportunidad de mejora en el flujo conversacional.`,
          passRateMetric: (pct: string) => `${pct}% aprobación`,

          bestPassTitle: (label: string) => `${label} destaca con alto rendimiento`,
          bestPassDesc: (pct: string) =>
            `El ${pct}% de los asesores domina esta interacción. Puede usarse como referencia de entrenamiento para otras etapas.`,

          overallLowTitle: "Tasa de aprobación global por debajo del umbral",
          overallLowDesc: (pct: string) =>
            `Solo el ${pct}% de las simulaciones concluyen con diagnóstico aprobatorio. Se recomienda revisión y refuerzo enfocado en las interacciones más débiles.`,
          overallHighTitle: "Tasa de aprobación global en niveles óptimos",
          overallHighDesc: (pct: string) =>
            `El ${pct}% de las simulaciones obtienen diagnóstico aprobatorio, indicando un entrenamiento efectivo para el alcance actual.`,
          overallMetric: (pct: string) => `${pct}% aprobados`,

          concentrationTitle: (name: string) => `Concentración alta en “${name}”`,
          concentrationDesc: (topName: string, topPct: string, bottomName: string) =>
            `“${topName}” concentra el ${topPct}% de todas las simulaciones. Actividades como “${bottomName}” tienen muy poca adopción.`,

          topUserTitle: (user: string) => `${user} lidera el ranking de desempeño`,
          topUserDesc: (avg: string, simsCount: number) =>
            `Con un promedio de ${avg}% y ${simsCount} simulaciones completadas, es el asesor con mayor rendimiento del período.`,
          avgMetric: (avg: string) => `${avg}% promedio`,

          lowEngagementTitle: "Alto porcentaje de usuarios con baja participación",
          lowEngagementDesc: (pct: string) =>
            `El ${pct}% de los usuarios activos completaron solo 1 simulación. Implementar estrategias de re-enganche.`,
          usersMetric: (n: number) => `${n} usuarios`,

          scoreUpTitle: "Puntaje promedio en tendencia positiva",
          scoreDownTitle: "Puntaje promedio en declive",
          scoreUpDesc: (deltaAbs: string) =>
            `El puntaje promedio aumentó ${deltaAbs} puntos respecto al mes anterior.`,
          scoreDownDesc: (deltaAbs: string) =>
            `El puntaje promedio cayó ${deltaAbs} puntos respecto al mes anterior. Revisar mezcla de actividades, cobertura de coaching y diagnósticos.`,
          pointsMetric: (deltaAbs: string) => `${deltaAbs} pts`,
        };

  // ---- Lowest-performing interaction ----------------------------------------
  const applicableInteractions = interactionKPIs.filter((i) => i.totalApplicable > 5);
  if (applicableInteractions.length) {
    const worst = applicableInteractions.reduce((a, b) => (a.passRate < b.passRate ? a : b));
    if (worst.passRate < 0.6) {
      const pct = pct0(worst.passRate);
      insights.push({
        id: id(),
        type: "risk",
        severity: worst.passRate < 0.4 ? "critical" : "warning",
        title: copy.lowestPassTitle(worst.label),
        description: copy.lowestPassDesc(pct),
        metric: copy.passRateMetric(pct),
        relatedEntity: worst.label,
      });
    }
  }

  // ---- Best-performing interaction ------------------------------------------
  if (applicableInteractions.length) {
    const best = applicableInteractions.reduce((a, b) => (a.passRate > b.passRate ? a : b));
    if (best.passRate > 0.8) {
      const pct = pct0(best.passRate);
      insights.push({
        id: id(),
        type: "achievement",
        severity: "success",
        title: copy.bestPassTitle(best.label),
        description: copy.bestPassDesc(pct),
        metric: copy.passRateMetric(pct),
        relatedEntity: best.label,
      });
    }
  }

  // ---- Overall pass-rate alert ----------------------------------------------
  const overallPassRate = sims.filter((s) => s.passed).length / sims.length;
  if (overallPassRate < 0.5) {
    const pct = pct0(overallPassRate);
    insights.push({
      id: id(),
      type: "anomaly",
      severity: "critical",
      title: copy.overallLowTitle,
      description: copy.overallLowDesc(pct),
      metric: copy.overallMetric(pct),
    });
  } else if (overallPassRate > 0.75) {
    const pct = pct0(overallPassRate);
    insights.push({
      id: id(),
      type: "achievement",
      severity: "success",
      title: copy.overallHighTitle,
      description: copy.overallHighDesc(pct),
      metric: copy.overallMetric(pct),
    });
  }

  // ---- Activity concentration ------------------------------------------------
  if (activityKPIs.length >= 2) {
    const sorted = [...activityKPIs].sort((a, b) => b.simulationCount - a.simulationCount);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    if (top.simulationCount > bottom.simulationCount * 5) {
      const pct = ((top.simulationCount / sims.length) * 100).toFixed(0);
      insights.push({
        id: id(),
        type: "trend",
        severity: "warning",
        title: copy.concentrationTitle(top.activityName),
        description: copy.concentrationDesc(top.activityName, pct, bottom.activityName),
        relatedEntity: bottom.activityName,
      });
    }
  }

  // ---- Top user excellence ---------------------------------------------------
  if (userKPIs.length) {
    const topUser = userKPIs[0];
    if (topUser.averageScore >= 80) {
      const avg = topUser.averageScore.toFixed(0);
      insights.push({
        id: id(),
        type: "achievement",
        severity: "success",
        title: copy.topUserTitle(topUser.userName),
        description: copy.topUserDesc(avg, topUser.simulationCount),
        metric: copy.avgMetric(avg),
        relatedEntity: topUser.userName,
      });
    }
  }

  // ---- Low engagement users --------------------------------------------------
  const singleSimUsers = userKPIs.filter((u) => u.simulationCount === 1);
  if (singleSimUsers.length > userKPIs.length * 0.4) {
    const pct = ((singleSimUsers.length / userKPIs.length) * 100).toFixed(0);
    insights.push({
      id: id(),
      type: "risk",
      severity: "warning",
      title: copy.lowEngagementTitle,
      description: copy.lowEngagementDesc(pct),
      metric: copy.usersMetric(singleSimUsers.length),
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
      const deltaAbs = Math.abs(delta).toFixed(1);
      insights.push({
        id: id(),
        type: "trend",
        severity: delta > 0 ? "success" : "warning",
        title: delta > 0 ? copy.scoreUpTitle : copy.scoreDownTitle,
        description: delta > 0 ? copy.scoreUpDesc(deltaAbs) : copy.scoreDownDesc(deltaAbs),
        metric: `${delta > 0 ? "+" : "-"}${copy.pointsMetric(deltaAbs)}`,
        delta,
      });
    }
  }

  return insights.slice(0, 8);
}


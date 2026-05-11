import type {
  NormalizedSimulation,
  FilterState,
  KPISummary,
  ActivityKPI,
  UserKPI,
  InteractionKPI,
  TrendDataPoint,
  ScoreDistributionBucket,
  LeaderboardEntry,
  HeatmapCell,
} from "@/types/analytics";

type Locale = "es" | "en";

// ---- Filter application ------------------------------------------------------

export function applyFilters(
  sims: NormalizedSimulation[],
  filters: FilterState
): NormalizedSimulation[] {
  return sims.filter((s) => {
    if (filters.dateRange.start && s.timestamp < filters.dateRange.start) return false;
    if (filters.dateRange.end && s.timestamp > filters.dateRange.end) return false;
    if (filters.activityIds.length > 0 && !filters.activityIds.includes(s.activityId)) return false;
    if (filters.userName && !s.userName.toLowerCase().includes(filters.userName.toLowerCase())) return false;
    if (filters.minScore !== null && s.score < filters.minScore) return false;
    if (filters.maxScore !== null && s.score > filters.maxScore) return false;
    if (filters.diagnosisFilter === "passed" && !s.passed) return false;
    if (filters.diagnosisFilter === "failed" && s.passed) return false;
    return true;
  });
}

// ---- KPI Summary -------------------------------------------------------------

export function computeKPISummary(
  current: NormalizedSimulation[],
  previous: NormalizedSimulation[]
): KPISummary {
  const uniqueUsers = new Set(current.map((s) => s.userName)).size;
  const avgScore = current.length ? avg(current.map((s) => s.score)) : 0;
  const passRate = current.length ? current.filter((s) => s.passed).length / current.length : 0;
  const activeDays = new Set(current.map((s) => s.dateKey)).size;

  const prevAvgScore = previous.length ? avg(previous.map((s) => s.score)) : avgScore;
  const prevPassRate = previous.length
    ? previous.filter((s) => s.passed).length / previous.length
    : passRate;

  const activities = new Set(current.map((s) => s.activityId)).size;

  return {
    totalSimulations: current.length,
    uniqueUsers,
    averageScore: avgScore,
    passRate,
    totalActivities: activities,
    activeDays,
    trend: {
      simulationsDelta: previous.length
        ? pctDelta(current.length, previous.length)
        : 0,
      scoreDelta: pctDelta(avgScore, prevAvgScore),
      passRateDelta: pctDelta(passRate, prevPassRate),
    },
  };
}

// ---- Activity KPIs -----------------------------------------------------------

export function computeActivityKPIs(
  sims: NormalizedSimulation[]
): ActivityKPI[] {
  const map = new Map<number, { name: string; slug: string; sims: NormalizedSimulation[] }>();
  for (const s of sims) {
    if (!map.has(s.activityId)) {
      map.set(s.activityId, { name: s.activityName, slug: s.activitySlug, sims: [] });
    }
    map.get(s.activityId)!.sims.push(s);
  }

  return Array.from(map.entries())
    .map(([id, { name, slug, sims: asSims }]) => ({
      activityId: id,
      activityName: name,
      activitySlug: slug,
      simulationCount: asSims.length,
      uniqueUsers: new Set(asSims.map((s) => s.userName)).size,
      averageScore: avg(asSims.map((s) => s.score)),
      passRate: asSims.filter((s) => s.passed).length / asSims.length,
    }))
    .sort((a, b) => b.simulationCount - a.simulationCount);
}

// ---- User KPIs ---------------------------------------------------------------

export function computeUserKPIs(sims: NormalizedSimulation[]): UserKPI[] {
  const map = new Map<string, NormalizedSimulation[]>();
  for (const s of sims) {
    const key = s.userName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  return Array.from(map.entries())
    .map(([userName, userSims]) => ({
      userName,
      userId: userSims[0].userId,
      simulationCount: userSims.length,
      averageScore: avg(userSims.map((s) => s.score)),
      bestScore: Math.max(...userSims.map((s) => s.score)),
      passRate: userSims.filter((s) => s.passed).length / userSims.length,
      latestSimulation: userSims.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )[0].timestamp,
      activityIds: [...new Set(userSims.map((s) => s.activityId))],
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

// ---- Interaction KPIs --------------------------------------------------------

export function computeInteractionKPIs(sims: NormalizedSimulation[]): InteractionKPI[] {
  return computeInteractionKPIsLocalized(sims, "es");
}

export function computeInteractionKPIsLocalized(
  sims: NormalizedSimulation[],
  locale: Locale,
): InteractionKPI[] {
  const prefix = locale === "en" ? "Interaction" : "Interacción";

  return [1, 2, 3, 4, 5, 6].map((i) => {
    const applicable = sims.filter((s) => s.rounds[i - 1]?.applicable);
    const passed = applicable.filter((s) => s.rounds[i - 1]?.score === 1);
    return {
      roundIndex: i,
      label: `${prefix} ${i}`,
      passRate: applicable.length ? passed.length / applicable.length : 0,
      avgScore: applicable.length ? avg(applicable.map((s) => s.rounds[i - 1].score!)) : 0,
      totalApplicable: applicable.length,
      totalPassed: passed.length,
    };
  }).filter((r) => r.totalApplicable > 0); // Exclude Round 6 (always "No aplica") and any round with no applicable data
}

// ---- Trend Data --------------------------------------------------------------

export function computeMonthlyTrend(sims: NormalizedSimulation[]): TrendDataPoint[] {
  return computeMonthlyTrendLocalized(sims, "es");
}

export function computeMonthlyTrendLocalized(
  sims: NormalizedSimulation[],
  locale: Locale,
): TrendDataPoint[] {
  const map = new Map<string, NormalizedSimulation[]>();
  for (const s of sims) {
    if (!map.has(s.monthKey)) map.set(s.monthKey, []);
    map.get(s.monthKey)!.push(s);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, periodSims]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;
      const dt = new Date(year, monthIndex, 1);

      const lang = locale === "en" ? "en-US" : "es-MX";
      const label = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric" }).format(dt);
      return {
        period: key,
        label,
        simulations: periodSims.length,
        averageScore: avg(periodSims.map((s) => s.score)),
        passRate: periodSims.filter((s) => s.passed).length / periodSims.length,
        uniqueUsers: new Set(periodSims.map((s) => s.userName)).size,
      };
    });
}

export function computeWeeklyTrend(sims: NormalizedSimulation[]): TrendDataPoint[] {
  const map = new Map<string, NormalizedSimulation[]>();
  for (const s of sims) {
    if (!map.has(s.weekKey)) map.set(s.weekKey, []);
    map.get(s.weekKey)!.push(s);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, periodSims]) => ({
      period: key,
      label: key,
      simulations: periodSims.length,
      averageScore: avg(periodSims.map((s) => s.score)),
      passRate: periodSims.filter((s) => s.passed).length / periodSims.length,
      uniqueUsers: new Set(periodSims.map((s) => s.userName)).size,
    }));
}

// ---- Score Distribution ------------------------------------------------------

export function computeScoreDistribution(sims: NormalizedSimulation[]): ScoreDistributionBucket[] {
  const buckets = [
    { range: "0–19", min: 0, max: 19 },
    { range: "20–39", min: 20, max: 39 },
    { range: "40–59", min: 40, max: 59 },
    { range: "60–79", min: 60, max: 79 },
    { range: "80–100", min: 80, max: 100 },
  ];

  return buckets.map((b) => {
    const count = sims.filter((s) => s.score >= b.min && s.score <= b.max).length;
    return {
      ...b,
      count,
      percentage: sims.length ? count / sims.length : 0,
    };
  });
}

// ---- Leaderboard -------------------------------------------------------------

export function computeLeaderboard(sims: NormalizedSimulation[]): LeaderboardEntry[] {
  const users = computeUserKPIs(sims);
  return users.slice(0, 50).map((u, i) => ({
    rank: i + 1,
    userName: u.userName,
    userId: u.userId,
    simulations: u.simulationCount,
    avgScore: u.averageScore,
    passRate: u.passRate,
    trend: "stable" as const,
    badge: i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : undefined,
  }));
}

// ---- Heatmap ----------------------------------------------------------------

export function computeHeatmap(sims: NormalizedSimulation[]): HeatmapCell[] {
  const map = new Map<string, { count: number; scoreSum: number }>();

  for (const s of sims) {
    const day = s.timestamp.getDay();
    const hour = s.timestamp.getHours();
    const key = `${day}-${hour}`;
    const existing = map.get(key) ?? { count: 0, scoreSum: 0 };
    map.set(key, { count: existing.count + 1, scoreSum: existing.scoreSum + s.score });
  }

  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 6; hour <= 22; hour++) {
      const key = `${day}-${hour}`;
      const val = map.get(key) ?? { count: 0, scoreSum: 0 };
      cells.push({ day, hour, count: val.count, avgScore: val.count ? val.scoreSum / val.count : 0 });
    }
  }
  return cells;
}

// ---- Helpers -----------------------------------------------------------------

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

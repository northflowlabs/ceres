import type { Tier1Figures } from "@/lib/api";

// The pre-registered protocol on /validation. A metric is assessed against its
// target only once its own minimum sample is reached.
export const MIN_N = {
  brier: 100,
  skill: 100,
  siCoverage: 200,
  tier1Precision: 30, // TIER-1 alerts issued, not predictions graded
  tier1Recall: 10,
} as const;

export const TARGETS = {
  brier: 0.1,
  siCoverage: 0.88,
  skill: 0,
  tier1Precision: 0.8,
  tier1Recall: 0.85,
} as const;

// Null until there is something to divide by.
export function tier1Rates(t: Tier1Figures | null) {
  return {
    precision: t && t.alerts > 0 ? t.confirmed / t.alerts : null,
    recall: t && t.phase4Events > 0 ? t.phase4Alerted / t.phase4Events : null,
  };
}

export type Assessment = "met" | "measured" | "awaiting" | "early";

export function assess(n: number, minN: number, met: boolean): Assessment {
  if (n < minN) return "awaiting";
  return met ? "met" : "measured";
}

export const ASSESSMENT_LABEL: Record<Assessment, string> = {
  met: "Met",
  measured: "",
  awaiting: "Not yet assessed",
  early: "Early sample",
};

// Phase 4+ outcomes from less than a year of run dates have not seen a full
// seasonal cycle, so recall stays an early sample whatever its value.
const EARLY_SAMPLE_DAYS = 365;

export function assessRecall(t: Tier1Figures | null): Assessment {
  const { recall } = tier1Rates(t);
  if (!t || recall == null || t.phase4Events < MIN_N.tier1Recall) return "awaiting";
  const days = (Date.parse(t.phase4LastRun ?? "") - Date.parse(t.phase4FirstRun ?? "")) / 86_400_000;
  if (!(days >= EARLY_SAMPLE_DAYS)) return "early";
  return recall > TARGETS.tier1Recall ? "met" : "measured";
}

// "7 countries and 5 run dates": what the Phase 4+ outcomes cover.
export function phase4Coverage(t: Tier1Figures): string {
  const countries = t.phase4Countries === 1 ? "1 country" : `${t.phase4Countries} countries`;
  const runs = t.phase4Runs === 1 ? "1 run date" : `${t.phase4Runs} run dates`;
  return `${countries} and ${runs}`;
}

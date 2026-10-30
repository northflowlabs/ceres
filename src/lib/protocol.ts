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

export type Assessment = "met" | "measured" | "awaiting";

export function assess(n: number, minN: number, met: boolean): Assessment {
  if (n < minN) return "awaiting";
  return met ? "met" : "measured";
}

export const ASSESSMENT_LABEL: Record<Assessment, string> = {
  met: "Met",
  measured: "",
  awaiting: "Not yet assessed",
};

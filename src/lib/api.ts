export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ceres.northflow.no";

// The address printed in links for readers, whichever API a build reads from.
export const PUBLIC_API_URL = "https://api.ceres.northflow.no";

export interface Prediction {
  region_id: string;
  region_name: string;
  lat: number;
  lon: number;
  reference_date: string;
  forecast_horizon_days: number;
  alert_tier: "TIER-1" | "TIER-2" | "TIER-3";
  ipc_phase_forecast: number;
  p_ipc3plus_90d: number;
  p_ipc4plus_90d: number;
  p_famine_90d: number;
  sensitivity_interval_low: number | null;
  sensitivity_interval_high: number | null;
  convergence_score: number;
  convergence_tier: string;
  is_compound: boolean;
  n_signals_flagged: number;
  flagged_sources: string;
  composite_stress_score: number;
  drought_stress: number | null;
  vegetation_stress: number | null;
  conflict_stress: number | null;
  food_access_stress: number | null;
  ipc_stress: number | null;
  price_stress: number | null;
  driver_types: string[];
  hypothesis_id: string;
}

export interface Hypothesis {
  hypothesis_id: string;
  region_id: string;
  region_name: string;
  lat: number;
  lon: number;
  forecast_horizon_days: number;
  reference_date: string;
  description?: string;
  alert_tier: string;
  ipc_phase_forecast: number;
  composite_stress_score: number;
  // Flat probability fields (API does not nest these)
  p_ipc3plus_90d: number;
  p_ipc4plus_90d: number;
  p_famine_90d: number;
  sensitivity_interval_low?: number | null;
  sensitivity_interval_high?: number | null;
  driver_types?: string[];
  n_sources_agreeing: number;
  // Richer fields of a single hypothesis
  driver_clusters?: Array<{
    driver_type: string;
    intensity: number;
    confidence: number;
    key_signals: string[];
  }>;
  evidence?: Array<{
    source_id: string;
    variable: string;
    observed_value: number;
    threshold: number;
    direction: string;
    supports_hypothesis: boolean;
  }>;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  adapter: string;
  timestamp_utc: string;
}

export interface GradeRecord {
  region_id:        string;
  region_name:      string;
  reference_date:   string;
  horizon_date:     string;
  graded_at:        string;
  predicted_tier:   string;
  p_ipc3plus_90d:   number;
  actual_ipc_phase: number;
  brier_score:      number;
  ci_covered:       boolean;
  tier_correct:     boolean;
}

export interface AggregateMetrics {
  n_graded:         number;
  brier_score:      number | null;
  ci_coverage:      number | null;
  tier1_precision:  number | null;
  tier1_recall:     number | null;
  tier1_n_issued:   number;
  tier1_n_correct:  number;
  tier1_n_missed:   number;
}

// ── Validation Ledger ──────────────────────────────────────────────────────
// What a page or a download carries for one prediction. serverData.ts builds
// these field by field from the API's rows.
export interface LedgerRow {
  prediction_id:  string;
  region_id:      string;
  reference_date: string;
  grading_date:   string;
  p_ipc3plus:     number;
  si_low:         number;
  si_high:        number;
  alert_tier:     string;
}

export interface ScoredRow extends LedgerRow {
  grade_source:       string;
  observed_phase:     number;
  binary_outcome:     number;
  brier_contribution: number;
  in_si:              number;
}

// One run withdrawn from the score, with the reason stated at the time.
export interface Withdrawal {
  reference_date: string;
  n_predictions:  number;
  n_regions:      number;
  withdrawn_at:   string;
  void_reason:    string;
}

export interface WithdrawalsResponse {
  n_withdrawn:     number;
  n_issued:        number;
  share_withdrawn: number | null;
  policy:          string;
  withdrawals:     Withdrawal[];
}

export interface ValidationMetrics {
  total_predictions:    number;
  pending:              number | null;
  awaiting_data:        number | null;
  brier_score:          number | null;
  brier_decomposition:  { reliability: number; resolution: number; uncertainty: number } | null;
  skill_score:          number | null;
  si_coverage:          number | null;
  grade_source_breakdown: Record<string, number>;
  n_graded_for_metrics: number;
}

export interface CalibrationBin {
  bin_low:              number;
  bin_high:             number;
  mean_predicted:       number;
  observed_frequency:   number;
  count:                number;
}

export interface CalibrationResponse {
  bins:     CalibrationBin[];
}

export interface ReportMeta {
  run_id:      string;
  filename:    string;
  size_bytes:  number;
  created_at:  string;
}

export interface RegionSnapshot {
  run_date:               string;
  region_id:              string;
  region_name:            string;
  alert_tier:             string;
  p_ipc3plus_90d:         number;
  p_ipc4plus_90d:         number;
  p_famine_90d:           number;
  sensitivity_interval_low:  number | null;
  sensitivity_interval_high: number | null;
  ipc_phase_forecast:     number;
  composite_stress_score: number;
  convergence_tier:       string;
  driver_types:           string[];
}

export interface ArchiveStats {
  total_runs:      number;
  total_regions:   number;
  total_snapshots: number;
  earliest_run:    string | null;
  latest_run:      string | null;
}

// The site's own ledger routes, which carry only the public fields.
async function siteFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const api = {
  hypothesis:   (id: string)                => siteFetch<Hypothesis>(`/ledger/hypothesis/${id}.json`),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ceres-core-production.up.railway.app";

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
  ci_90_low: number;
  ci_90_high: number;
  ci_method: string;
  convergence_score: number;
  convergence_tier: string;
  is_compound: boolean;
  n_signals_flagged: number;
  flagged_sources: string;
  composite_stress_score: number;
  driver_types: string[];
  hypothesis_id: string;
  generated_at: string;
}

export interface Hypothesis {
  hypothesis_id: string;
  region_id: string;
  region_name: string;
  lat: number;
  lon: number;
  created_at: string;
  forecast_horizon_days: number;
  reference_date: string;
  description: string;
  alert_tier: string;
  ipc_phase_forecast: number;
  composite_stress_score: number;
  // Flat probability fields (API does not nest these)
  p_ipc3plus_90d: number;
  p_ipc4plus_90d: number;
  p_famine_90d: number;
  ci_90_low?: number;
  ci_90_high?: number;
  ci_method?: string;
  driver_types?: string[];
  n_sources_agreeing: number;
  evidence_count?: number;
  test_plan_count?: number;
  notes?: string;
  // Optional richer fields returned by /v1/hypotheses/{id}
  famine_probability?: {
    p_ipc3plus_90d: number;
    p_ipc4plus_90d: number;
    p_famine_90d: number;
    confidence_interval_low: number;
    confidence_interval_high: number;
    method: string;
  };
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
    note: string;
  }>;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  adapter: string;
  timestamp_utc: string;
}

export interface Admin1Signal {
  admin1_id: string;
  country_id: string;
  admin1_name: string;
  centroid_lat: number;
  centroid_lon: number;
  ipc_weight: number;
  composite_stress_score: number;
  drought_stress: number;
  vegetation_stress: number;
  conflict_stress: number;
  food_access_stress: number;
  ipc_stress: number;
  price_stress: number;
  current_ipc_phase: number | null;
  n_signals_available: number;
  n_signals_elevated: number;
  n_grid_cells: number;
  from_country_fallback: boolean;
  reference_date: string;
}

export interface GradeRecord {
  hypothesis_id:    string;
  run_id:           string;
  region_id:        string;
  region_name:      string;
  reference_date:   string;
  horizon_date:     string;
  graded_at:        string;
  predicted_tier:   string;
  p_ipc3plus_90d:   number;
  ci_90_low:        number;
  ci_90_high:       number;
  actual_ipc_phase: number;
  outcome_ipc3plus: boolean;
  brier_score:      number;
  tier_correct:     boolean;
  ci_covered:       boolean;
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

export interface GradingLedger {
  grades:  GradeRecord[];
  metrics: AggregateMetrics;
}

export interface ReportMeta {
  run_id:      string;
  filename:    string;
  size_bytes:  number;
  created_at:  string;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health:       ()                          => apiFetch<HealthStatus>("/health"),
  predictions:  (tier?: string)             => apiFetch<Prediction[]>(`/v1/predictions${tier ? `?tier=${tier}` : ""}`),
  prediction:   (regionId: string)          => apiFetch<Prediction>(`/v1/predictions/${regionId}`),
  hypotheses:   ()                          => apiFetch<Hypothesis[]>("/v1/hypotheses"),
  hypothesis:   (id: string)                => apiFetch<Hypothesis>(`/v1/hypotheses/${id}`),
  admin1:       (countryId: string)         => apiFetch<Admin1Signal[]>(`/v1/admin1/${countryId}`),
  admin1Summary: ()                         => apiFetch<Admin1Signal[]>("/v1/admin1/summary"),
  grades:       ()                          => apiFetch<GradingLedger>("/v1/grades"),
  gradeMetrics: ()                          => apiFetch<AggregateMetrics>("/v1/grades/metrics"),
  runGrading:   ()                          => apiPost<{ total_graded: number }>("/v1/grades/run"),
  reports:      ()                          => apiFetch<ReportMeta[]>("/v1/reports"),
  generateReport: ()                        => apiPost<{ run_id: string; pdf_path: string }>("/v1/reports/generate"),
  subscribeEmail: (email: string)           => apiPost<{ success: boolean; message: string }>("/v1/alerts/subscribe/email", { email }),
};

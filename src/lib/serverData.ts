import { unstable_cache } from "next/cache";
import {
  API_BASE,
  AdminRow,
  AggregateMetrics,
  ArchiveStats,
  CalibrationBin,
  CalibrationResponse,
  GradeRecord,
  Hypothesis,
  LedgerRow,
  Prediction,
  RegionSnapshot,
  ScoredRow,
  ValidationMetrics,
  WithdrawalsResponse,
} from "@/lib/api";
import { NO_ADMIN1 } from "@/lib/regionNames";

// Reads the public API on the server, so a page's first HTML carries the real
// figures. A build with the API down still succeeds and gives the page its
// unavailable state. After the build a failed read throws, so a revalidation
// keeps the last good page and never caches an empty one.
const BUILDING = process.env.NEXT_PHASE === "phase-production-build";
const TIMEOUT_MS = 10_000;

function isEmpty(body: unknown): boolean {
  if (body == null) return true;
  if (Array.isArray(body)) return body.length === 0;
  return typeof body === "object" && Object.keys(body).length === 0;
}

// A 404 the caller allows is a real answer with nothing in it.
const NOT_FOUND = "not-found";

async function fetchJson<T>(path: string, allow404: boolean): Promise<T | typeof NOT_FOUND> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The signal cannot end every hang, a stalled body among them. The race can.
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`API ${path} timed out`)), TIMEOUT_MS);
  });
  const work = (async () => {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (allow404 && res.status === 404) return NOT_FOUND;
    if (!res.ok) throw new Error(`API ${path} answered ${res.status}`);
    const body = (await res.json()) as T;
    if (isEmpty(body)) throw new Error(`API ${path} answered empty`);
    return body;
  })();
  work.catch(() => {});
  try {
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// unstable_cache stores a result only when the function returns. A failure or an
// empty answer throws, so it is never cached, and a stale entry stays in use until
// a good answer replaces it.
const cachedJson = unstable_cache(
  (path: string, allow404: boolean) => fetchJson<unknown>(path, allow404),
  ["ceres-api"],
  { revalidate: 3600 },
);

async function read<T>(path: string, { allow404 = false } = {}): Promise<T | null> {
  try {
    const body = await cachedJson(path, allow404);
    return body === NOT_FOUND ? null : (body as T);
  } catch (e) {
    if (BUILDING) return null;
    throw e;
  }
}

// ── Field whitelists ──────────────────────────────────────────────────────
// Only the fields named here leave this file. Notes, evidence strings, method
// names and commit hashes never reach a page or a download.
function pick<T extends object, K extends keyof T>(row: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = row[k];
  return out;
}

const PREDICTION_FIELDS = [
  "region_id", "region_name", "lat", "lon", "reference_date", "forecast_horizon_days", "alert_tier",
  "ipc_phase_forecast", "p_ipc3plus_90d", "p_ipc4plus_90d", "p_famine_90d", "sensitivity_interval_low",
  "sensitivity_interval_high", "convergence_score", "convergence_tier", "is_compound", "n_signals_flagged",
  "flagged_sources", "composite_stress_score", "drought_stress", "vegetation_stress", "conflict_stress",
  "food_access_stress", "ipc_stress", "price_stress", "driver_types", "hypothesis_id",
] as const;

const HYPOTHESIS_FIELDS = [
  "hypothesis_id", "region_id", "region_name", "lat", "lon", "forecast_horizon_days", "reference_date",
  "description", "alert_tier", "ipc_phase_forecast", "composite_stress_score", "p_ipc3plus_90d",
  "p_ipc4plus_90d", "p_famine_90d", "driver_types", "n_sources_agreeing",
] as const;

const SNAPSHOT_FIELDS = [
  "run_date", "region_id", "region_name", "alert_tier", "p_ipc3plus_90d", "p_ipc4plus_90d", "p_famine_90d",
  "sensitivity_interval_low", "sensitivity_interval_high", "ipc_phase_forecast", "composite_stress_score",
  "convergence_tier", "driver_types",
] as const;

const GRADE_FIELDS = [
  "region_id", "region_name", "reference_date", "horizon_date", "graded_at", "predicted_tier", "p_ipc3plus_90d",
  "actual_ipc_phase", "brier_score", "ci_covered", "tier_correct",
] as const;

const ADMIN_FIELDS = [
  "admin1_id", "admin2_id", "admin1_name", "admin2_name", "country_id", "centroid_lat", "centroid_lon",
  "ipc_weight", "alert_tier", "p_ipc3plus_90d", "p_ipc4plus_90d", "composite_stress_score", "drought_stress",
  "vegetation_stress", "conflict_stress", "food_access_stress", "ipc_stress", "price_stress",
  "current_ipc_phase", "n_signals_available", "from_admin1_fallback", "from_country_fallback", "reference_date",
] as const;

// The API still carries the names of adapters that have since been replaced.
const SOURCE_LABELS: Record<string, string> = {
  chirps: "NASA POWER",
  modis_ndvi: "MODIS NDVI",
  ucdp_ged: "UCDP GED",
  ipc: "IPC / CH",
  fao_giews: "WFP prices",
  wfp_vam: "WFP prices",
};

const sourceLabel = (id: string) => SOURCE_LABELS[id] ?? id;

// This evidence row sums every month of the lookback window under a monthly
// label, so its figure and its note cannot be read as what they say.
const UNREADABLE_EVIDENCE = new Set(["conflict_events_monthly"]);

function publicHypothesisDetail(h: Hypothesis): Hypothesis {
  return {
    ...pick(h, HYPOTHESIS_FIELDS),
    driver_clusters: h.driver_clusters?.map((c) => ({
      driver_type: c.driver_type,
      intensity: c.intensity,
      confidence: c.confidence,
      key_signals: Array.from(new Set(c.key_signals.map(sourceLabel))),
    })),
    evidence: h.evidence
      ?.filter((e) => !UNREADABLE_EVIDENCE.has(e.variable))
      .map((e) => ({
        source_id: sourceLabel(e.source_id),
        variable: e.variable,
        observed_value: e.observed_value,
        threshold: e.threshold,
        direction: e.direction,
        supports_hypothesis: e.supports_hypothesis,
        note: e.note,
      })),
  };
}

// The ledger rows as the API serves them.
type RawRow = LedgerRow & Omit<Partial<ScoredRow>, keyof LedgerRow> & {
  voided_at?: string | null;
};

const LEDGER_MAX = 1000;
const TABLE_ROWS = 50;

function publicRow(r: RawRow): LedgerRow {
  return pick(r, ["prediction_id", "region_id", "reference_date", "grading_date", "alert_tier", "p_ipc3plus", "si_low", "si_high"]);
}

function isScored(r: RawRow): boolean {
  return (
    !r.voided_at &&
    r.brier_contribution != null &&
    !!r.grade_source &&
    r.grade_source !== "unresolvable" &&
    r.grade_source !== "disputed"
  );
}

function publicScoredRow(r: RawRow): ScoredRow {
  return {
    ...publicRow(r),
    grade_source: r.grade_source as string,
    observed_phase: r.observed_phase as number,
    binary_outcome: r.binary_outcome as number,
    brier_contribution: r.brier_contribution as number,
    in_si: r.in_si as number,
  };
}

async function readRows(status: string): Promise<RawRow[] | null> {
  const res = await read<{ predictions: RawRow[] }>(`/v1/validation/ledger?status=${status}&limit=${LEDGER_MAX}`);
  return res?.predictions ?? null;
}

// ── What the pages and the /ledger routes serve ───────────────────────────
// The predictions that count towards the published score, and nothing else.
export async function getScoredRows(): Promise<ScoredRow[] | null> {
  const rows = await readRows("graded");
  return rows ? rows.filter(isScored).map(publicScoredRow) : null;
}

export async function getWithdrawnRows(): Promise<LedgerRow[] | null> {
  const rows = await readRows("voided");
  return rows ? rows.map(publicRow) : null;
}

export async function getPublicMetrics(): Promise<ValidationMetrics | null> {
  const m = await read<ValidationMetrics>("/v1/validation/metrics");
  if (!m) return null;
  const { unresolvable: _unresolvable, ...sources } = m.grade_source_breakdown ?? {};
  const d = m.brier_decomposition;
  return {
    total_predictions: m.total_predictions,
    pending: m.pending,
    awaiting_data: m.awaiting_data,
    n_graded_for_metrics: m.n_graded_for_metrics,
    brier_score: m.brier_score,
    brier_decomposition: d && { reliability: d.reliability, resolution: d.resolution, uncertainty: d.uncertainty },
    skill_score: m.skill_score,
    si_coverage: m.si_coverage,
    grade_source_breakdown: sources,
  };
}

export interface LedgerFigures {
  metrics: ValidationMetrics;
  grades: AggregateMetrics;
}

export async function getLedgerFigures(): Promise<LedgerFigures | null> {
  const [metrics, grades] = await Promise.all([
    getPublicMetrics(),
    read<AggregateMetrics>("/v1/grades/metrics"),
  ]);
  return metrics && grades ? { metrics, grades } : null;
}

export async function getPredictions(): Promise<Prediction[] | null> {
  const rows = await read<Prediction[]>("/v1/predictions");
  return rows && rows.map((p) => pick(p, PREDICTION_FIELDS));
}

export async function getLatestSnapshots(): Promise<RegionSnapshot[] | null> {
  const rows = await read<RegionSnapshot[]>("/v1/archive/latest");
  return rows && rows.map((s) => pick(s, SNAPSHOT_FIELDS));
}

export interface DashboardData {
  predictions: Prediction[];
  hypotheses: Hypothesis[];
  ledger: LedgerFigures | null;
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const [predictions, hypotheses, ledger] = await Promise.all([
    getPredictions(),
    read<Hypothesis[]>("/v1/hypotheses"),
    getLedgerFigures(),
  ]);
  if (!predictions) return null;
  const run = predictions[0]?.reference_date;
  return {
    predictions,
    hypotheses: (hypotheses ?? []).filter((h) => h.reference_date === run).map((h) => pick(h, HYPOTHESIS_FIELDS)),
    ledger,
  };
}

export async function getHypothesis(id: string): Promise<Hypothesis | null> {
  const h = await read<Hypothesis>(`/v1/hypotheses/${encodeURIComponent(id)}`);
  return h && publicHypothesisDetail(h);
}

export interface RegionData {
  prediction: Prediction;
  hypothesis: Hypothesis | null;
  history: RegionSnapshot[];
  admin1: AdminRow[];
}

export async function getRegionData(regionId: string): Promise<RegionData | null> {
  const [prediction, history, admin1] = await Promise.all([
    read<Prediction>(`/v1/predictions/${regionId}`),
    read<RegionSnapshot[]>(`/v1/archive/regions/${regionId}?limit=52`, { allow404: true }),
    NO_ADMIN1.has(regionId) ? null : read<AdminRow[]>(`/v1/admin1/${regionId}`, { allow404: true }),
  ]);
  if (!prediction) return null;
  return {
    prediction: pick(prediction, PREDICTION_FIELDS),
    hypothesis: prediction.hypothesis_id ? await getHypothesis(prediction.hypothesis_id) : null,
    history: (history ?? []).map((s) => pick(s, SNAPSHOT_FIELDS)),
    admin1: (admin1 ?? []).map((a) => pick(a, ADMIN_FIELDS)),
  };
}

export interface ImpactData {
  ledger: LedgerFigures;
  archive: ArchiveStats;
  runs: string[];
  predictions: Prediction[];
}

export async function getImpactData(): Promise<ImpactData | null> {
  const [ledger, archive, runs, predictions] = await Promise.all([
    getLedgerFigures(),
    read<ArchiveStats>("/v1/archive/stats"),
    read<string[]>("/v1/archive/runs"),
    getPredictions(),
  ]);
  return ledger && archive && runs && predictions ? { ledger, archive, runs, predictions } : null;
}

export interface ValidationData {
  metrics: ValidationMetrics;
  grades: AggregateMetrics | null;
  pending: LedgerRow[];
  awaiting: LedgerRow[];
  graded: ScoredRow[];
  calibration: CalibrationBin[];
  withdrawals: Pick<WithdrawalsResponse, "n_withdrawn" | "n_issued" | "share_withdrawn" | "withdrawals"> | null;
}

export async function getValidationData(): Promise<ValidationData | null> {
  const [metrics, grades, pending, awaiting, graded, calibration, withdrawals] = await Promise.all([
    getPublicMetrics(),
    read<AggregateMetrics>("/v1/grades/metrics"),
    readRows("pending"),
    readRows("awaiting"),
    getScoredRows(),
    read<CalibrationResponse>("/v1/validation/calibration"),
    read<WithdrawalsResponse>("/v1/validation/withdrawals"),
  ]);
  if (!metrics) return null;
  const byDate = (a: RawRow, b: RawRow) => a.grading_date.localeCompare(b.grading_date);
  return {
    metrics,
    grades,
    pending: [...(pending ?? [])].sort(byDate).slice(0, TABLE_ROWS).map(publicRow),
    awaiting: [...(awaiting ?? [])].sort(byDate).reverse().slice(0, TABLE_ROWS).map(publicRow),
    graded: graded ?? [],
    calibration: calibration?.bins ?? [],
    withdrawals: withdrawals && {
      n_withdrawn: withdrawals.n_withdrawn,
      n_issued: withdrawals.n_issued,
      share_withdrawn: withdrawals.share_withdrawn,
      withdrawals: withdrawals.withdrawals.map((w) => ({
        reference_date: w.reference_date,
        n_predictions: w.n_predictions,
        n_regions: w.n_regions,
        withdrawn_at: w.withdrawn_at,
        void_reason: w.void_reason,
      })),
    },
  };
}

export interface TrackerData {
  grades: GradeRecord[];
  meanBrier: number | null;
  latest: RegionSnapshot[];
  archive: ArchiveStats;
  runs: string[];
  metrics: ValidationMetrics;
}

export async function getTrackerData(): Promise<TrackerData | null> {
  const [grades, latest, archive, runs, metrics] = await Promise.all([
    read<{ grades: GradeRecord[] }>("/v1/grades"),
    getLatestSnapshots(),
    read<ArchiveStats>("/v1/archive/stats"),
    read<string[]>("/v1/archive/runs"),
    getPublicMetrics(),
  ]);
  if (!grades || !latest || !archive || !runs || !metrics) return null;
  return { grades: grades.grades.map((g) => pick(g, GRADE_FIELDS)), meanBrier: metrics.brier_score, latest, archive, runs, metrics };
}

export interface SubnationalData {
  admin1: AdminRow[];
  admin2: AdminRow[];
}

export async function getSubnationalData(): Promise<SubnationalData | null> {
  const [admin1, admin2] = await Promise.all([
    read<AdminRow[]>("/v1/admin1/predictions?limit=700"),
    read<AdminRow[]>("/v1/admin2/predictions?limit=500"),
  ]);
  if (!admin1 || !admin2) return null;
  return { admin1: admin1.map((a) => pick(a, ADMIN_FIELDS)), admin2: admin2.map((a) => pick(a, ADMIN_FIELDS)) };
}

export interface MapData extends SubnationalData {
  predictions: Prediction[];
}

export async function getMapData(): Promise<MapData | null> {
  const [predictions, sub] = await Promise.all([getPredictions(), getSubnationalData()]);
  return predictions && sub ? { predictions, ...sub } : null;
}

import {
  API_BASE,
  AggregateMetrics,
  ArchiveStats,
  CalibrationBin,
  CalibrationResponse,
  GradingLedger,
  Hypothesis,
  LedgerRow,
  Prediction,
  RegionSnapshot,
  ScoredRow,
  ValidationMetrics,
  WithdrawalsResponse,
} from "@/lib/api";

// Reads the public API on the server, so a page's first HTML carries the real
// figures. A build with the API down still succeeds and gives the page its
// unavailable state. After the build a failed read throws, so a revalidation
// keeps the last good page and never caches an empty one.
const BUILDING = process.env.NEXT_PHASE === "phase-production-build";

async function read<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`API ${path} answered ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    if (BUILDING) return null;
    throw e;
  }
}

// The ledger rows as the API serves them. Only the fields named in publicRow and
// publicScoredRow leave this file: notes, evidence strings and commit hashes
// never reach a page or a download.
type RawRow = LedgerRow & Omit<Partial<ScoredRow>, keyof LedgerRow> & {
  voided_at?: string | null;
};

const LEDGER_MAX = 1000;
const TABLE_ROWS = 50;

function publicRow(r: RawRow): LedgerRow {
  return {
    prediction_id: r.prediction_id,
    region_id: r.region_id,
    reference_date: r.reference_date,
    grading_date: r.grading_date,
    alert_tier: r.alert_tier,
    p_ipc3plus: r.p_ipc3plus,
    si_low: r.si_low,
    si_high: r.si_high,
  };
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

async function getLedgerFigures(): Promise<LedgerFigures | null> {
  const [metrics, grades] = await Promise.all([
    getPublicMetrics(),
    read<AggregateMetrics>("/v1/grades/metrics"),
  ]);
  return metrics && grades ? { metrics, grades } : null;
}

export interface DashboardData {
  predictions: Prediction[];
  hypotheses: Hypothesis[];
  ledger: LedgerFigures | null;
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const [predictions, hypotheses, ledger] = await Promise.all([
    read<Prediction[]>("/v1/predictions"),
    read<Hypothesis[]>("/v1/hypotheses"),
    getLedgerFigures(),
  ]);
  return predictions?.length ? { predictions, hypotheses: hypotheses ?? [], ledger } : null;
}

export function getPredictions(): Promise<Prediction[] | null> {
  return read<Prediction[]>("/v1/predictions");
}

export interface ImpactData {
  ledger: LedgerFigures | null;
  archive: ArchiveStats | null;
  runs: string[] | null;
  predictions: Prediction[] | null;
}

export async function getImpactData(): Promise<ImpactData> {
  const [ledger, archive, runs, predictions] = await Promise.all([
    getLedgerFigures(),
    read<ArchiveStats>("/v1/archive/stats"),
    read<string[]>("/v1/archive/runs"),
    getPredictions(),
  ]);
  return { ledger, archive, runs, predictions };
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
  grades: GradingLedger | null;
  latest: RegionSnapshot[] | null;
  archive: ArchiveStats | null;
  runs: string[] | null;
  metrics: ValidationMetrics | null;
}

export async function getTrackerData(): Promise<TrackerData> {
  const [grades, latest, archive, runs, metrics] = await Promise.all([
    read<GradingLedger>("/v1/grades"),
    read<RegionSnapshot[]>("/v1/archive/latest"),
    read<ArchiveStats>("/v1/archive/stats"),
    read<string[]>("/v1/archive/runs"),
    getPublicMetrics(),
  ]);
  return { grades, latest, archive, runs, metrics };
}

import {
  API_BASE,
  AggregateMetrics,
  ArchiveStats,
  CalibrationResponse,
  GradingLedger,
  Hypothesis,
  LedgerResponse,
  Prediction,
  RegionSnapshot,
  ValidationMetrics,
  WithdrawalsResponse,
} from "@/lib/api";

// Reads the public API on the server, so a page's first HTML carries the real
// figures. Every page reads again in the browser on load. A read that fails
// returns null and the page shows its loading state, never a zero.
async function read<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export interface LedgerFigures {
  metrics: ValidationMetrics;
  grades: AggregateMetrics;
}

async function getLedgerFigures(): Promise<LedgerFigures | null> {
  const [metrics, grades] = await Promise.all([
    read<ValidationMetrics>("/v1/validation/metrics"),
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
  predictions: Prediction[] | null;
}

export async function getImpactData(): Promise<ImpactData> {
  const [ledger, archive, predictions] = await Promise.all([
    getLedgerFigures(),
    read<ArchiveStats>("/v1/archive/stats"),
    getPredictions(),
  ]);
  return { ledger, archive, predictions };
}

export interface ValidationData {
  pending: LedgerResponse | null;
  awaiting: LedgerResponse | null;
  graded: LedgerResponse | null;
  metrics: ValidationMetrics | null;
  calibration: CalibrationResponse | null;
  withdrawals: WithdrawalsResponse | null;
}

export async function getValidationData(): Promise<ValidationData> {
  const [pending, awaiting, graded, metrics, calibration, withdrawals] = await Promise.all([
    read<LedgerResponse>("/v1/validation/ledger?status=pending"),
    read<LedgerResponse>("/v1/validation/ledger?status=awaiting"),
    read<LedgerResponse>("/v1/validation/ledger?status=graded"),
    read<ValidationMetrics>("/v1/validation/metrics"),
    read<CalibrationResponse>("/v1/validation/calibration"),
    read<WithdrawalsResponse>("/v1/validation/withdrawals"),
  ]);
  return { pending, awaiting, graded, metrics, calibration, withdrawals };
}

export interface TrackerData {
  grades: GradingLedger | null;
  latest: RegionSnapshot[] | null;
  archive: ArchiveStats | null;
}

export async function getTrackerData(): Promise<TrackerData> {
  const [grades, latest, archive] = await Promise.all([
    read<GradingLedger>("/v1/grades"),
    read<RegionSnapshot[]>("/v1/archive/latest"),
    read<ArchiveStats>("/v1/archive/stats"),
  ]);
  return { grades, latest, archive };
}

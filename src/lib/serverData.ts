import { unstable_cache } from "next/cache";
import {
  API_BASE,
  ArchiveStats,
  CalibrationBin,
  CalibrationResponse,
  GradeRecord,
  Hypothesis,
  LedgerRow,
  Prediction,
  RegionSnapshot,
  ScoredRow,
  Tier1Figures,
  ValidationMetrics,
  WithdrawalsResponse,
} from "@/lib/api";
import { iso3 } from "@/lib/regionNames";

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

// The API does not know this id. Not a failure of the API, so a route can say so.
export class ApiNotFound extends Error {}

async function fetchJson<T>(path: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The signal cannot end every hang, a stalled body among them. The race can.
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`API ${path} timed out`)), TIMEOUT_MS);
  });
  const work = (async () => {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status === 404) throw new ApiNotFound(`API ${path} answered 404`);
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
  (path: string) => fetchJson<unknown>(path),
  ["ceres-api"],
  { revalidate: 3600 },
);

async function read<T>(path: string): Promise<T | null> {
  try {
    return (await cachedJson(path)) as T;
  } catch (e) {
    if (BUILDING) return null;
    throw e;
  }
}

// ── Field whitelists ──────────────────────────────────────────────────────
// Only the fields named here leave this file, and none of them is free text from
// the API. Notes, descriptions, method names and commit hashes stay behind.
function pick<T extends object, K extends keyof T>(row: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = row[k];
  return out;
}

const PREDICTION_FIELDS = [
  "region_id", "region_name", "lat", "lon", "reference_date", "forecast_horizon_days", "alert_tier",
  "ipc_phase_forecast", "p_ipc3plus_90d", "sensitivity_interval_low", "sensitivity_interval_high",
  "convergence_score", "convergence_tier", "is_compound", "n_signals_flagged",
  "flagged_sources", "composite_stress_score", "drought_stress", "vegetation_stress", "conflict_stress",
  "food_access_stress", "ipc_stress", "price_stress", "driver_types", "hypothesis_id",
] as const;

const HYPOTHESIS_FIELDS = [
  "hypothesis_id", "region_id", "region_name", "lat", "lon", "forecast_horizon_days", "reference_date",
  "alert_tier", "ipc_phase_forecast", "composite_stress_score", "p_ipc3plus_90d", "driver_types",
  "n_sources_agreeing",
] as const;

const SNAPSHOT_FIELDS = [
  "run_date", "region_id", "region_name", "alert_tier", "p_ipc3plus_90d", "sensitivity_interval_low", "sensitivity_interval_high", "ipc_phase_forecast", "composite_stress_score", "convergence_tier",
  "driver_types",
] as const;

const GRADE_FIELDS = [
  "region_id", "region_name", "reference_date", "horizon_date", "graded_at", "predicted_tier", "p_ipc3plus_90d",
  "actual_ipc_phase", "brier_score", "ci_covered", "tier_correct",
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

// The grounds recorded for the four withdrawn runs, in the site's wording.
const WITHDRAWAL_REASON =
  "Rainfall and vegetation inputs could fall back to mock data until 6 April 2026. UCDP conflict data was missing for Somalia, Palestine, Yemen, Afghanistan and Syria until 30 March to 1 April 2026. Hardcoded country fallback values for IPC phase, food access and prices stayed in the input adapters until 7 April 2026.";

// Evidence rows the site does not show.
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
        supports_hypothesis: e.supports_hypothesis,
      })),
  };
}

// The ledger rows as the API serves them.
type RawRow = LedgerRow & Omit<Partial<ScoredRow>, keyof LedgerRow> & {
  voided_at?: string | null;
};

const LEDGER_MAX = 1000;
const HYPOTHESIS_MAX = 500;
const TABLE_ROWS = 50;
const HISTORY_MAX = 104;

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

// A list the API answers with a total also takes an offset, and every page is read.
// A page that cannot be read gives no list at all, never part of one. Without a
// total the first answer is the list, and getGradedLedger states it when the limit
// starts to cost rows.
async function readList<R>(path: string, key: string, limit: number): Promise<R[] | null> {
  const url = `${path}${path.includes("?") ? "&" : "?"}limit=${limit}`;
  const rowsOf = (body: unknown) => (Array.isArray(body) ? body : (body as Record<string, R[]>)[key] ?? []) as R[];
  const first = await read<unknown>(url);
  if (!first) return null;
  const rows = [...rowsOf(first)];
  const { total } = first as { total?: number };
  if (total == null) {
    if (rows.length === limit) console.error(`${path} reached the ${limit} row limit`);
    return rows;
  }
  while (rows.length < total) {
    const page = await read<unknown>(`${url}&offset=${rows.length}`);
    const more = page ? rowsOf(page) : [];
    if (more.length === 0) {
      console.error(`${path} stopped at ${rows.length} of ${total} rows`);
      return null;
    }
    rows.push(...more);
  }
  return rows;
}

const readRows = (status: string) => readList<RawRow>(`/v1/validation/ledger?status=${status}`, "predictions", LEDGER_MAX);

// The ledger holds what was issued for a region on a date.
type LedgerIndex = Map<string, RawRow>;

const ledgerKey = (region: string, date: string) => `${region}|${date}`;

// Run dates in the archive, without the runs withdrawn from the score.
function publishedRuns(runs: string[], ledger: LedgerIndex): string[] {
  const withdrawn = new Set([...ledger.values()].filter((r) => r.voided_at).map((r) => r.reference_date));
  return runs.filter((d) => !withdrawn.has(d));
}

async function getLedgerIndex(): Promise<LedgerIndex | null> {
  const parts = await Promise.all(["pending", "awaiting", "graded", "voided"].map(readRows));
  if (parts.some((p) => !p)) return null;
  const index: LedgerIndex = new Map();
  for (const r of parts.flat() as RawRow[]) {
    const key = ledgerKey(r.region_id, r.reference_date);
    index.set(key, { ...index.get(key), ...r });
  }
  return index;
}

// One row per run date. The archive holds repeat writes for some dates, and the
// first write stands, because that is the one the ledger holds. Where the ledger
// has the region and date its own values stand. Runs withdrawn from the score stay
// on /validation only. `npm run check:ledger` compares the result with the raw
// archive and the ledger.
type RawSnapshot = RegionSnapshot & { archived_at?: string };

async function getHistory(regionId: string, ledger: LedgerIndex): Promise<RegionSnapshot[] | null> {
  const rows = await read<RawSnapshot[]>(`/v1/archive/regions/${regionId}?limit=${HISTORY_MAX}`);
  if (!rows) return null;
  const byDate = new Map<string, RawSnapshot>();
  for (const r of rows) {
    const seen = byDate.get(r.run_date);
    if (!seen || (r.archived_at ?? "") < (seen.archived_at ?? "")) byDate.set(r.run_date, r);
  }
  return [...byDate.values()]
    .filter((s) => !ledger.get(ledgerKey(regionId, s.run_date))?.voided_at)
    .sort((a, b) => b.run_date.localeCompare(a.run_date))
    .map((s) => {
      const issued = ledger.get(ledgerKey(regionId, s.run_date));
      const row = pick(s, SNAPSHOT_FIELDS);
      return issued
        ? {
            ...row,
            p_ipc3plus_90d: issued.p_ipc3plus,
            sensitivity_interval_low: issued.si_low,
            sensitivity_interval_high: issued.si_high,
            alert_tier: issued.alert_tier,
          }
        : row;
    });
}

// ── What the pages and the /ledger routes serve ───────────────────────────
// The predictions that count towards the published score, and nothing else.
// One row per region and date, so a repeated row counts once everywhere.
export async function getScoredRows(): Promise<ScoredRow[] | null> {
  const rows = await readRows("graded");
  if (!rows) return null;
  const byKey = new Map<string, RawRow>();
  for (const r of rows.filter(isScored)) {
    const key = ledgerKey(r.region_id, r.reference_date);
    if (!byKey.has(key)) byKey.set(key, r);
  }
  return [...byKey.values()].map(publicScoredRow);
}

export interface GradedLedger {
  total_in_score: number;
  count: number;
  complete: boolean;
  predictions: ScoredRow[];
}

export async function getGradedLedger(): Promise<GradedLedger | null> {
  const [metrics, rows] = await Promise.all([getPublicMetrics(), getScoredRows()]);
  if (!metrics || !rows) return null;
  const total = metrics.n_graded_for_metrics;
  return { total_in_score: total, count: rows.length, complete: rows.length === total, predictions: rows };
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
  tier1: Tier1Figures | null;
}

function tier1Figures(rows: ScoredRow[]): Tier1Figures {
  const alerts = rows.filter((r) => r.alert_tier === "TIER-1");
  const events = rows.filter((r) => r.observed_phase >= 4);
  const eventRuns = events.map((r) => r.reference_date).sort();
  return {
    alerts: alerts.length,
    confirmed: alerts.filter((r) => r.binary_outcome === 1).length,
    phase4Events: events.length,
    phase4Alerted: events.filter((r) => r.alert_tier === "TIER-1").length,
    phase4Countries: new Set(events.map((r) => r.region_id)).size,
    phase4Runs: new Set(eventRuns).size,
    phase4FirstRun: eventRuns[0] ?? null,
    phase4LastRun: eventRuns[eventRuns.length - 1] ?? null,
  };
}

// Counted from the rows in the score, which anyone can recount from
// /ledger/graded.json. Unique rows that do not add up to the graded total, or a
// failed read, give no counts rather than partial ones. `npm run check:ledger`
// compares them with the raw ledger and with the grades.
export async function getLedgerFigures(): Promise<LedgerFigures | null> {
  const [metrics, rows] = await Promise.all([getPublicMetrics(), getScoredRows().catch(() => null)]);
  if (!metrics) return null;
  const complete = rows?.length === metrics.n_graded_for_metrics;
  if (rows && !complete) console.error(`Ledger holds ${rows.length} scored rows of ${metrics.n_graded_for_metrics}`);
  return { metrics, tier1: rows && complete ? tier1Figures(rows) : null };
}

export async function getPredictions(): Promise<Prediction[] | null> {
  const rows = await read<Prediction[]>("/v1/predictions");
  return rows && rows.map((p) => pick(p, PREDICTION_FIELDS));
}

// The archive says which regions are current. Each region's row is then the newest
// one in its history, so the latest run answers to the same rules as every other:
// the first write, the ledger's values and no withdrawn run.
async function publishedLatest(ledger: LedgerIndex) {
  const rows = await read<RegionSnapshot[]>("/v1/archive/latest");
  if (!rows) return null;
  const histories = await Promise.all(rows.map((s) => getHistory(s.region_id, ledger)));
  if (histories.some((h) => !h)) return null;
  const history = Object.fromEntries(rows.map((s, i) => [s.region_id, histories[i] as RegionSnapshot[]]));
  return { latest: rows.flatMap((s) => history[s.region_id].slice(0, 1)), history };
}

export async function getLatestSnapshots(): Promise<RegionSnapshot[] | null> {
  const ledger = await getLedgerIndex();
  const published = ledger && (await publishedLatest(ledger));
  return published ? published.latest : null;
}

export interface DashboardData {
  predictions: Prediction[];
  hypotheses: Hypothesis[];
  complete: boolean;
  ledger: LedgerFigures | null;
}

// One hypothesis per forecast of the current run. The list holds older runs too, so
// a forecast it does not reach is read by its id.
async function currentHypotheses(predictions: Prediction[]): Promise<Hypothesis[]> {
  const listed = await readList<Hypothesis>("/v1/hypotheses", "hypotheses", HYPOTHESIS_MAX).catch(() => null);
  const byId = new Map((listed ?? []).map((h) => [h.hypothesis_id, h]));
  const rows = await Promise.all(
    predictions
      .filter((p) => p.hypothesis_id)
      .map(async (p) =>
        byId.get(p.hypothesis_id) ??
        (await read<Hypothesis>(`/v1/hypotheses/${encodeURIComponent(p.hypothesis_id)}`).catch(() => null)),
      ),
  );
  return rows.filter((h): h is Hypothesis => h != null).map((h) => pick(h, HYPOTHESIS_FIELDS));
}

export async function getDashboardData(): Promise<DashboardData | null> {
  // The forecasts stand on their own. Without hypotheses or ledger figures the
  // panels that need them say so.
  const [predictions, ledger] = await Promise.all([getPredictions(), getLedgerFigures().catch(() => null)]);
  if (!predictions) return null;
  const hypotheses = await currentHypotheses(predictions);
  return {
    predictions,
    hypotheses,
    complete: hypotheses.length === predictions.filter((p) => p.hypothesis_id).length,
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
}

export async function getRegionData(regionId: string): Promise<RegionData | null> {
  const [prediction, ledger] = await Promise.all([
    read<Prediction>(`/v1/predictions/${regionId}`),
    getLedgerIndex(),
  ]);
  if (!prediction || !ledger) return null;
  const history = await getHistory(regionId, ledger);
  if (!history) return null;
  return {
    prediction: pick(prediction, PREDICTION_FIELDS),
    hypothesis: prediction.hypothesis_id ? await getHypothesis(prediction.hypothesis_id) : null,
    history,
  };
}

export interface ImpactData {
  ledger: LedgerFigures;
  runs: string[];
  predictions: Prediction[];
  regionRuns: number;
}

export async function getImpactData(): Promise<ImpactData | null> {
  const [ledger, runs, predictions, index] = await Promise.all([
    getLedgerFigures(),
    read<string[]>("/v1/archive/runs"),
    getPredictions(),
    getLedgerIndex(),
  ]);
  if (!ledger || !runs || !predictions || !index) return null;
  const histories = await Promise.all(predictions.map((p) => getHistory(p.region_id, index)));
  if (histories.some((h) => !h)) return null;
  return {
    ledger,
    runs: publishedRuns(runs, index),
    predictions,
    regionRuns: histories.reduce((n, h) => n + (h as RegionSnapshot[]).length, 0),
  };
}

export interface ValidationData {
  metrics: ValidationMetrics;
  pending: LedgerRow[];
  awaiting: LedgerRow[];
  graded: ScoredRow[];
  calibration: CalibrationBin[];
  withdrawals: Pick<WithdrawalsResponse, "n_withdrawn" | "n_issued" | "share_withdrawn" | "withdrawals"> | null;
}

export async function getValidationData(): Promise<ValidationData | null> {
  const [metrics, pending, awaiting, graded, calibration, withdrawals] = await Promise.all([
    getPublicMetrics(),
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
        void_reason: w.void_reason.startsWith("Inputs predate") ? WITHDRAWAL_REASON : "Withdrawn from the score.",
      })),
    },
  };
}

export interface TrackerData {
  grades: GradeRecord[];
  meanBrier: number | null;
  latest: RegionSnapshot[];
  next: LedgerRow[];
  history: Record<string, RegionSnapshot[]>;
  archive: Pick<ArchiveStats, "total_regions">;
  runs: string[];
  metrics: ValidationMetrics;
}

export async function getTrackerData(): Promise<TrackerData | null> {
  const [grades, archive, runs, metrics, ledger, pending] = await Promise.all([
    readList<GradeRecord>("/v1/grades", "grades", LEDGER_MAX),
    read<ArchiveStats>("/v1/archive/stats"),
    read<string[]>("/v1/archive/runs"),
    getPublicMetrics(),
    getLedgerIndex(),
    readRows("pending"),
  ]);
  if (!grades || !archive || !runs || !metrics || !ledger || !pending) return null;
  const published = await publishedLatest(ledger);
  if (!published) return null;
  const { latest, history } = published;
  const next = [...pending]
    .sort((a, b) => a.grading_date.localeCompare(b.grading_date))
    .slice(0, latest.length)
    .map(publicRow);
  return { grades: grades.map((g) => pick(g, GRADE_FIELDS)), meanBrier: metrics.brier_score, latest, next, history, archive: { total_regions: archive.total_regions }, runs: publishedRuns(runs, ledger), metrics };
}

export interface MapData {
  predictions: Prediction[];
}

export async function getMapData(): Promise<MapData | null> {
  const predictions = await getPredictions();
  return predictions && { predictions };
}

function csvCell(v: unknown): string {
  const s = Array.isArray(v) ? v.join(";") : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const csvRow = (r: RegionSnapshot) =>
  SNAPSHOT_FIELDS.map((k) => csvCell(k === "region_id" ? iso3(r.region_id) : r[k])).join(",");

// HXL-tagged CSV: column headers, then hashtags, then data.
const csvFile = (rows: RegionSnapshot[]) =>
  [SNAPSHOT_FIELDS.join(","), SNAPSHOT_FIELDS.map((k) => HXL_TAGS[k]).join(","), ...rows.map(csvRow)].join("\n") + "\n";

// The rows the site's charts use, one per region and published run.
export async function getArchiveCsv(): Promise<string | null> {
  const [predictions, ledger] = await Promise.all([getPredictions(), getLedgerIndex()]);
  if (!predictions || !ledger) return null;
  const histories = await Promise.all(predictions.map((p) => getHistory(p.region_id, ledger)));
  if (histories.some((h) => !h)) return null;
  return csvFile((histories as RegionSnapshot[][]).flat());
}

const HXL_TAGS: Record<(typeof SNAPSHOT_FIELDS)[number], string> = {
  run_date: "#date+run",
  region_id: "#country+code+iso3",
  region_name: "#country+name",
  alert_tier: "#indicator+tier+alert",
  p_ipc3plus_90d: "#indicator+value+prob+ipc3plus+days_90",
  sensitivity_interval_low: "#indicator+value+sensitivity_interval+low+days_90",
  sensitivity_interval_high: "#indicator+value+sensitivity_interval+high+days_90",
  ipc_phase_forecast: "#indicator+value+ipc+phase+forecast",
  composite_stress_score: "#indicator+value+stress+composite",
  convergence_tier: "#indicator+tier+convergence",
  driver_types: "#indicator+label+drivers",
};

export async function getLatestCsv(): Promise<string | null> {
  const rows = await getLatestSnapshots();
  return rows && csvFile(rows);
}

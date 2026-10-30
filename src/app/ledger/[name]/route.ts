import { ledgerNotFound, ledgerResponse } from "@/lib/ledgerResponse";
import {
  getDashboardData,
  getGradedLedger,
  getImpactData,
  getLatestSnapshots,
  getLedgerFigures,
  getMapData,
  getPredictions,
  getPublicMetrics,
  getTrackerData,
  getValidationData,
  getWithdrawnRows,
} from "@/lib/serverData";

// graded.json holds every prediction in the published score: the Brier score, SI
// coverage and TIER-1 counts recompute from it. The others feed the pages.
const SOURCES: Record<string, () => Promise<unknown>> = {
  "dashboard.json": getDashboardData,
  "figures.json": getLedgerFigures,
  "graded.json": getGradedLedger,
  "impact.json": getImpactData,
  "latest.json": getLatestSnapshots,
  "map.json": getMapData,
  "metrics.json": getPublicMetrics,
  "regions.json": getPredictions,
  "tracker.json": getTrackerData,
  "validation.json": getValidationData,
  "withdrawn.json": getWithdrawnRows,
};

// Up to four rounds of reads, each bounded at 10 s: the ledger, its later pages,
// the current run and the histories.
export const maxDuration = 40;

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return Object.hasOwn(SOURCES, name) ? ledgerResponse(SOURCES[name]) : ledgerNotFound();
}

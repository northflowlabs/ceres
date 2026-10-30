import { NextResponse } from "next/server";
import { ledgerResponse } from "@/lib/ledgerResponse";
import {
  getDashboardData,
  getGradedLedger,
  getImpactData,
  getLatestSnapshots,
  getLedgerFigures,
  getMapData,
  getPredictions,
  getPublicMetrics,
  getSubnationalData,
  getTrackerData,
  getValidationData,
  getWithdrawnRows,
} from "@/lib/serverData";

// graded.json holds every prediction in the published score: the Brier score and
// SI coverage on /validation recompute from it. The others feed the pages.
const SOURCES: Record<string, () => Promise<unknown>> = {
  "dashboard.json": getDashboardData,
  "figures.json": getLedgerFigures,
  "graded.json": getGradedLedger,
  "impact.json": getImpactData,
  "latest.json": getLatestSnapshots,
  "map.json": getMapData,
  "metrics.json": getPublicMetrics,
  "regions.json": getPredictions,
  "subnational.json": getSubnationalData,
  "tracker.json": getTrackerData,
  "validation.json": getValidationData,
  "withdrawn.json": getWithdrawnRows,
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const source = SOURCES[(await params).name];
  if (!source) return NextResponse.json({ error: "not found" }, { status: 404 });
  return ledgerResponse(source);
}

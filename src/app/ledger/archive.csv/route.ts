import { csvResponse } from "@/lib/ledgerResponse";
import { getArchiveCsv } from "@/lib/serverData";

// Up to three rounds of reads, each bounded at 10 s: the ledger, its later pages and
// the histories.
export const maxDuration = 30;

export function GET() {
  return csvResponse(getArchiveCsv, "ceres-published-runs.csv");
}

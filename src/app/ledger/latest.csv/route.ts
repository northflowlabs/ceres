import { csvResponse } from "@/lib/ledgerResponse";
import { getLatestCsv } from "@/lib/serverData";

// Up to four rounds of reads, each bounded at 10 s: the ledger, its later pages,
// the current run and the histories.
export const maxDuration = 40;

export function GET() {
  return csvResponse(getLatestCsv, "ceres-latest.csv");
}

import { csvResponse } from "@/lib/ledgerResponse";
import { getLatestCsv } from "@/lib/serverData";

// Two rounds of parallel reads, each bounded at 10 s.
export const maxDuration = 30;

export function GET() {
  return csvResponse(getLatestCsv, "ceres-latest.csv");
}

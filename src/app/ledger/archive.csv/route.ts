import { csvResponse } from "@/lib/ledgerResponse";
import { getArchiveCsv } from "@/lib/serverData";

// Two rounds of parallel reads, each bounded at 10 s.
export const maxDuration = 30;

export function GET() {
  return csvResponse(getArchiveCsv, "ceres-published-runs.csv");
}

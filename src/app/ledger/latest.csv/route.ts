import { csvResponse } from "@/lib/ledgerResponse";
import { getLatestCsv } from "@/lib/serverData";

export const maxDuration = 30;

export function GET() {
  return csvResponse(getLatestCsv, "ceres-latest.csv");
}

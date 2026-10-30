import { ledgerNotFound, ledgerResponse } from "@/lib/ledgerResponse";
import { REGION_NAMES } from "@/lib/regionNames";
import { getRegionData } from "@/lib/serverData";

// Up to four rounds of reads, each bounded at 10 s: the forecast and the ledger, its
// later pages, the history, the hypothesis.
export const maxDuration = 40;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const code = (await params).id.replace(/\.json$/, "").toUpperCase();
  if (!(code in REGION_NAMES)) return ledgerNotFound();
  return ledgerResponse(() => getRegionData(code));
}

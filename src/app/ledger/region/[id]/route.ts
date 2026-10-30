import { ledgerNotFound, ledgerResponse } from "@/lib/ledgerResponse";
import { REGION_NAMES } from "@/lib/regionNames";
import { getRegionData } from "@/lib/serverData";

// Three reads, then one more, then one more, each bounded at 10 s.
export const maxDuration = 40;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const code = (await params).id.replace(/\.json$/, "").toUpperCase();
  if (!(code in REGION_NAMES)) return ledgerNotFound();
  return ledgerResponse(() => getRegionData(code));
}

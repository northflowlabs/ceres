import ImpactClient from "./ImpactClient";
import { getImpactData } from "@/lib/serverData";

export const revalidate = 3600;

// Up to three rounds of reads, each bounded at 10 s: the ledger, its later pages and
// the histories.
export const maxDuration = 30;

export default async function Page() {
  return <ImpactClient initial={await getImpactData()} />;
}

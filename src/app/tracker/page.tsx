import TrackerClient from "./TrackerClient";
import { getTrackerData } from "@/lib/serverData";

export const revalidate = 3600;

// Up to four rounds of reads, each bounded at 10 s: the ledger, its later pages,
// the current run and the histories.
export const maxDuration = 40;

export default async function Page() {
  return <TrackerClient initial={await getTrackerData()} />;
}

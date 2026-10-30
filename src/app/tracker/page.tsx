import TrackerClient from "./TrackerClient";
import { getTrackerData } from "@/lib/serverData";

export const revalidate = 3600;

// Two rounds of parallel reads, each bounded at 10 s.
export const maxDuration = 30;

export default async function Page() {
  return <TrackerClient initial={await getTrackerData()} />;
}

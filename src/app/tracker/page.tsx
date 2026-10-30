import TrackerClient from "./TrackerClient";
import { getTrackerData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <TrackerClient initial={await getTrackerData()} />;
}

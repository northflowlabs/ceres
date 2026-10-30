import DashboardClient from "./DashboardClient";
import { getDashboardData } from "@/lib/serverData";

export const revalidate = 3600;

// Up to four rounds of reads, each bounded at 10 s: the forecasts and the ledger, its
// later pages, the hypotheses, and any read by id.
export const maxDuration = 40;

export default async function Page() {
  return <DashboardClient initial={await getDashboardData()} />;
}

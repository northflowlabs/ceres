import DashboardClient from "./DashboardClient";
import { getDashboardData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <DashboardClient initial={await getDashboardData()} />;
}

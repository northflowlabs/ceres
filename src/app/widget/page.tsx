import WidgetClient from "./WidgetClient";
import { getLatestSnapshots } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <WidgetClient initial={await getLatestSnapshots()} />;
}

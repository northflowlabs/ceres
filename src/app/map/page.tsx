import MapView from "./MapView";
import { getMapData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <MapView initial={await getMapData()} />;
}

import { permanentRedirect } from "next/navigation";
import RegionClient from "./RegionClient";
import { REGION_IDS } from "@/lib/regionNames";
import { getRegionData } from "@/lib/serverData";

export const revalidate = 3600;

export function generateStaticParams() {
  return REGION_IDS.map((id) => ({ id: id.toLowerCase() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lower = id.toLowerCase();
  if (id !== lower) permanentRedirect(`/regions/${lower}`);
  const regionId = id.toUpperCase();
  return <RegionClient regionId={regionId} initial={await getRegionData(regionId)} />;
}

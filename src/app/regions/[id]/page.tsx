import { notFound, permanentRedirect } from "next/navigation";
import RegionClient from "./RegionClient";
import { REGION_IDS, REGION_NAMES } from "@/lib/regionNames";
import { getRegionData } from "@/lib/serverData";

export const revalidate = 3600;

// Three reads, then one more, then one more, each bounded at 10 s.
export const maxDuration = 40;

export function generateStaticParams() {
  return REGION_IDS.map((id) => ({ id: id.toLowerCase() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regionId = id.toUpperCase();
  if (!(regionId in REGION_NAMES)) notFound();
  const lower = id.toLowerCase();
  if (id !== lower) permanentRedirect(`/regions/${lower}`);
  return <RegionClient regionId={regionId} initial={await getRegionData(regionId)} />;
}

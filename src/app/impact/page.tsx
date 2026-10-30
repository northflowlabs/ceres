import ImpactClient from "./ImpactClient";
import { getImpactData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <ImpactClient initial={await getImpactData()} />;
}

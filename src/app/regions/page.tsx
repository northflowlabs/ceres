import RegionsClient from "./RegionsClient";
import { getPredictions } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <RegionsClient initial={await getPredictions()} />;
}

import SubnationalClient from "./SubnationalClient";
import { getSubnationalData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <SubnationalClient initial={await getSubnationalData()} />;
}

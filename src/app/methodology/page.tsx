import MethodologyClient from "./MethodologyClient";
import { getLedgerFigures } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <MethodologyClient initial={await getLedgerFigures()} />;
}

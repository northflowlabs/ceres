import ValidationClient from "./ValidationClient";
import { getValidationData } from "@/lib/serverData";

export const revalidate = 3600;

export default async function Page() {
  return <ValidationClient initial={await getValidationData()} />;
}

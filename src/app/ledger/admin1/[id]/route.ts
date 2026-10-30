import { NextResponse } from "next/server";
import { ledgerResponse } from "@/lib/ledgerResponse";
import { NO_ADMIN1, REGION_NAMES } from "@/lib/regionNames";
import { getAdmin1 } from "@/lib/serverData";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const code = (await params).id.replace(/\.json$/, "").toUpperCase();
  if (!(code in REGION_NAMES) || NO_ADMIN1.has(code)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return ledgerResponse(() => getAdmin1(code));
}

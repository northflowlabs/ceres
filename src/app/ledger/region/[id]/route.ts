import { NextResponse } from "next/server";
import { ledgerResponse } from "@/lib/ledgerResponse";
import { REGION_NAMES } from "@/lib/regionNames";
import { getRegionData } from "@/lib/serverData";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const code = (await params).id.replace(/\.json$/, "").toUpperCase();
  if (!(code in REGION_NAMES)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return ledgerResponse(() => getRegionData(code));
}

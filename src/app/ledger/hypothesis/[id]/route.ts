import { NextResponse } from "next/server";
import { ledgerResponse } from "@/lib/ledgerResponse";
import { getHypothesis } from "@/lib/serverData";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.replace(/\.json$/, "");
  if (!/^CERES-HYP-[A-Z]{3}-\d{8}-[0-9A-F]+$/.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return ledgerResponse(() => getHypothesis(id));
}

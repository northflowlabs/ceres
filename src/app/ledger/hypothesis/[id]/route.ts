import { NextResponse } from "next/server";
import { ledgerResponse } from "@/lib/ledgerResponse";
import { getHypothesis } from "@/lib/serverData";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.replace(/\.json$/, "");
  if (!/^[A-Za-z0-9-]+$/.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return ledgerResponse(() => getHypothesis(id));
}

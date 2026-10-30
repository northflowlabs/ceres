import { NextResponse } from "next/server";
import { getScoredRows } from "@/lib/serverData";

// Every prediction that counts towards the published score. The Brier score and SI
// coverage on /validation can be recomputed from these rows.
export async function GET() {
  try {
    return NextResponse.json(await getScoredRows(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

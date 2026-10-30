import { NextResponse } from "next/server";
import { getPublicMetrics } from "@/lib/serverData";

// The published metrics.
export async function GET() {
  try {
    return NextResponse.json(await getPublicMetrics(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

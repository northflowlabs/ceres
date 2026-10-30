import { NextResponse } from "next/server";
import { getWithdrawnRows } from "@/lib/serverData";

// The forecasts withdrawn from the score, as issued.
export async function GET() {
  try {
    return NextResponse.json(await getWithdrawnRows(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

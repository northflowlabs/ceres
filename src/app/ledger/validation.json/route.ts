import { NextResponse } from "next/server";
import { getValidationData } from "@/lib/serverData";

// Everything /validation shows, for a page built while the API was down.
export async function GET() {
  try {
    return NextResponse.json(await getValidationData(), {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

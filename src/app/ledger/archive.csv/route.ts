import { NextResponse } from "next/server";
import { getArchiveCsv } from "@/lib/serverData";

// Two rounds of parallel reads, each bounded at 10 s.
export const maxDuration = 30;

export async function GET() {
  try {
    const csv = await getArchiveCsv();
    if (csv) {
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="ceres-published-runs.csv"',
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  } catch {
    // falls through to the 503
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

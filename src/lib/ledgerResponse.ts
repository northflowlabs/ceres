import { NextResponse } from "next/server";
import { ApiNotFound } from "@/lib/serverData";

function isEmpty(body: unknown): boolean {
  if (body == null) return true;
  if (Array.isArray(body)) return body.length === 0;
  return typeof body === "object" && Object.keys(body as object).length === 0;
}

// An unknown id stays unknown for a while, so a shared cache may keep this briefly.
export function ledgerNotFound() {
  return NextResponse.json({ error: "not found" }, { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } });
}

// An answer without the TIER-1 counts, or with rows missing. It is served, but a
// shared cache must not keep it for the hours a full answer would stay.
function isPartial(body: unknown): boolean {
  const b = body as { tier1?: unknown; ledger?: { tier1?: unknown } | null; complete?: boolean };
  return b.tier1 === null || b.ledger === null || b.ledger?.tier1 === null || b.complete === false;
}

// Only a real answer is ever cached. A failure or an empty answer is a 503 that
// no shared cache may keep. A 404 from the API counts as a 404 only when the route
// asked for that one resource; inside an aggregate it is a failure upstream.
export async function ledgerResponse(source: () => Promise<unknown>, { primary = false } = {}) {
  try {
    const body = await source();
    if (!isEmpty(body)) {
      return NextResponse.json(body, {
        headers: { "Cache-Control": isPartial(body) ? "no-store" : "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch (e) {
    if (primary && e instanceof ApiNotFound) return ledgerNotFound();
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

// The same rule for a CSV download.
export async function csvResponse(source: () => Promise<string | null>, filename: string) {
  try {
    const csv = await source();
    if (csv) {
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  } catch {
    // falls through to the 503
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

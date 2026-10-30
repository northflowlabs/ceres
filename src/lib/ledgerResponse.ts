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

// Only a real answer is ever cached. A failure or an empty answer is a 503 that
// no shared cache may keep. A 404 from the API counts as a 404 only when the route
// asked for that one resource; inside an aggregate it is a failure upstream.
export async function ledgerResponse(source: () => Promise<unknown>, { primary = false } = {}) {
  try {
    const body = await source();
    if (!isEmpty(body)) {
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch (e) {
    if (primary && e instanceof ApiNotFound) return ledgerNotFound();
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

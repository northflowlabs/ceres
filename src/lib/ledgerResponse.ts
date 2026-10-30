import { NextResponse } from "next/server";
import { ApiNotFound } from "@/lib/serverData";

function isEmpty(body: unknown): boolean {
  if (body == null) return true;
  if (Array.isArray(body)) return body.length === 0;
  return typeof body === "object" && Object.keys(body as object).length === 0;
}

// Only a real answer is ever cached. A failure or an empty answer is a 503 that
// no shared cache may keep.
export async function ledgerResponse(source: () => Promise<unknown>) {
  try {
    const body = await source();
    if (!isEmpty(body)) {
      return NextResponse.json(body, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }
  } catch (e) {
    if (e instanceof ApiNotFound) {
      return NextResponse.json({ error: "not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

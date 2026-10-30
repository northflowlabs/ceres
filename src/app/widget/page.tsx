import WidgetClient from "./WidgetClient";
import { getLatestSnapshots } from "@/lib/serverData";

type Query = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// One read of the current run, the ledger, and a history per region, each bounded at 10 s.
export const maxDuration = 30;

// Rendered per request, so an embed gets its theme and filter in the first HTML.
export default async function Page({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const initial = await getLatestSnapshots().catch(() => null);
  return (
    <WidgetClient
      initial={initial}
      theme={one(q.theme)}
      limit={one(q.limit)}
      tier={one(q.tier)}
      region={one(q.region)}
      compact={one(q.compact) === "true"}
    />
  );
}

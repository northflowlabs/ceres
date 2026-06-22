import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { REGION_IDS } from "@/lib/regionNames";

const BASE = "https://ceres.northflow.no";

// Static indexable routes. Gated/private routes (/login, /account, /widget)
// are deliberately excluded.
const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/",           changeFrequency: "weekly",  priority: 1.0 },
  { path: "/about",      changeFrequency: "monthly", priority: 0.8 },
  { path: "/methodology", changeFrequency: "monthly", priority: 0.8 },
  { path: "/data",       changeFrequency: "weekly",  priority: 0.8 },
  { path: "/validation", changeFrequency: "weekly",  priority: 0.9 },
  { path: "/tracker",    changeFrequency: "weekly",  priority: 0.8 },
  { path: "/impact",     changeFrequency: "monthly", priority: 0.6 },
  { path: "/regions",    changeFrequency: "weekly",  priority: 0.9 },
  { path: "/map",        changeFrequency: "weekly",  priority: 0.8 },
  { path: "/subnational", changeFrequency: "weekly", priority: 0.7 },
  { path: "/api-access", changeFrequency: "monthly", priority: 0.6 },
  { path: "/changelog",  changeFrequency: "weekly",  priority: 0.5 },
  { path: "/embed",      changeFrequency: "monthly", priority: 0.4 },
];

async function getRegionIds(): Promise<string[]> {
  try {
    const snapshots = await api.archiveLatest();
    const ids = Array.from(
      new Set(snapshots.map((s) => s.region_id).filter(Boolean))
    );
    if (ids.length > 0) return ids;
  } catch {
    // fall through to hardcoded list
  }
  return REGION_IDS;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const regionIds = await getRegionIds();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const regionEntries: MetadataRoute.Sitemap = regionIds.map((id) => ({
    url: `${BASE}/regions/${id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...regionEntries];
}

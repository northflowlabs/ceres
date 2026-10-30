"use client";

import { useEffect, useState } from "react";
import { useSiteData } from "@/lib/useSiteData";
import type { RegionSnapshot } from "@/lib/api";

function tierColor(tier: string) {
  if (tier === "TIER-1") return "#C0392B";
  if (tier === "TIER-2") return "#D97706";
  return "#2E7D32";
}

function tierBg(tier: string) {
  if (tier === "TIER-1") return "#FEF2F2";
  if (tier === "TIER-2") return "#FFFBEB";
  return "#F0FDF4";
}

function fmtPct(n: number | null | undefined) { if (n == null) return "n/a"; return `${(n * 100).toFixed(1)}%`; }

export default function WidgetPage({ initial }: { initial: RegionSnapshot[] | null }) {
  // Read after mount, so the first HTML is the default widget and stays cacheable.
  const [params, setParams] = useState(() => new URLSearchParams());
  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);

  const theme    = params.get("theme") ?? "light";
  const limit    = Math.min(20, Math.max(1, parseInt(params.get("limit") ?? "5", 10) || 5));
  const tier     = params.get("tier") ?? "";      // filter: TIER-1, TIER-2, etc.
  const region   = params.get("region") ?? "";    // filter: single region_id
  const compact  = params.get("compact") === "true";

  const { data, failed } = useSiteData<RegionSnapshot[]>("latest", initial);
  const loading = !data && !failed;
  const updated = data?.[0]?.run_date ?? "";
  const rows = [...(data ?? [])]
    .sort((a, b) => b.p_ipc3plus_90d - a.p_ipc3plus_90d)
    .filter((r) => !tier || r.alert_tier === tier.toUpperCase())
    .filter((r) => !region || r.region_id === region.toUpperCase())
    .slice(0, limit);

  const dark = theme === "dark";
  const bg     = dark ? "#1C1917" : "#FAFAF8";
  const border = dark ? "#44403C" : "#E5E0D8";
  const ink    = dark ? "#E7E5E4" : "#1C1917";
  const inkMid = dark ? "#A8A29E" : "#6B6560";
  const mono   = "'IBM Plex Mono', 'Fira Mono', monospace";

  return (
    <div style={{
      fontFamily: mono, background: bg, border: `1px solid ${border}`,
      display: "flex", flexDirection: "column", minHeight: "100vh",
      margin: 0, padding: 0, boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ padding: compact ? "10px 14px 8px" : "14px 18px 10px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, background: "#C0392B", borderRadius: "50%" }} />
          <span style={{ fontSize: compact ? 9 : 10, letterSpacing: "0.18em", textTransform: "uppercase", color: inkMid }}>
            CERES · Food Crisis Risk
          </span>
        </div>
        <a href="https://ceres.northflow.no" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: inkMid, textDecoration: "none" }}>
          ceres.northflow.no ↗
        </a>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, fontSize: 10, color: inkMid, textAlign: "center" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 20, fontSize: 10, color: inkMid, textAlign: "center" }}>Unavailable right now</div>
        ) : rows.map((r, i) => (
          <a
            key={r.region_id}
            href={`https://ceres.northflow.no/?region=${r.region_id}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "block", textDecoration: "none",
              padding: compact ? "8px 14px" : "12px 18px",
              borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
              background: "transparent",
              borderLeft: `3px solid ${tierColor(r.alert_tier)}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: compact ? 2 : 4 }}>
              <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: ink, letterSpacing: "0.03em" }}>{r.region_name}</span>
              <span style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: tierColor(r.alert_tier), letterSpacing: "-0.01em" }}>
                {fmtPct(r.p_ipc3plus_90d)}
              </span>
            </div>
            {!compact && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: tierColor(r.alert_tier), opacity: 0.9 }}>{r.alert_tier}</span>
                <span style={{ fontSize: 9, color: inkMid }}>90% SI [{fmtPct(r.sensitivity_interval_low)}-{fmtPct(r.sensitivity_interval_high)}]</span>
                <span style={{ fontSize: 9, color: inkMid }}>IPC {r.ipc_phase_forecast}+</span>
              </div>
            )}
            {compact && (
              <div style={{ fontSize: 9, color: inkMid, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.alert_tier}</div>
            )}
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: compact ? "6px 14px" : "8px 18px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: inkMid }}>P(IPC Phase 3+) · 90-day forecast</span>
        {updated && <span style={{ fontSize: 9, color: inkMid }}>Updated {updated}</span>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, Prediction } from "@/lib/api";

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }
function tierColor(t: string) { return t === "TIER-1" ? "#C0392B" : t === "TIER-2" ? "#D97706" : "#2E7D32"; }
function tierLabel(t: string) { return t === "TIER-1" ? "Critical" : t === "TIER-2" ? "Warning" : "Watch"; }
function tierBg(t: string)    { return t === "TIER-1" ? "#FEF2F2" : t === "TIER-2" ? "#FFFBEB" : "#F0FDF4"; }

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
}

const IPC_LABELS: Record<number, string> = { 1: "Minimal", 2: "Stressed", 3: "Crisis", 4: "Emergency", 5: "Famine" };

export default function RegionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [filter,      setFilter]      = useState<"all" | "TIER-1" | "TIER-2" | "TIER-3">("all");
  const [sort,        setSort]        = useState<"risk" | "name">("risk");

  useEffect(() => {
    api.predictions()
      .then(setPredictions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = predictions
    .filter(p => filter === "all" || p.alert_tier === filter)
    .sort((a, b) => sort === "name"
      ? a.region_name.localeCompare(b.region_name)
      : b.p_ipc3plus_90d - a.p_ipc3plus_90d);

  const n1 = predictions.filter(p => p.alert_tier === "TIER-1").length;
  const n2 = predictions.filter(p => p.alert_tier === "TIER-2").length;
  const n3 = predictions.filter(p => p.alert_tier === "TIER-3").length;

  const btnStyle = (active: boolean, color?: string) => ({
    fontFamily: "var(--mono)" as const, fontSize: 10, letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "8px 16px",
    background: active ? (color ?? "var(--ink)") : "white",
    color: active ? "white" : "var(--ink-light)",
    border: `1px solid ${active ? (color ?? "var(--ink)") : "var(--border)"}`,
    cursor: "pointer" as const,
    transition: "all 0.15s",
  });

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Intelligence Regions
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>All Monitored Regions</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          Live 90-day famine risk intelligence for every region tracked by CERES.
          Each region has a dedicated intelligence page with trend history, driver breakdown, and sub-national analysis.
        </p>
      </div>

      <div className="regions-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {/* Stats strip */}
        {!loading && predictions.length > 0 && (
          <div className="regions-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "40px 0 32px" }}>
            {[
              { val: String(predictions.length), label: "Regions Monitored", color: "var(--ink)" },
              { val: String(n1),  label: "Critical Risk",  color: "#C0392B" },
              { val: String(n2),  label: "Warning",        color: "#D97706" },
              { val: String(n3),  label: "Watch",          color: "#2E7D32" },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ background: "white", padding: "20px 24px" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter + sort bar */}
        <div className="regions-filter-bar" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginRight: 4 }}>Filter:</span>
          <button style={btnStyle(filter === "all")}    onClick={() => setFilter("all")}>All ({predictions.length})</button>
          <button style={btnStyle(filter === "TIER-1", "#C0392B")} onClick={() => setFilter("TIER-1")}>Critical ({n1})</button>
          <button style={btnStyle(filter === "TIER-2", "#D97706")} onClick={() => setFilter("TIER-2")}>Warning ({n2})</button>
          <button style={btnStyle(filter === "TIER-3", "#2E7D32")} onClick={() => setFilter("TIER-3")}>Watch ({n3})</button>
          <div className="regions-sort" style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)" }}>Sort:</span>
            <button style={btnStyle(sort === "risk")} onClick={() => setSort("risk")}>By Risk</button>
            <button style={btnStyle(sort === "name")} onClick={() => setSort("name")}>A – Z</button>
          </div>
        </div>

        {/* Error */}
        {error && <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--crisis)", marginBottom: 24 }}>{error}</div>}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 148, border: "1px solid var(--border-light)", borderLeft: "3px solid var(--border)" }} />
            ))}
          </div>
        )}

        {/* Region cards grid */}
        {!loading && (
          <div className="regions-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {filtered.map(p => {
              const color = tierColor(p.alert_tier);
              const bg    = tierBg(p.alert_tier);
              return (
                <Link key={p.region_id} href={`/regions/${p.region_id.toLowerCase()}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: "white", border: "1px solid var(--border)", borderLeft: `3px solid ${color}`,
                    padding: "18px 20px", transition: "box-shadow 0.15s", cursor: "pointer",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{p.region_name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 2 }}>{p.region_id}</div>
                      </div>
                      <div style={{ padding: "4px 10px", background: bg, border: `1px solid ${color}`, fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color, flexShrink: 0 }}>
                        {tierLabel(p.alert_tier)}
                      </div>
                    </div>

                    {/* Probability */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{pct(p.p_ipc3plus_90d)}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>P(IPC 3+ · 90d)</span>
                    </div>

                    {/* CI bar */}
                    <div style={{ height: 5, background: "var(--border-light)", borderRadius: 3, marginBottom: 10, position: "relative" }}>
                      {p.sensitivity_interval_low != null && p.sensitivity_interval_high != null && (
                        <div style={{ position: "absolute", height: "100%", borderRadius: 3, left: `${p.sensitivity_interval_low * 100}%`, width: `${(p.sensitivity_interval_high - p.sensitivity_interval_low) * 100}%`, background: color, opacity: 0.25 }} />
                      )}
                      <div style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", top: -2, transform: "translateX(-50%)", left: `${p.p_ipc3plus_90d * 100}%`, background: color }} />
                    </div>

                    {/* Footer row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
                        IPC {p.ipc_phase_forecast} · {IPC_LABELS[p.ipc_phase_forecast] ?? "—"}
                        {p.driver_types?.length > 0 && (
                          <span style={{ marginLeft: 8, color: "var(--ink-light)" }}>· {p.driver_types.slice(0, 2).join(", ")}</span>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {!loading && filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-light)", padding: "40px 0", textAlign: "center" }}>
                No regions match this filter.
              </div>
            )}
          </div>
        )}

        {/* Last updated */}
        {!loading && predictions.length > 0 && (
          <div style={{ marginTop: 40, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.06em", borderTop: "1px solid var(--border-light)", paddingTop: 20 }}>
            Last pipeline run: {fmtDate(predictions[0]?.reference_date ?? "")} · {predictions.length} regions · 90-day forecast horizon · Refreshed weekly
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

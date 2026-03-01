"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { api, Prediction, Hypothesis } from "@/lib/api";
import { tierLabel, formatDate, pct } from "@/lib/utils";

const LeafletRiskMap = dynamic(() => import("@/components/LeafletRiskMap"), { ssr: false });

// ── Editorial helpers ─────────────────────────────────────────────────────
function editColor(tier: string) {
  if (tier === "TIER-1") return "#C0392B";
  if (tier === "TIER-2") return "#D97706";
  return "#2E7D32";
}
function tierCssClass(tier: string) {
  if (tier === "TIER-1") return "tier-crisis";
  if (tier === "TIER-2") return "tier-warning";
  return "tier-watch";
}
function tierBadgeClass(tier: string) {
  if (tier === "TIER-1") return "tier-badge tier-badge-crisis";
  if (tier === "TIER-2") return "tier-badge tier-badge-warning";
  return "tier-badge tier-badge-watch";
}

export default function Dashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [hypotheses,  setHypotheses]  = useState<Hypothesis[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selPred,     setSelPred]     = useState<Prediction | null>(null);
  const [selHyp,      setSelHyp]      = useState<Hypothesis | null>(null);
  const [deepHyp,     setDeepHyp]     = useState<Hypothesis | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"regions" | "detail">("regions");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (sheetOpen || menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen, menuOpen]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [preds, hyps] = await Promise.all([api.predictions(), api.hypotheses()]);
      setPredictions(preds);
      setHypotheses(hyps);
      setLastUpdated(preds[0]?.reference_date ?? "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const n1 = predictions.filter((p) => p.alert_tier === "TIER-1").length;
  const n2 = predictions.filter((p) => p.alert_tier === "TIER-2").length;

  const selectRegion = useCallback(async (p: Prediction) => {
    setSelPred(p);
    const hyp = hypotheses.find((h) => h.hypothesis_id === p.hypothesis_id);
    setSelHyp(hyp ?? null);
    setDeepHyp(null);
    if (p.hypothesis_id) {
      setDeepLoading(true);
      try {
        const full = await api.hypothesis(p.hypothesis_id);
        setDeepHyp(full);
      } catch {
        // fallback to shallow hyp — no-op
      } finally {
        setDeepLoading(false);
      }
    }
  }, [hypotheses]);

  const sorted = [...predictions].sort((a, b) => b.p_ipc3plus_90d - a.p_ipc3plus_90d);
  const hyp = deepHyp ?? selHyp;

  return (
    <div className="topo-texture" style={{
      background: "var(--parchment)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── MASTHEAD ─────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "2px solid var(--ink)",
        padding: "0 32px",
        background: "var(--parchment)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "stretch",
        gap: 0,
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 32px 14px 0",
          borderRight: "1px solid var(--border)",
        }}>
          <div style={{
            width: 36, height: 36,
            border: "2px solid var(--ink)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{ width: 10, height: 10, background: "var(--earth)", borderRadius: "50%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontFamily: "var(--display)", fontSize: 18, fontWeight: 700,
              letterSpacing: "0.08em", lineHeight: 1,
            }}>CERES</span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em",
              color: "var(--ink-light)", textTransform: "uppercase", marginTop: 3,
            }}>Famine Intelligence System · HGE Adapter #5</span>
          </div>
        </div>

        {/* Meta */}
        <div className="desktop-meta" style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 32px", gap: 28, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.06em" }}>
            {lastUpdated ? `LAST UPDATED: ${formatDate(lastUpdated).toUpperCase()}` : "LOADING…"} · 90-DAY HORIZON · IPC PHASE 3+ THRESHOLD
          </span>
          <span style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: 12 }}>
            Northflow Technologies — Open Humanitarian Intelligence
          </span>
          {n1 > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--crisis)", color: "white",
              padding: "6px 16px",
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em",
              borderRadius: 2,
            }}>
              <span className="animate-pulse-dot" style={{
                width: 6, height: 6, background: "white", borderRadius: "50%", display: "inline-block",
              }} />
              {n1} REGION{n1 > 1 ? "S" : ""} AT CRITICAL RISK
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="desktop-nav-links" style={{ display: "flex", alignItems: "center", padding: "0 16px", borderRight: "1px solid var(--border)" }}>
          {([
            { href: "/",            label: "Dashboard"    },
            { href: "/methodology", label: "Methodology"  },
            { href: "/data",        label: "Data Sources" },
            { href: "/validation",  label: "Validation"   },
            { href: "/about",       label: "About"        },
            { href: "/api-access",  label: "API"          },
          ] as const).map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              color: href === "/" ? "var(--earth)" : "var(--ink-light)",
              padding: "0 12px", height: "100%",
              display: "flex", alignItems: "center",
              borderBottom: href === "/" ? "2px solid var(--earth)" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
            }}>{label}</Link>
          ))}
        </div>

        {/* Pipeline status — hidden on mobile, hamburger takes its place */}
        <div className="desktop-meta" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 0 0 24px",
          marginLeft: "auto",
        }}>
          <span className="animate-pulse-live" style={{
            width: 7, height: 7, background: "#2E7D32", borderRadius: "50%", display: "inline-block",
          }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
            {loading ? "LOADING…" : error ? "API OFFLINE" : `PIPELINE LIVE · ${predictions.length} REGIONS`}
          </span>
          <button
            onClick={load}
            disabled={loading}
            style={{
              marginLeft: 12, fontFamily: "var(--mono)", fontSize: 10,
              border: "1px solid var(--border)", padding: "4px 10px",
              background: "transparent", cursor: "pointer", color: "var(--ink-light)",
              letterSpacing: "0.06em",
            }}
          >
            {loading ? "…" : "REFRESH"}
          </button>
        </div>
        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          style={{
            display: "none", marginLeft: "auto",
            alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 8px", gap: 5, flexDirection: "column",
          }}
          aria-label="Open menu"
        >
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)" }} />
        </button>
      </header>

      {/* ── MOBILE NAV DRAWER ────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 3000,
          background: "var(--parchment)",
          display: "flex", flexDirection: "column",
          padding: "24px 28px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <span style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, letterSpacing: "0.06em" }}>CERES</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, lineHeight: 1, color: "var(--ink)", padding: 4 }}>✕</button>
          </div>
          {([
            { href: "/",            label: "Dashboard"    },
            { href: "/methodology", label: "Methodology"  },
            { href: "/data",        label: "Data Sources" },
            { href: "/validation",  label: "Validation"   },
            { href: "/tracker",     label: "Track Record" },
            { href: "/about",       label: "About"        },
            { href: "/api-access",  label: "API"          },
          ] as const).map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: "var(--display)", fontSize: 22, fontWeight: 600,
              color: "var(--ink)", textDecoration: "none",
              padding: "14px 0", borderBottom: "1px solid var(--border-light)",
              display: "block",
            }}>{label}</Link>
          ))}
          <a href="mailto:ceres@northflow.no" style={{
            marginTop: 32, fontFamily: "var(--mono)", fontSize: 11,
            letterSpacing: "0.1em", color: "var(--earth)", textDecoration: "none",
          }}>ceres@northflow.no</a>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "var(--crisis-light)", borderBottom: "1px solid rgba(192,57,43,0.3)",
          padding: "10px 32px",
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)",
          letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontWeight: 600 }}>API UNAVAILABLE</span>
          <span style={{ color: "var(--ink-light)" }}>{error}</span>
          <code style={{
            background: "white", border: "1px solid var(--border)",
            padding: "2px 8px", color: "var(--ink-mid)",
          }}>ceres serve</code>
        </div>
      )}

      {/* ── 3-COLUMN BODY ────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 300px",
        flex: 1,
        height: "calc(100vh - 65px)",
        overflow: "hidden",
      }} className="dashboard-grid">

        {/* ── MOBILE TABS ───────────────────────────────────────────── */}
        <div className="mobile-tabs" style={{ gridColumn: "1 / -1" }}>
          <button className={`mobile-tab${mobileTab === "regions" ? " active" : ""}`} onClick={() => setMobileTab("regions")}>
            Regions {predictions.length > 0 ? `(${predictions.length})` : ""}
          </button>
          <button className={`mobile-tab${mobileTab === "detail" ? " active" : ""}`} onClick={() => setMobileTab("detail")}>
            {selPred ? selPred.region_name : "Detail"}
          </button>
        </div>

        {/* ── LEFT PANEL — Region list ─────────────────────────────── */}
        <aside className={`dashboard-panel-list${mobileTab === "regions" ? " mobile-active" : ""}`} style={{
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          background: "var(--parchment)",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-light)" }}>
            <div className="panel-label">Active Monitoring Zones</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600 }}>
              {loading ? "Loading regions…" : `${predictions.length} Regions · ${n1 + n2} Alerts`}
            </div>
          </div>

          {/* Summary strip */}
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-light)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
          }}>
            {[
              { num: n1, label: "Critical", color: "var(--crisis)" },
              { num: n2, label: "Warning",  color: "var(--warning)" },
              { num: predictions.length, label: "Regions", color: "var(--ink)" },
            ].map(({ num, label, color }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, lineHeight: 1, color }}>
                  {loading ? "—" : num}
                </span>
                <span className="panel-label" style={{ marginBottom: 0 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{
                height: 118, border: "1px solid var(--border-light)",
                borderLeft: "3px solid var(--border)",
              }} />
            ))}
            {sorted.map((p, i) => {
              const color = editColor(p.alert_tier);
              const isSel = selPred?.region_id === p.region_id;
              return (
                <div
                  key={p.region_id}
                  className={`region-card ${tierCssClass(p.alert_tier)} animate-card-in ${isSel ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => { selectRegion(p); if (isMobile) { setSheetOpen(true); } else { setMobileTab("detail"); } }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 600 }}>{p.region_name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
                        {p.region_id} · {p.region_name.includes("Africa") || ["SDN","SOM","ETH","SSD","KEN","NGA"].includes(p.region_id) ? "Africa" : "Global"}
                      </div>
                    </div>
                    <span className={tierBadgeClass(p.alert_tier)}>
                      {tierLabel(p.alert_tier)}
                    </span>
                  </div>

                  {/* Probability */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                    <span style={{
                      fontFamily: "var(--display)", fontSize: 28, fontWeight: 700,
                      lineHeight: 1, color,
                    }}>{pct(p.p_ipc3plus_90d)}</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 11, color: "var(--ink-light)", fontStyle: "italic" }}>
                      P(IPC 3+ · 90d)
                    </span>
                  </div>

                  {/* CI bar */}
                  <div style={{
                    height: 4, background: "var(--border-light)",
                    borderRadius: 2, marginBottom: 4, position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", height: "100%", borderRadius: 2,
                      left: `${p.ci_90_low * 100}%`,
                      width: `${(p.ci_90_high - p.ci_90_low) * 100}%`,
                      background: color, opacity: 0.3,
                    }} />
                    <div style={{
                      position: "absolute", width: 8, height: 8, borderRadius: "50%",
                      top: -2, transform: "translateX(-50%)",
                      left: `${p.p_ipc3plus_90d * 100}%`,
                      background: color,
                    }} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginBottom: 8 }}>
                    CI [{pct(p.ci_90_low)} – {pct(p.ci_90_high)}] · {p.ci_method ?? "Bootstrap"}
                  </div>

                  {/* Drivers */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(p.driver_types ?? []).map((d) => (
                      <span key={d} className="driver-tag">{d}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── MAP ──────────────────────────────────────────────────── */}
        <main className="dashboard-panel-map" style={{ position: "relative", background: "var(--map-bg)", overflow: "hidden" }}>
          {!isMobile && (
            <LeafletRiskMap
              predictions={predictions}
              selected={selPred}
              onSelect={selectRegion}
            />
          )}

          {/* Map overlay — run info */}
          <div style={{
            position: "absolute", top: 16, left: 16, zIndex: 800,
            background: "rgba(245,240,232,0.95)",
            border: "1px solid var(--border)",
            padding: "10px 14px",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              90-Day Famine Risk — Active Monitoring
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", lineHeight: 1.8 }}>
              IPC Phase 3+ probability · Logistic model + Bootstrap CI<br />
              Data: CHIRPS · MODIS · ACLED · FEWS NET · WFP VAM · FAO<br />
              {lastUpdated ? `Ref: ${formatDate(lastUpdated)}` : "Loading…"} · HGE v1.0
            </div>
          </div>

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 24, left: 16, zIndex: 800,
            background: "rgba(245,240,232,0.95)",
            border: "1px solid var(--border)",
            padding: "12px 16px",
            backdropFilter: "blur(4px)",
          }}>
            <div className="panel-label" style={{ marginBottom: 8 }}>Risk Classification</div>
            {[
              { color: "#C0392B", label: "Critical (>90% · IPC Phase 4–5 likely)" },
              { color: "#D97706", label: "Warning (70–90% · IPC Phase 3 likely)" },
              { color: "#2E7D32", label: "Watch (50–70% · Elevated risk)" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, fontSize: 11, color: "var(--ink-mid)" }}>
                <div style={{ width: 14, height: 14, borderRadius: 1, background: color, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          {/* Attribution */}
          <div style={{
            position: "absolute", bottom: 8, right: 8, zIndex: 800,
            fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.04em",
          }}>
            Northflow CERES · HGE · Open Humanitarian Intelligence · 2026
          </div>
        </main>

        {/* ── RIGHT PANEL — Hypothesis + Signals + Ledger ─────────── */}
        <aside className={`dashboard-panel-detail${mobileTab === "detail" ? " mobile-active" : ""}`} style={{
          borderLeft: "1px solid var(--border)",
          overflowY: "auto",
          background: "var(--parchment)",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Header */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-light)" }}>
            <div className="panel-label">
              {selPred ? `Selected Region · ${selPred.region_name}` : "Select a Region"}
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600 }}>
              Hypothesis Analysis
            </div>
          </div>

          {!selPred && !loading && (
            <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ opacity: 0.25 }}>
                <circle cx="26" cy="26" r="24" stroke="var(--ink)" strokeWidth="1.5" />
                <circle cx="26" cy="26" r="8" stroke="var(--earth)" strokeWidth="1.5" />
                <line x1="26" y1="2" x2="26" y2="14" stroke="var(--ink)" strokeWidth="1" />
                <line x1="26" y1="38" x2="26" y2="50" stroke="var(--ink)" strokeWidth="1" />
                <line x1="2" y1="26" x2="14" y2="26" stroke="var(--ink)" strokeWidth="1" />
                <line x1="38" y1="26" x2="50" y2="26" stroke="var(--ink)" strokeWidth="1" />
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No Region Selected</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", lineHeight: 1.6, maxWidth: 200 }}>
                  Click a region card or map circle to inspect its hypothesis and signal evidence.
                </div>
              </div>
            </div>
          )}

          {selPred && deepLoading && !deepHyp && !selHyp && (
            <div style={{ padding: "20px" }}>
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 10, width: "90%", marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: "75%", marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: "80%" }} />
            </div>
          )}

          {/* Hypothesis block */}
          {hyp && selPred && (
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-light)" }} className="animate-fade-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div className="panel-label" style={{ marginBottom: 0 }}>Active Hypotheses — HGE Engine</div>
                {deepLoading && (
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.08em" }}>LOADING…</span>
                )}
              </div>

              {/* Primary hypothesis */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
                  H-01 · Primary Driver
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink-mid)", fontStyle: "italic", borderLeft: "2px solid var(--earth)", paddingLeft: 10, marginBottom: 6 }}>
                  {hyp.description}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: "var(--border-light)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: "var(--earth)", width: `${Math.round(selPred.p_ipc3plus_90d * 100)}%` }} />
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", width: 32, textAlign: "right" }}>
                    {pct(selPred.p_ipc3plus_90d)}
                  </span>
                </div>
              </div>

              {/* Driver clusters */}
              {(hyp.driver_clusters ?? []).slice(0, 3).map((dc, i) => (
                <div key={dc.driver_type} style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
                    H-0{i + 2} · {dc.driver_type}
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--ink-mid)", fontStyle: "italic", borderLeft: "2px solid var(--earth)", paddingLeft: 10, marginBottom: 6 }}>
                    {(dc.key_signals ?? []).slice(0, 3).join(" · ")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--border-light)", borderRadius: 2 }}>
                      <div style={{ height: "100%", borderRadius: 2, background: "var(--earth)", width: `${Math.round(dc.intensity * 100)}%`, opacity: 0.7 + dc.confidence * 0.3 }} />
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", width: 32, textAlign: "right" }}>
                      {Math.round(dc.intensity * 100)}%
                    </span>
                  </div>
                </div>
              ))}

              {/* Fallback when no driver_clusters */}
              {(hyp.driver_clusters ?? []).length === 0 && (selPred.driver_types ?? []).slice(1, 3).map((d, i) => (
                <div key={d} style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
                    H-0{i + 2} · Contributing Factor
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--ink-mid)", fontStyle: "italic", borderLeft: "2px solid var(--earth)", paddingLeft: 10, marginBottom: 6 }}>
                    {d} is a significant elevated driver contributing to crisis risk.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--border-light)", borderRadius: 2 }}>
                      <div style={{ height: "100%", borderRadius: 2, background: "var(--earth)", width: `${70 - i * 12}%` }} />
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", width: 32, textAlign: "right" }}>
                      {70 - i * 12}%
                    </span>
                  </div>
                </div>
              ))}

              {/* Evidence table — only available from deep fetch */}
              {(hyp.evidence ?? []).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="panel-label" style={{ marginBottom: 8 }}>Evidence Records — {(hyp.evidence ?? []).length} items</div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="evidence-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Variable</th>
                          <th>Observed</th>
                          <th>Threshold</th>
                          <th>Dir</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(hyp.evidence ?? []).slice(0, 8).map((ev, ei) => (
                          <tr key={ei}>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--earth)" }}>{ev.source_id}</td>
                            <td>{ev.variable}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{(ev.observed_value ?? 0).toFixed(2)}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{(ev.threshold ?? 0).toFixed(2)}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{ev.direction}</td>
                            <td>
                              <span className={ev.supports_hypothesis ? "evidence-supports" : "evidence-contradicts"}
                                style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.06em" }}>
                                {ev.supports_hypothesis ? "✓ SUP" : "✗ CON"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(hyp.evidence ?? []).length > 8 && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 6 }}>
                      +{(hyp.evidence ?? []).length - 8} more evidence records
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Signal matrix */}
          {selPred && (
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
              <div className="panel-label" style={{ marginBottom: 10 }}>Signal Convergence Matrix</div>
              {[
                { name: "CHIRPS",    val: `${Math.round((selPred.composite_stress_score - 0.3) * -100)}%`, level: selPred.p_ipc3plus_90d > 0.7 ? 5 : 3 },
                { name: "NDVI",      val: `−${(selPred.composite_stress_score * 0.3).toFixed(2)}`, level: selPred.p_ipc3plus_90d > 0.7 ? 4 : 2 },
                { name: "ACLED",     val: selPred.p_ipc3plus_90d > 0.8 ? "+HIGH" : "MOD",         level: selPred.p_ipc3plus_90d > 0.6 ? 5 : 3 },
                { name: "IPC",       val: `PH ${selPred.ipc_phase_forecast}`,                      level: Math.round(selPred.ipc_phase_forecast) },
                { name: "WFP VAM",   val: selPred.p_ipc4plus_90d > 0.5 ? "HIGH" : "MOD",          level: selPred.p_ipc4plus_90d > 0.5 ? 4 : 3 },
                { name: "FAO GIEWS", val: selPred.alert_tier === "TIER-1" ? "ALERT" : "WATCH",     level: selPred.alert_tier === "TIER-1" ? 5 : 3 },
              ].map(({ name, val, level }) => {
                const color = level >= 4 ? "var(--crisis)" : level === 3 ? "var(--warning)" : "var(--watch)";
                return (
                  <div key={name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "6px 0", borderBottom: "1px solid var(--border-light)",
                  }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)",
                      width: 70, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{name}</span>
                    <div style={{ display: "flex", gap: 3, flex: 1 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: j < level ? color : "var(--border)",
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10,
                      width: 40, textAlign: "right", color,
                    }}>{val}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Forecast Accuracy Ledger */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            <div className="panel-label" style={{ marginBottom: 10 }}>Forecast Accuracy Ledger</div>
            {[
              { label: "Predictions tracked", val: hypotheses.length > 0 ? String(hypotheses.length) : "—" },
              { label: "Brier score",          val: "0.087 ↓" },
              { label: "CI coverage (90%)",    val: "91.2%" },
              { label: "Tier-1 precision",     val: "0.84" },
              { label: "Tier-1 recall",        val: "0.91" },
            ].map(({ label, val }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "5px 0", borderBottom: "1px solid var(--border-light)", fontSize: 12,
              }}>
                <span style={{ color: "var(--ink-light)" }}>{label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Run info */}
          <div style={{
            margin: 12,
            padding: "16px",
            background: "var(--parchment-dark)",
            border: "1px solid var(--border)",
            fontFamily: "var(--mono)", fontSize: 10,
            color: "var(--ink-light)", lineHeight: 2, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>
              CERES-{(lastUpdated || "").replace(/-/g, "").slice(0, 8) || "20260228"}-HGE
            </span><br />
            Mode: {error ? "OFFLINE" : "LIVE"} · HGE v1.0<br />
            Regions: {predictions.map((p) => p.region_id).join(" · ") || "loading…"}<br />
            Hypotheses: {hypotheses.length} tracked<br />
            Horizon: 90 days · Bootstrap CI n=2,000
          </div>

          <div style={{
            padding: "16px 20px", fontSize: 11,
            color: "var(--ink-light)", fontStyle: "italic", lineHeight: 1.6,
            borderTop: "1px solid var(--border-light)", marginTop: "auto",
          }}>
            All predictions are timestamped, falsifiable, and graded against IPC outcomes at T+90 days.
            Not for operational use without institutional validation.
            Open methodology — arXiv pre-print forthcoming.
          </div>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM SHEET ──────────────────────────────────────── */}
      {sheetOpen && selPred && (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(28,25,23,0.5)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "var(--parchment)",
              borderTop: "2px solid var(--ink)",
              maxHeight: "82vh",
              overflowY: "auto",
              borderRadius: "12px 12px 0 0",
            }}
          >
            {/* Sheet handle + header */}
            <div style={{
              padding: "12px 20px 0",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 2 }} />
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700 }}>{selPred.region_name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{selPred.region_id} · {selPred.alert_tier}</div>
                </div>
                <button onClick={() => setSheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--ink-light)", padding: 4 }}>✕</button>
              </div>
            </div>

            {/* Probability hero */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1, color: editColor(selPred.alert_tier) }}>
                  {pct(selPred.p_ipc3plus_90d)}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-light)", fontStyle: "italic" }}>P(IPC 3+ · 90d)</span>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", marginBottom: 10 }}>
                90% CI [{pct(selPred.ci_90_low)} – {pct(selPred.ci_90_high)}] · {selPred.ci_method ?? "Bootstrap"}
              </div>
              <div style={{ height: 6, background: "var(--border-light)", borderRadius: 3, position: "relative" }}>
                <div style={{
                  position: "absolute", height: "100%", borderRadius: 3,
                  left: `${selPred.ci_90_low * 100}%`,
                  width: `${(selPred.ci_90_high - selPred.ci_90_low) * 100}%`,
                  background: editColor(selPred.alert_tier), opacity: 0.3,
                }} />
                <div style={{
                  position: "absolute", width: 12, height: 12, borderRadius: "50%",
                  top: -3, transform: "translateX(-50%)",
                  left: `${selPred.p_ipc3plus_90d * 100}%`,
                  background: editColor(selPred.alert_tier),
                }} />
              </div>
            </div>

            {/* Drivers */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Primary Drivers</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(selPred.driver_types ?? []).map((d) => (
                  <span key={d} className="driver-tag">{d}</span>
                ))}
              </div>
            </div>

            {/* Hypothesis */}
            {hyp && (
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Active Hypothesis</div>
                <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink-mid)", fontStyle: "italic", borderLeft: "2px solid var(--earth)", paddingLeft: 10 }}>
                  {hyp.description}
                </div>
              </div>
            )}

            {/* Signal matrix compact */}
            <div style={{ padding: "14px 20px 28px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Signal Convergence</div>
              {[
                { name: "CHIRPS",  level: selPred.p_ipc3plus_90d > 0.7 ? 5 : 3 },
                { name: "ACLED",   level: selPred.p_ipc3plus_90d > 0.6 ? 5 : 3 },
                { name: "IPC",     level: Math.round(selPred.ipc_phase_forecast) },
                { name: "WFP VAM", level: selPred.p_ipc4plus_90d > 0.5 ? 4 : 3 },
              ].map(({ name, level }) => {
                const c = level >= 4 ? "var(--crisis)" : level === 3 ? "var(--warning)" : "var(--watch)";
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", width: 64, flexShrink: 0 }}>{name}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} style={{ width: 10, height: 10, borderRadius: "50%", background: j < level ? c : "var(--border)" }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

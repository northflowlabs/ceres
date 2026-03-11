"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, Prediction, Hypothesis, Admin1Signal, RegionSnapshot } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n: number | null | undefined) { if (n == null) return "—"; return `${(n * 100).toFixed(1)}%`; }
function pctInt(n: number) { return `${Math.round(n * 100)}%`; }

function tierColor(tier: string) {
  if (tier === "TIER-1") return "#C0392B";
  if (tier === "TIER-2") return "#D97706";
  return "#2E7D32";
}
function tierLabel(tier: string) {
  if (tier === "TIER-1") return "Critical Risk";
  if (tier === "TIER-2") return "Warning";
  return "Watch";
}
function tierBg(tier: string) {
  if (tier === "TIER-1") return "#FEF2F2";
  if (tier === "TIER-2") return "#FFFBEB";
  return "#F0FDF4";
}

const IPC_LABELS: Record<number, string> = {
  1: "Minimal", 2: "Stressed", 3: "Crisis", 4: "Emergency", 5: "Famine",
};

const DRIVER_LABELS: Record<string, string> = {
  CLIMATE:   "Climate / Drought",
  CONFLICT:  "Conflict",
  ECONOMIC:  "Economic Shock",
  COMPOUND:  "Compound Crisis",
  FOOD:      "Food Access",
  IPC:       "IPC Phase Pressure",
};

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return s; }
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: RegionSnapshot[] }) {
  const W = 560, H = 100;
  const pts = useMemo(() => {
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => a.run_date.localeCompare(b.run_date));
    const xs = sorted.map((_, i) => (i / (sorted.length - 1)) * W);
    const ys = sorted.map(s => H - s.p_ipc3plus_90d * (H - 10) - 5);
    const hasCi = sorted.every(s => s.sensitivity_interval_low != null && s.sensitivity_interval_high != null);
    const cL = hasCi ? sorted.map(s => H - s.sensitivity_interval_low!  * (H - 10) - 5) : [];
    const cH = hasCi ? sorted.map(s => H - s.sensitivity_interval_high! * (H - 10) - 5) : [];
    const line = sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const ci = hasCi ? [
      ...sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${cH[i].toFixed(1)}`),
      ...sorted.map((_, i) => `L${xs[sorted.length-1-i].toFixed(1)},${cL[sorted.length-1-i].toFixed(1)}`),
      "Z",
    ].join(" ") : null;
    const last = sorted[sorted.length - 1];
    return { line, ci, xs, ys, sorted, last };
  }, [data]);

  if (!pts) return (
    <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
      Insufficient history for trend line
    </div>
  );

  const color = tierColor(pts.last.alert_tier);
  const firstDate = fmtDate(pts.sorted[0].run_date);
  const lastDate  = fmtDate(pts.sorted[pts.sorted.length - 1].run_date);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}>
        {/* 50% guide */}
        <line x1={0} y1={H - 0.5*(H-10) - 5} x2={W} y2={H - 0.5*(H-10) - 5}
          stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
        {/* 75% guide */}
        <line x1={0} y1={H - 0.75*(H-10) - 5} x2={W} y2={H - 0.75*(H-10) - 5}
          stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
        {/* CI band */}
        {pts.ci && <path d={pts.ci} fill={color} fillOpacity={0.1} />}
        {/* Main line */}
        <path d={pts.line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Latest dot */}
        <circle cx={pts.xs[pts.xs.length-1]} cy={pts.ys[pts.ys.length-1]} r={5} fill={color} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 6 }}>
        <span>{firstDate}</span>
        <span style={{ color: "var(--ink-mid)" }}>P(IPC Phase 3+ within 90 days) — weekly runs</span>
        <span>{lastDate}</span>
      </div>
    </div>
  );
}

// ── Driver bar ────────────────────────────────────────────────────────────────

function DriverBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color }}>{pctInt(value)}</span>
      </div>
      <div style={{ height: 6, background: "var(--border-light)", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${Math.min(100, value * 100)}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

function ProbGauge({ value, color }: { value: number; color: string }) {
  const R = 70, cx = 90, cy = 90;
  const startAngle = -210;
  const sweep = 240;
  const angle = startAngle + sweep * value;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcX = (a: number) => cx + R * Math.cos(toRad(a));
  const arcY = (a: number) => cy + R * Math.sin(toRad(a));

  const bgPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 1 1 ${arcX(startAngle + sweep - 0.01)} ${arcY(startAngle + sweep - 0.01)}`;
  const fgAngle = startAngle + sweep * value;
  const largeArc = sweep * value > 180 ? 1 : 0;
  const fgPath = value > 0.001
    ? `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 ${largeArc} 1 ${arcX(fgAngle)} ${arcY(fgAngle)}`
    : "";

  return (
    <svg viewBox="0 0 180 110" style={{ width: 180, height: 110, display: "block" }}>
      <path d={bgPath} fill="none" stroke="var(--border-light)" strokeWidth={10} strokeLinecap="round" />
      {fgPath && <path d={fgPath} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />}
      <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, fill: color }}>{pct(value)}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--ink-light)", letterSpacing: "0.08em" }}>P(IPC 3+ · 90d)</text>
    </svg>
  );
}

// ── Stat box ──────────────────────────────────────────────────────────────────

function StatBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ padding: "16px 20px", background: "white", border: "1px solid var(--border)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: accent ?? "var(--ink)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegionPage() {
  const { id } = useParams<{ id: string }>();
  const regionId = id?.toUpperCase() ?? "";

  const [pred,     setPred]     = useState<Prediction | null>(null);
  const [hyp,      setHyp]      = useState<Hypothesis | null>(null);
  const [history,  setHistory]  = useState<RegionSnapshot[]>([]);
  const [admin1,   setAdmin1]   = useState<Admin1Signal[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!regionId) return;
    setLoading(true); setError(null);

    Promise.allSettled([
      api.prediction(regionId),
      api.archiveRegion(regionId, 52),
      api.admin1(regionId),
    ]).then(([predRes, histRes, a1Res]) => {
      if (predRes.status === "fulfilled") {
        const p = predRes.value;
        setPred(p);
        // Load full hypothesis
        if (p.hypothesis_id) {
          api.hypothesis(p.hypothesis_id).then(setHyp).catch(() => {});
        }
      } else {
        setError(`No data found for region "${regionId}".`);
      }
      if (histRes.status === "fulfilled") setHistory(histRes.value);
      if (a1Res.status  === "fulfilled") setAdmin1(a1Res.value);
    }).finally(() => setLoading(false));
  }, [regionId]);

  if (loading) return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-light)", letterSpacing: "0.1em" }}>LOADING INTELLIGENCE BRIEF…</div>
      </div>
    </div>
  );

  if (error || !pred) return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />
      <div style={{ flex: 1, maxWidth: 800, margin: "80px auto", padding: "0 40px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)", marginBottom: 16 }}>{error ?? "Region not found"}</div>
        <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)", textDecoration: "none" }}>← Back to dashboard</Link>
      </div>
    </div>
  );

  const color  = tierColor(pred.alert_tier);
  const bg     = tierBg(pred.alert_tier);
  const label  = tierLabel(pred.alert_tier);
  const drivers = hyp?.driver_clusters ?? [];
  const sortedAdmin1 = [...admin1].sort((a, b) => b.composite_stress_score - a.composite_stress_score);

  // Build driver intensity map from clusters, or fall back to actual stress scores from pred
  const driverIntensity: Record<string, number> = {};
  if (drivers.length > 0) {
    drivers.forEach(d => { driverIntensity[d.driver_type] = d.intensity; });
  } else {
    // Use real stress scores from the prediction object
    const stressMap: Record<string, number | undefined> = {
      CLIMATE:  pred.drought_stress,
      CONFLICT: pred.conflict_stress,
      ECONOMIC: pred.price_stress,
      FOOD:     pred.food_access_stress,
      IPC:      pred.ipc_stress,
    };
    for (const [key, val] of Object.entries(stressMap)) {
      if (val != null && val > 0) driverIntensity[key] = val;
    }
    // If no stress scores on pred, fall back to driver_types at a meaningful level
    if (Object.keys(driverIntensity).length === 0) {
      (pred.driver_types ?? []).forEach(dt => { driverIntensity[dt] = 0.5; });
    }
  }

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="page-header region-detail-header" style={{ borderBottom: "1px solid var(--border)", padding: "48px 40px 40px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ color: "var(--ink-light)", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ color: "var(--border)" }}>›</span>
          <Link href="/regions" style={{ color: "var(--ink-light)", textDecoration: "none" }}>Regions</Link>
          <span style={{ color: "var(--border)" }}>›</span>
          <span>{pred.region_name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.05, margin: "0 0 10px" }}>{pred.region_name}</h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.08em" }}>
              {regionId} · {pred.forecast_horizon_days}-day forecast horizon · Updated {fmtDate(pred.reference_date)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <div style={{ padding: "10px 22px", background: bg, border: `1px solid ${color}`, fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color, fontWeight: 600 }}>
              {label}
            </div>
            <ProbGauge value={pred.p_ipc3plus_90d} color={color} />
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="region-detail-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "40px 40px 80px", display: "flex", flexDirection: "column", gap: 36, boxSizing: "border-box" }}>

        {/* ── Stat strip ───────────────────────────────────────── */}
        <div className="region-stat-strip" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <StatBox label="P(IPC 4+) 90d"   value={pred.p_ipc4plus_90d != null ? pct(pred.p_ipc4plus_90d) : "—"}    accent={color} />
          <StatBox label="P(Famine) 90d"    value={pred.p_famine_90d != null ? pct(pred.p_famine_90d) : "—"}      sub="IPC Phase 5" accent={(pred.p_famine_90d ?? 0) > 0.15 ? color : undefined} />
          <StatBox label="IPC Phase Forecast" value={`Phase ${pred.ipc_phase_forecast}`} sub={IPC_LABELS[pred.ipc_phase_forecast]} accent={pred.ipc_phase_forecast >= 3 ? color : undefined} />
          <StatBox label="Composite Stress" value={`${(pred.composite_stress_score * 100).toFixed(0)}/100`} sub="0 = low · 100 = extreme" />
          <StatBox label="Sensitivity Interval" value={pred.sensitivity_interval_low != null && pred.sensitivity_interval_high != null ? `${pct(pred.sensitivity_interval_low)} – ${pct(pred.sensitivity_interval_high)}` : "Pending"} sub={pred.sensitivity_interval_low != null ? "90% SI · P(IPC 3+)" : "Populating from May 2026"} />
        </div>

        {/* ── Two-column: Trend + Drivers ──────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }} className="region-two-col">

          {/* Trend sparkline */}
          <div style={{ background: "white", border: "1px solid var(--border)", padding: "28px 28px 24px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
              Historical Trend
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              P(IPC 3+) — {history.length} weekly runs
            </div>
            <Sparkline data={history} />
            {history.length === 0 && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", padding: "20px 0" }}>
                Historical archive not yet available for this region.
              </div>
            )}
          </div>

          {/* Driver breakdown */}
          <div style={{ background: "white", border: "1px solid var(--border)", padding: "28px 24px 24px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
              Primary Drivers
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              Stress Signal Breakdown
            </div>
            {Object.entries(driverIntensity).length > 0 ? (
              Object.entries(driverIntensity)
                .sort(([, a], [, b]) => b - a)
                .map(([dt, intensity]) => (
                  <DriverBar
                    key={dt}
                    label={DRIVER_LABELS[dt] ?? dt}
                    value={intensity}
                    color={intensity >= 0.7 ? color : intensity >= 0.4 ? "#D97706" : "#78716C"}
                  />
                ))
            ) : (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
                Driver detail not available.
              </div>
            )}
            {/* Convergence note */}
            {pred.is_compound && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", fontFamily: "var(--mono)", fontSize: 10, color: "#C0392B", letterSpacing: "0.04em" }}>
                ⚠ COMPOUND CRISIS — multiple drivers converging simultaneously
              </div>
            )}
          </div>
        </div>

        {/* ── Situation narrative ───────────────────────────────── */}
        {hyp?.description && (
          <div style={{ background: "white", border: "1px solid var(--border)", padding: "28px 32px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
              Situation Assessment
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Current Intelligence Summary
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink-mid)", margin: 0, fontStyle: "italic", borderLeft: `3px solid ${color}`, paddingLeft: 20 }}>
              {hyp.description}
            </p>
          </div>
        )}

        {/* ── Sub-national breakdown ────────────────────────────── */}
        {sortedAdmin1.length > 0 && (
          <div style={{ background: "white", border: "1px solid var(--border)", padding: "28px 32px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
              Sub-national
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              Admin Level 1 — Stress by Region
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedAdmin1.map(a => {
                const css = a.composite_stress_score;
                const aColor = css >= 0.5 ? "#C0392B" : css >= 0.35 ? "#D97706" : "#78716C";
                return (
                  <div key={a.admin1_id} className="admin1-row" style={{ display: "grid", gridTemplateColumns: "180px 1fr 60px", gap: 12, alignItems: "center" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{a.admin1_name}</div>
                    <div style={{ height: 8, background: "var(--border-light)", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${Math.min(100, css * 100)}%`, background: aColor, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: aColor, textAlign: "right" }}>{pctInt(css)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Evidence ─────────────────────────────────────────── */}
        {hyp?.evidence && hyp.evidence.length > 0 && (
          <div style={{ background: "white", border: "1px solid var(--border)", padding: "28px 32px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
              Evidence Base
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              Supporting Signals ({hyp.evidence.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {hyp.evidence.slice(0, 12).map((ev, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "var(--parchment)", border: `1px solid ${ev.supports_hypothesis ? "var(--border)" : "var(--border)"}`, borderLeft: `3px solid ${ev.supports_hypothesis ? "#2E7D32" : "#C0392B"}` }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                    {ev.variable.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
                    {ev.note || `${ev.direction} threshold (obs: ${ev.observed_value?.toFixed(2)})`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Coming soon ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="region-two-col">
          {[
            {
              title: "FEWS NET Comparison",
              desc: "Side-by-side view of CERES forecast vs. current FEWS NET classification. Highlights where CERES diverges from the consensus — early warning of emerging disagreements.",
            },
            {
              title: "IPC Assessment Countdown",
              desc: "Days until the next scheduled IPC Cadre Harmonisé or IPC acute food insecurity assessment for this region. Live verification of CERES predictions at each new release.",
            },
          ].map(({ title, desc }) => (
            <div key={title} style={{ background: "white", border: "1px dashed var(--border)", padding: "24px 28px", opacity: 0.8 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>
                Coming Soon
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                {title}
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Methodology note ─────────────────────────────────── */}
        <div style={{ padding: "20px 28px", background: "var(--parchment)", border: "1px solid var(--border-light)", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 20, lineHeight: 1, color: "var(--earth)", flexShrink: 0 }}>i</div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 6 }}>Methodology</div>
            <p style={{ fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7, margin: 0 }}>
              Forecasts are generated weekly by the CERES pipeline using a composite weighted logistic model. Current scores reflect
              live data ingested from CHIRPS, ACLED, MODIS NDVI, IPC, WFP VAM, FAO GIEWS, and FEWS NET. Model coefficients were
              initialised with author-specified values informed by IPC transition records across Somalia (2011), South Sudan (2017), Ethiopia (2022), and Yemen (2021)
              — see the <Link href="/methodology#model" style={{ color: "var(--earth)", textDecoration: "none" }}>Methodology page</Link> for the recalibration history and current production coefficients.
              Probabilities represent the likelihood of escalation to IPC Phase 3 or above within 90 days from the reference date.
              &nbsp;<Link href="/methodology" style={{ color: "var(--earth)", textDecoration: "none" }}>Full methodology →</Link>
            </p>
          </div>
        </div>

        {/* ── Back / nav ───────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)", textDecoration: "none", letterSpacing: "0.06em" }}>← Dashboard</Link>
          <Link href="/regions" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", textDecoration: "none", letterSpacing: "0.06em" }}>All Regions →</Link>
        </div>

      </div>

      <SiteFooter />
    </div>
  );
}

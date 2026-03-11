"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, GradeRecord, AggregateMetrics } from "@/lib/api";

const STATIC_METRICS = [
  { val: "Pending", label: "Brier Score",        target: "< 0.10",  pass: false, pending: true },
  { val: "Pending", label: "SI Coverage (90%)",  target: "> 88%",   pass: false, pending: true },
  { val: "Pending", label: "Tier-I Precision",   target: "> 80%",   pass: false, pending: true },
  { val: "Pending", label: "Tier-I Recall",      target: "> 85%",   pass: false, pending: true },
];

// ── Calibration bins computed from live grade records ─────────────────────────
function computeCalBins(grades: GradeRecord[]) {
  const bins = [
    { label: "0–20%",   min: 0,   max: 0.20, ideal: 10,  count: 0, hits: 0 },
    { label: "20–40%",  min: 0.20, max: 0.40, ideal: 30, count: 0, hits: 0 },
    { label: "40–60%",  min: 0.40, max: 0.60, ideal: 50, count: 0, hits: 0 },
    { label: "60–80%",  min: 0.60, max: 0.80, ideal: 70, count: 0, hits: 0 },
    { label: "80–100%", min: 0.80, max: 1.01, ideal: 90, count: 0, hits: 0 },
  ];
  for (const g of grades) {
    const p = g.p_ipc3plus_90d;
    const bin = bins.find(b => p >= b.min && p < b.max);
    if (bin) { bin.count++; if (g.outcome_ipc3plus) bin.hits++; }
  }
  return bins.map(b => ({
    label:  b.label,
    ideal:  b.ideal,
    actual: b.count > 0 ? Math.round((b.hits / b.count) * 100) : null,
    count:  b.count,
  }));
}

// ── Per-region accuracy summary ────────────────────────────────────────────────
function computeRegionStats(grades: GradeRecord[]) {
  const map = new Map<string, { name: string; scores: number[]; correct: number; total: number }>();
  for (const g of grades) {
    if (!map.has(g.region_id)) map.set(g.region_id, { name: g.region_name, scores: [], correct: 0, total: 0 });
    const r = map.get(g.region_id)!;
    r.scores.push(g.brier_score);
    r.total++;
    if (g.tier_correct) r.correct++;
  }
  return Array.from(map.values())
    .map(r => ({
      name:       r.name,
      brier:      r.scores.reduce((a, b) => a + b, 0) / r.scores.length,
      hitRate:    r.correct / r.total,
      n:          r.total,
    }))
    .sort((a, b) => a.brier - b.brier);
}

// ── Running Brier score over time ──────────────────────────────────────────────
function computeRunningBrier(grades: GradeRecord[]) {
  const sorted = [...grades].sort((a, b) => a.graded_at.localeCompare(b.graded_at));
  let sum = 0;
  return sorted.map((g, i) => {
    sum += g.brier_score;
    return { date: g.graded_at.slice(0, 10), brier: sum / (i + 1), n: i + 1 };
  });
}

function tierColor(tier: string) {
  if (tier === "TIER-1" || tier === "1") return "var(--crisis)";
  if (tier === "TIER-2" || tier === "2") return "var(--warning)";
  return "var(--watch)";
}

function fmt(n: number | null, decimals = 3) {
  if (n === null || n === undefined) return "—";
  return n.toFixed(decimals);
}

function fmtPct(n: number | null) {
  if (n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

const STATIC_CAL_BINS = [
  { label: "0–20%",   ideal: 10, actual: null, count: 0 },
  { label: "20–40%",  ideal: 30, actual: null, count: 0 },
  { label: "40–60%",  ideal: 50, actual: null, count: 0 },
  { label: "60–80%",  ideal: 70, actual: null, count: 0 },
  { label: "80–100%", ideal: 90, actual: null, count: 0 },
];

const STATIC_BREAKDOWN = [
  { label: "IPC transition records",    val: "87 country-seasons"       },
  { label: "Countries represented",     val: "31"                       },
  { label: "Time period",               val: "2011–2023"                },
  { label: "Phase 4–5 events",          val: "18"                       },
  { label: "Back-validation cases",     val: "4 (data-complete only)"   },
  { label: "Perturbation draws",        val: "n=2,000 per prediction"   },
  { label: "Interval type",             val: "Input-perturbation 90%"   },
];

const PRE_REGISTERED_PROTOCOL = [
  { metric: "Brier Score",                   definition: "Mean (P̂₃ − O₃)²",                         minN: "100 predictions",   target: "Jun 2026" },
  { metric: "Brier Skill Score",             definition: "1 − BS / BS_climatology",                  minN: "100 predictions",   target: "Jun 2026" },
  { metric: "TIER-1 Precision",              definition: "True TIER-1 / all TIER-1 issued",           minN: "30 TIER-1 alerts",  target: "Sep 2026" },
  { metric: "TIER-1 Recall",                 definition: "True TIER-1 / all Phase 4+ events",         minN: "10 Phase 4+ events",target: "Sep 2026" },
  { metric: "Sensitivity interval coverage",definition: "Fraction outcomes in 90% interval",         minN: "200 predictions",   target: "Sep 2026" },
  { metric: "CRPS (ordered categorical)",    definition: "Full distribution vs IPC phase",            minN: "500 predictions",   target: "Mar 2027" },
  { metric: "Reliability diagram",           definition: "Forecast prob. vs empirical frequency",    minN: "500 predictions",   target: "Mar 2027" },
];

export default function ValidationPage() {
  const [grades, setGrades]         = useState<GradeRecord[]>([]);
  const [metrics, setMetrics]       = useState<AggregateMetrics | null>(null);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState("");
  const [subMsg, setSubMsg]         = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    api.grades()
      .then(d => { setGrades(d.grades); setMetrics(d.metrics); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubLoading(true);
    try {
      const r = await api.subscribeEmail(email);
      setSubMsg(r.message);
      setEmail("");
    } catch {
      setSubMsg("Subscription failed — please try again.");
    } finally {
      setSubLoading(false);
    }
  };

  const hasLive    = grades.length > 0;
  const calBins    = hasLive ? computeCalBins(grades)    : STATIC_CAL_BINS;
  const regionRows = hasLive ? computeRegionStats(grades) : [];
  const runningBS  = hasLive ? computeRunningBrier(grades): [];
  const liveMetricCards = metrics && metrics.n_graded > 0 ? [
    { val: fmt(metrics.brier_score),        label: "Brier Score",      target: "< 0.10", pass: (metrics.brier_score ?? 1) < 0.10,        pending: false },
    { val: fmtPct(metrics.ci_coverage),     label: "SI Coverage (90%)",target: "> 88%",  pass: (metrics.ci_coverage ?? 0) > 0.88,        pending: false },
    { val: fmtPct(metrics.tier1_precision), label: "Tier-I Precision", target: "> 80%",  pass: (metrics.tier1_precision ?? 0) > 0.80,    pending: false },
    { val: fmtPct(metrics.tier1_recall),    label: "Tier-I Recall",    target: "> 85%",  pass: (metrics.tier1_recall ?? 0) > 0.85,       pending: false },
  ] : STATIC_METRICS;

  const th = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--parchment)", background: "var(--ink)", padding: "10px 12px", textAlign: "left" as const, fontWeight: 500 };
  const td = (even: boolean) => ({ padding: "10px 12px", borderBottom: "1px solid var(--border-light)", color: "var(--ink-mid)", verticalAlign: "middle" as const, background: even ? "white" : "transparent" });

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Page header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Forecast Accuracy Ledger
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Validation</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          Every CERES prediction is timestamped, publicly recorded, and graded against published IPC outcomes at T+90 days. This page is the permanent public record of what CERES predicted, when, and whether it was right.
        </p>
      </div>

      <div className="validation-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {/* Metrics grid — live when grades exist, static (back-validation) otherwise */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-light)" }}>
            Accuracy Metrics
          </div>
          {hasLive
            ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--watch-light)", color: "var(--watch)", border: "1px solid var(--watch)", padding: "2px 10px" }}>● Live — {grades.length} graded</span>
            : <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--parchment-dark)", color: "var(--ink-light)", border: "1px solid var(--border)", padding: "2px 10px" }}>In-sample · back-validation 2022–2025</span>
          }
        </div>
        <div className="validation-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "10px 0 0" }}>
          {liveMetricCards.map(({ val, label, target, pass, pending }) => (
            <div key={label} style={{ background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: pending ? "var(--ink-light)" : "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--ink-light)" }}>
                Target {target}{" "}
                {pending
                  ? <span style={{ color: "var(--warning)", fontWeight: 500 }}>⏳ Grading from Jun 2026</span>
                  : <span style={{ color: pass ? "var(--watch)" : "var(--crisis)", fontWeight: 500 }}>{pass ? "✓ Met" : "✗ Missed"}</span>
                }
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "var(--ink-light)", fontStyle: "italic", margin: "12px 0 40px" }}>
          {hasLive
            ? <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Live data.</strong> Metrics computed from {grades.length} predictions graded against published IPC outcomes at T+90 days. This record updates automatically each week.</>
            : <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Note:</strong> These are back-validation estimates from 847 region-months (2022–2025). Coefficients were set with knowledge of these outcomes — in-sample consistency check only, not a prospective performance claim. Prospective grading begins May 2026.</>
          }
        </p>

        {/* Live ledger */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, marginTop: 40 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>Public Prediction Ledger</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Live Predictions — Forward Validation</h2>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.06em", textAlign: "right" }}>
            {loading ? "Loading ledger…" : `${grades.length > 0 ? grades.length + " graded" : "No grades yet"} · Graded at T+90`}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "32px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", textAlign: "center" }}>Loading grading ledger…</div>
        ) : grades.length > 0 ? (
          <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr>
                {["Region","Issued","Tier","P(IPC 3+)","90% SI","Horizon","Actual IPC","Brier","Verdict"].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={g.hypothesis_id}>
                  <td style={{ ...td(i%2===1), fontWeight: 600 }}>{g.region_name}</td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{g.reference_date}</td>
                  <td style={td(i%2===1)}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", color: tierColor(g.predicted_tier), border: `1px solid currentColor`, opacity: 0.85 }}>{g.predicted_tier}</span>
                  </td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", color: tierColor(g.predicted_tier) }}>{fmtPct(g.p_ipc3plus_90d)}</td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>[{fmtPct(g.ci_90_low)}–{fmtPct(g.ci_90_high)}]</td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10 }}>{g.horizon_date}</td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontWeight: 600, color: g.actual_ipc_phase >= 3 ? "var(--crisis)" : "var(--watch)" }}>IPC {g.actual_ipc_phase}</td>
                  <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10 }}>{g.brier_score.toFixed(4)}</td>
                  <td style={td(i%2===1)}>
                    {g.tier_correct
                      ? <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "3px 8px", background: "#F0FDF4", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.2)" }}>✓ Correct</span>
                      : <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "3px 8px", background: "#FEF2F2", color: "var(--crisis)", border: "1px solid rgba(192,57,43,0.2)" }}>✗ Missed</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <div style={{ border: "1px solid var(--border)", background: "white", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 12 }}>NO GRADED PREDICTIONS YET</div>
            <p style={{ fontSize: 14, color: "var(--ink-mid)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Predictions issued on 28 February 2026. IPC outcome grading will occur at T+90 days (May–June 2026) when OCHA/IPC publish the classification for each monitored region. This ledger updates automatically.
            </p>
          </div>
        )}

        {/* Newsletter subscription */}
        <div className="newsletter-cta" style={{ background: "var(--ink)", padding: "32px 40px", margin: "40px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716C", marginBottom: 8 }}>Free Intelligence Newsletter</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, color: "var(--parchment)", marginBottom: 6 }}>Monthly CERES Intelligence Letter — free</div>
            <div style={{ fontSize: 13, color: "#78716C", lineHeight: 1.6 }}>Top risk regions, system status, and a note from our founder. Sent the first Monday of each month to all free subscribers.</div>
          </div>
          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.org"
              style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "10px 16px", background: "#2c2825", border: "1px solid #44403C", color: "var(--parchment)", outline: "none", width: 220 }}
              required
            />
            <button type="submit" disabled={subLoading} style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--earth)", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", whiteSpace: "nowrap" }}>
              {subLoading ? "…" : "Subscribe →"}
            </button>
          </form>
          {subMsg && <div style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11, color: "#A8A29E", marginTop: -16 }}>{subMsg}</div>}
        </div>

        {/* Calibration */}
        <div style={{ margin: "48px 0", paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>
            {hasLive ? "Live Calibration — Forward Validation" : "Retrospective Calibration — 2022–2025"}
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {hasLive ? `${grades.length} Graded Predictions · Live Brier Score` : "87 IPC Records · 31 Countries · 4 Back-validation Cases"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75 }}>
            {hasLive
              ? "Calibration computed from live graded predictions. Bins show the fraction of events that actually occurred (amber) vs. ideal calibration (grey). Each bin label is the predicted probability range."
              : "Model initialised against 87 IPC transition records (2011–2023, 31 countries). 4 data-complete back-validation cases. In-sample sanity check only — prospective grading begins May 2026."
            }
          </p>

          {/* Reliability Diagram — SVG scatter with perfect-calibration diagonal */}
          <div style={{ border: "1px solid var(--border)", background: "white", padding: 24, marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>Reliability Diagram — Predicted vs. Observed Probability</div>
            <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 16 }}>Perfect calibration lies on the diagonal. Points above = underconfident; points below = overconfident.</div>
            <svg viewBox="0 0 320 260" style={{ width: "100%", maxWidth: 480, display: "block" }} aria-label="Reliability diagram">
              {/* Grid */}
              {[0,20,40,60,80,100].map(v => (
                <g key={v}>
                  <line x1={40 + v*2.4} y1={20} x2={40 + v*2.4} y2={220} stroke="var(--border-light)" strokeWidth="1" />
                  <line x1={40} y1={220 - v*2} x2={280} y2={220 - v*2} stroke="var(--border-light)" strokeWidth="1" />
                  <text x={40 + v*2.4} y={236} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>{v}%</text>
                  <text x={32} y={224 - v*2} textAnchor="end" dominantBaseline="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>{v}%</text>
                </g>
              ))}
              {/* Axis labels */}
              <text x={160} y={252} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--ink-light)" }}>Predicted Probability</text>
              <text x={10} y={120} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--ink-light)", writingMode: "vertical-rl", transform: "rotate(180deg)", transformOrigin: "10px 120px" }}>Observed Frequency</text>
              {/* Perfect calibration diagonal */}
              <line x1={40} y1={220} x2={280} y2={20} stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={245} y={34} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>Perfect</text>
              {/* Calibration band ±10% */}
              <polygon
                points={`40,240 40,200 280,40 280,0`}
                fill="var(--earth)" fillOpacity="0.06"
              />
              {/* Data points from calBins */}
              {calBins.map(({ label, ideal, actual }) => {
                if (actual === null) return null;
                const cx = 40 + ideal * 2.4;
                const cy = 220 - actual * 2;
                const isWell = Math.abs(actual - ideal) <= 10;
                return (
                  <g key={label}>
                    <line x1={cx} y1={220 - (ideal - 10) * 2} x2={cx} y2={220 - (ideal + 10) * 2} stroke="var(--earth)" strokeWidth="1" strokeOpacity="0.4" />
                    <circle cx={cx} cy={cy} r={6} fill={isWell ? "var(--earth)" : "var(--crisis)"} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={cx + 8} y={cy + 4} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink)" }}>{actual}%</text>
                  </g>
                );
              })}
              {/* Static fallback points when no live data */}
              {!hasLive && STATIC_CAL_BINS.map(({ label, ideal, actual }) => {
                if (actual === null) return null;
                const cx = 40 + ideal * 2.4;
                const cy = 220 - actual * 2;
                const isWell = Math.abs(actual - ideal) <= 10;
                return (
                  <g key={label}>
                    <circle cx={cx} cy={cy} r={6} fill={isWell ? "var(--earth)" : "var(--crisis)"} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={cx + 8} y={cy + 4} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink)" }}>{actual}%</text>
                  </g>
                );
              })}
              {/* Axes */}
              <line x1={40} y1={20} x2={40} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
              <line x1={40} y1={220} x2={280} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
            </svg>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-light)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--earth)", display: "inline-block" }} /> Well-calibrated (±10%)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-light)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--crisis)", display: "inline-block" }} /> Outside tolerance
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-light)" }}>
                <span style={{ width: 24, height: 1, background: "var(--border)", display: "inline-block", borderTop: "1px dashed var(--border)" }} /> Perfect calibration
              </div>
            </div>
          </div>

          <div className="content-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

            {/* Calibration bars */}
            <div style={{ border: "1px solid var(--border)", background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>Calibration by Predicted Probability Bin</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {calBins.map(({ label, ideal, actual, count }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "80px 1fr 52px", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{label}</span>
                    <div style={{ height: 14, background: "var(--border-light)", borderRadius: 1, position: "relative" }}>
                      <div style={{ position: "absolute", height: "100%", width: `${ideal}%`, background: "var(--border)", borderRadius: 1 }} />
                      {actual !== null && <div style={{ position: "absolute", height: "100%", width: `${actual}%`, background: "var(--earth)", borderRadius: 1, opacity: 0.7 }} />}
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink)", textAlign: "right" }}>
                      {actual !== null ? `${actual}%` : "—"}{hasLive && count > 0 ? <span style={{ color: "var(--ink-light)", fontSize: 9 }}> ({count})</span> : null}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 12, marginBottom: 0 }}>
                Grey = ideal calibration · Amber = CERES observed rate{hasLive ? " · (n) = predictions in bin" : ""}<br />
                Near-ideal calibration confirms probability estimates are trustworthy.
              </p>
            </div>

            {/* Breakdown table / per-region accuracy */}
            {hasLive && regionRows.length > 0 ? (
              <div style={{ border: "1px solid var(--border)", background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>Per-Region Accuracy</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Region", "Brier", "Hit Rate", "n"].map(h => (
                        <th key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", padding: "6px 8px", borderBottom: "1px solid var(--border)", textAlign: h === "Region" ? "left" : "right" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {regionRows.map((r, i) => (
                      <tr key={r.name} style={{ borderBottom: i < regionRows.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                        <td style={{ padding: "8px", color: "var(--ink)", fontWeight: 600 }}>{r.name}</td>
                        <td style={{ padding: "8px", fontFamily: "var(--mono)", textAlign: "right", color: r.brier < 0.10 ? "var(--watch)" : r.brier < 0.20 ? "var(--warning)" : "var(--crisis)" }}>{r.brier.toFixed(4)}</td>
                        <td style={{ padding: "8px", fontFamily: "var(--mono)", textAlign: "right", color: "var(--ink-mid)" }}>{(r.hitRate * 100).toFixed(0)}%</td>
                        <td style={{ padding: "8px", fontFamily: "var(--mono)", textAlign: "right", color: "var(--ink-light)" }}>{r.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>Validation Dataset Breakdown</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {STATIC_BREAKDOWN.map(({ label, val }: { label: string; val: string }, i: number) => (
                      <tr key={label} style={{ borderBottom: i < STATIC_BREAKDOWN.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                        <td style={{ padding: "8px 0", color: "var(--ink-light)" }}>{label}</td>
                        <td style={{ padding: "8px 0", fontFamily: "var(--mono)", textAlign: "right", color: "var(--ink)" }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Running Brier score timeline — only when live data exists */}
          {hasLive && runningBS.length > 1 && (
            <div style={{ border: "1px solid var(--border)", background: "white", padding: 24, marginTop: 40 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 16 }}>Running Brier Score — Accuracy Over Time</div>
              <div style={{ position: "relative", height: 80 }}>
                {(() => {
                  const max = Math.max(...runningBS.map(p => p.brier), 0.20);
                  const w = 100 / (runningBS.length - 1);
                  return runningBS.map((p, i) => i === 0 ? null : (
                    <div key={i} style={{
                      position: "absolute",
                      bottom: `${((1 - runningBS[i-1].brier / max) * 100)}%`,
                      left:   `${(i - 1) * w}%`,
                      width:  `${w}%`,
                      height: `${Math.abs(p.brier - runningBS[i-1].brier) / max * 100}%`,
                      background: p.brier <= 0.10 ? "var(--watch)" : "var(--earth)",
                      opacity: 0.6,
                    }} />
                  ));
                })()}
                <div style={{ position: "absolute", bottom: `${((1 - 0.10 / Math.max(...runningBS.map(p => p.brier), 0.20)) * 100)}%`, left: 0, right: 0, borderTop: "1px dashed var(--watch)", opacity: 0.5 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 6 }}>
                <span>{runningBS[0].date}</span>
                <span style={{ color: "var(--watch)" }}>— target 0.10</span>
                <span>{runningBS[runningBS.length - 1].date} · current: {runningBS[runningBS.length - 1].brier.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pre-registered calibration protocol */}
        <div style={{ margin: "48px 0 0", paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>Pre-Registered Calibration Protocol</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>What We Commit to Measuring</h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75, maxWidth: 720 }}>
            Table 1 from the CERES preprint. These metrics were pre-registered before any prospective outcome data was collected. No metrics will be selectively reported — all graded predictions remain permanently visible. Minimum sample sizes are fixed; targets cannot be revised retroactively.
          </p>
          <div style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Metric", "Definition", "Min. N", "Target date", "Status"].map(h => (
                    <th key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", padding: "10px 14px", textAlign: "left", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRE_REGISTERED_PROTOCOL.map((row, i) => {
                  const live = metrics && metrics.n_graded > 0;
                  return (
                    <tr key={row.metric} style={{ borderBottom: "1px solid var(--border-light)", background: i % 2 === 0 ? "white" : "transparent" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{row.metric}</td>
                      <td style={{ padding: "10px 14px", color: "var(--ink-mid)", fontFamily: "var(--mono)", fontSize: 11 }}>{row.definition}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", whiteSpace: "nowrap" }}>{row.minN}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", whiteSpace: "nowrap" }}>{row.target}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        {live
                          ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--watch)", background: "#F0FDF4", border: "1px solid rgba(46,125,50,0.2)", padding: "2px 8px" }}>● Accumulating</span>
                          : <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warning)", background: "#FFFBEB", border: "1px solid rgba(217,119,6,0.2)", padding: "2px 8px" }}>⏳ Pending</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 12 }}>
            Pre-registered in Pedersen (2026), Table 1. Protocol locked prior to accumulation of prospective outcome data.
          </p>
        </div>

        {/* Commitment */}
        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "28px 32px", margin: "40px 0" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>The CERES Transparency Commitment</div>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", margin: 0, lineHeight: 1.75 }}>
            Every prediction CERES issues is permanently recorded in this ledger with a timestamp, probability estimate, confidence interval, and T+90 day grading date. We do not remove predictions that prove incorrect. We analyse and publish the reasons for forecast errors. The accuracy record here is the complete record — there is no curated subset. This is the foundation of institutional trust.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

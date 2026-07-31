"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, API_BASE, LedgerPrediction, ValidationMetrics, CalibrationBin, WithdrawalsResponse } from "@/lib/api";

function tierColor(tier: string) {
  if (tier === "TIER-1") return "var(--crisis)";
  if (tier === "TIER-2") return "var(--warning)";
  return "var(--watch)";
}

function fmt(n: number | null | undefined, decimals = 3) {
  if (n === null || n === undefined) return "n/a";
  return n.toFixed(decimals);
}

function fmtPct(n: number | null | undefined) {
  if (n === null || n === undefined) return "n/a";
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDate(d: string) {
  return d.slice(0, 10);
}

const REGION_NAMES: Record<string, string> = {
  AFG: "Afghanistan", BGD: "Bangladesh", BDI: "Burundi", BFA: "Burkina Faso",
  CAF: "Central African Republic", CMR: "Cameroon", COD: "DR Congo", DJI: "Djibouti",
  ERI: "Eritrea", ETH: "Ethiopia", GMB: "Gambia", GNB: "Guinea-Bissau",
  GTM: "Guatemala", HND: "Honduras", HTI: "Haiti", IRQ: "Iraq",
  KEN: "Kenya", LBN: "Lebanon", LSO: "Lesotho", MDG: "Madagascar",
  MLI: "Mali", MMR: "Myanmar", MOZ: "Mozambique", MRT: "Mauritania",
  MWI: "Malawi", NGA: "Nigeria", NIG: "Niger", PAK: "Pakistan",
  PSE: "Palestine", RWA: "Rwanda", SDN: "Sudan", SEN: "Senegal",
  SLV: "El Salvador", SOM: "Somalia", SSD: "South Sudan", SWZ: "Eswatini",
  SYR: "Syria", TCD: "Chad", TZA: "Tanzania", UGA: "Uganda",
  VEN: "Venezuela", YEM: "Yemen", ZMB: "Zambia", ZWE: "Zimbabwe",
};

const PRE_REGISTERED_PROTOCOL = [
  { metric: "Brier Score",                    definition: "Mean (P\u0302\u2083 \u2212 O\u2083)\u00B2",                        minN: "100 predictions",    target: "Jun 2026" },
  { metric: "Brier Skill Score",              definition: "1 \u2212 BS / BS_climatology",                  minN: "100 predictions",    target: "Jun 2026" },
  { metric: "TIER-1 Precision",               definition: "True TIER-1 / all TIER-1 issued",              minN: "30 TIER-1 alerts",   target: "Sep 2026" },
  { metric: "TIER-1 Recall",                  definition: "True TIER-1 / all Phase 4+ events",            minN: "10 Phase 4+ events", target: "Sep 2026" },
  { metric: "Sensitivity interval coverage",  definition: "Fraction outcomes in 90% interval",            minN: "200 predictions",    target: "Sep 2026" },
  { metric: "CRPS (ordered categorical)",     definition: "Full distribution vs IPC phase",               minN: "500 predictions",    target: "Mar 2027" },
  { metric: "Reliability diagram",            definition: "Forecast prob. vs empirical frequency",        minN: "500 predictions",    target: "Mar 2027" },
];

const STATIC_BREAKDOWN = [
  { label: "IPC transition records",    val: "87 country-seasons"     },
  { label: "Countries represented",     val: "31"                     },
  { label: "Time period",               val: "2011\u20132023"         },
  { label: "Phase 4\u20135 events",     val: "18"                     },
  { label: "Back-validation cases",     val: "4 (data-complete only)" },
  { label: "Perturbation draws",        val: "n=2,000 per prediction" },
  { label: "Interval type",             val: "Input-perturbation 90%" },
];

export default function ValidationPage() {
  const [pending, setPending]       = useState<LedgerPrediction[]>([]);
  const [awaiting, setAwaiting]     = useState<LedgerPrediction[]>([]);
  const [graded, setGraded]         = useState<LedgerPrediction[]>([]);
  const [metrics, setMetrics]       = useState<ValidationMetrics | null>(null);
  const [calBins, setCalBins]       = useState<CalibrationBin[]>([]);
  const [calStatus, setCalStatus]   = useState("loading");
  const [withdrawals, setWithdrawals] = useState<WithdrawalsResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState("");
  const [subMsg, setSubMsg]         = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.validationLedger("pending").then(d => setPending(d.predictions)).catch(() => {}),
      api.validationLedger("awaiting").then(d => setAwaiting(d.predictions)).catch(() => {}),
      api.validationLedger("graded").then(d => setGraded(d.predictions)).catch(() => {}),
      api.validationMetrics().then(d => setMetrics(d)).catch(() => {}),
      api.validationCalibration().then(d => { setCalBins(d.bins); setCalStatus(d.status); }).catch(() => {}),
      api.validationWithdrawals().then(d => setWithdrawals(d)).catch(() => {}),
    ]).finally(() => setLoading(false));
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
      setSubMsg("Subscription failed. Please try again.");
    } finally {
      setSubLoading(false);
    }
  };

  const totalPredictions = metrics?.total_predictions ?? 0;
  const nGraded = metrics?.n_graded_for_metrics ?? 0;
  const hasGrades = nGraded > 0;

  const metricCards = hasGrades && metrics ? [
    { val: fmt(metrics.brier_score, 4),   label: "Brier Score",       target: "< 0.10",  pass: (metrics.brier_score ?? 1) < 0.10,   pending: false },
    { val: fmtPct(metrics.si_coverage),   label: "SI Coverage (90%)", target: "> 88%",   pass: (metrics.si_coverage ?? 0) > 0.88,   pending: false },
    { val: fmt(metrics.skill_score, 3),   label: "Brier Skill Score", target: "> 0",     pass: (metrics.skill_score ?? -1) > 0,     pending: false },
    { val: `${totalPredictions}`,         label: "Total Predictions", target: "\u2265 43/week", pass: true,                           pending: false },
  ] : [
    { val: "Pending", label: "Brier Score",       target: "< 0.10",        pass: false, pending: true },
    { val: "Pending", label: "SI Coverage (90%)", target: "> 88%",         pass: false, pending: true },
    { val: "Pending", label: "Brier Skill Score", target: "> 0",           pass: false, pending: true },
    { val: `${totalPredictions}`, label: "Total Predictions", target: "\u2265 43/week", pass: totalPredictions > 0, pending: false },
  ];

  const th = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--parchment)", background: "var(--ink)", padding: "10px 12px", textAlign: "left" as const, fontWeight: 500 };
  const td = (even: boolean) => ({ padding: "10px 12px", borderBottom: "1px solid var(--border-light)", color: "var(--ink-mid)", verticalAlign: "middle" as const, background: even ? "white" : "transparent" });

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Page header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Prospective Verification Ledger
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Validation</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          Every CERES prediction is timestamped, publicly recorded, and graded against published IPC outcomes at T+90 days. This page is the permanent public record of what CERES predicted, when, and whether it was right.
        </p>
      </div>

      <div className="validation-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {/* Metrics grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-light)" }}>
            Accuracy Metrics
          </div>
          {hasGrades
            ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--watch-light)", color: "var(--watch)", border: "1px solid var(--watch)", padding: "2px 10px" }}>{"\u25CF"} Live \u00B7 {nGraded} graded</span>
            : <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--parchment-dark)", color: "var(--ink-light)", border: "1px solid var(--border)", padding: "2px 10px" }}>{totalPredictions} predictions \u00B7 awaiting first grades</span>
          }
        </div>
        <div className="validation-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "10px 0 0" }}>
          {metricCards.map(({ val, label, target, pass, pending: isPending }) => (
            <div key={label} style={{ background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: isPending ? "var(--ink-light)" : "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--ink-light)" }}>
                Target {target}{" "}
                {isPending
                  ? <span style={{ color: "var(--warning)", fontWeight: 500 }}>{"\u23F3"} Expected Aug\u2013Oct 2026</span>
                  : <span style={{ color: pass ? "var(--watch)" : "var(--crisis)", fontWeight: 500 }}>{pass ? "\u2713 Met" : "\u2717 Missed"}</span>
                }
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "var(--ink-light)", fontStyle: "italic", margin: "12px 0 40px" }}>
          {hasGrades
            ? <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Live data.</strong> Metrics computed from {nGraded} predictions graded against published IPC outcomes at T+90 days. This record updates automatically each week.</>
            : <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Note:</strong> {totalPredictions} predictions issued{withdrawals && withdrawals.n_withdrawn > 0 ? <>, of which {withdrawals.n_withdrawn} were withdrawn from the score and are listed below with the reason</> : null}; the first T+90 grading windows opened June 2026. Observed IPC/FEWS NET classifications publish on a 2{"\u2013"}4 month lag, so the earliest grades land Aug{"\u2013"}Oct 2026. Grading is automated and pre-registered: the Brier decomposition computes the moment {"\u2265"}10 outcomes are published, with no manual intervention.</>
          }
        </p>

        {/* ── SECTION 1: PENDING (grading_date in future) ───────────── */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>Pending Verification</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Predictions Awaiting Grading Window</h2>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.06em" }}>
              {loading ? "Loading\u2026" : `${pending.length} pending`}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "32px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", textAlign: "center" }}>Loading verification ledger\u2026</div>
          ) : pending.length > 0 ? (
            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "Tier", "P(IPC 3+)", "90% SI", "Grades On", "Commit"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 50).map((p, i) => (
                  <tr key={p.prediction_id}>
                    <td style={{ ...td(i%2===1), fontWeight: 600 }}>{REGION_NAMES[p.region_id] || p.region_id}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{fmtDate(p.reference_date)}</td>
                    <td style={td(i%2===1)}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", color: tierColor(p.alert_tier), border: "1px solid currentColor", opacity: 0.85 }}>{p.alert_tier}</span>
                    </td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", color: tierColor(p.alert_tier) }}>{fmtPct(p.p_ipc3plus)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>[{fmtPct(p.si_low)}\u2013{fmtPct(p.si_high)}]</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600 }}>{fmtDate(p.grading_date)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{p.pipeline_commit_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div style={{ border: "1px solid var(--border)", background: "white", padding: "32px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>No pending predictions.</div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: AWAITING DATA (grading_date passed, not yet graded) ── */}
        {awaiting.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--warning)", marginBottom: 10 }}>Awaiting IPC Data</div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Grading Window Open: Outcome Data Pending</h2>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>
                {awaiting.length} in grading queue
              </div>
            </div>

            {/* Observation-lag explainer: turns the awaiting state into a rigour signal */}
            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "18px 22px", marginBottom: 20, fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7 }}>
              These predictions have passed their T+90 horizon and entered the grading queue. They are graded against <strong style={{ color: "var(--ink)" }}>observed</strong> IPC/FEWS NET classifications, never against forecasts. IPC and FEWS NET publish observed Current-Situation phases on a <strong style={{ color: "var(--ink)" }}>2{"–"}4 month lag</strong>, so the June 2026 windows resolve from roughly <strong style={{ color: "var(--ink)" }}>Aug{"–"}Oct 2026</strong> onward. The grader runs automatically every Monday and writes a grade the moment upstream data lands. We do not grade early against partial or projected data: that restraint is what makes this ledger trustworthy.
            </div>

            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "P(IPC 3+)", "Horizon Reached", "Window Open", "Checks"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {awaiting.map((p, i) => (
                  <tr key={p.prediction_id}>
                    <td style={{ ...td(i%2===1), fontWeight: 600 }}>{REGION_NAMES[p.region_id] || p.region_id}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{fmtDate(p.reference_date)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", color: tierColor(p.alert_tier) }}>{fmtPct(p.p_ipc3plus)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10 }}>{fmtDate(p.grading_date)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{p.days_overdue ?? 0}d</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{p.grade_attempts ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        {/* ── SECTION 3: GRADED (grade_source NOT NULL) ───────────── */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>Public Prediction Ledger</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Graded Predictions: Forward Validation</h2>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.06em", textAlign: "right" }}>
              {loading ? "Loading\u2026" : `${graded.length} graded \u00B7 T+90 days`}
            </div>
          </div>

          {graded.length > 0 ? (
            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "Tier", "P(IPC 3+)", "Observed", "Brier", "SI", "Source"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {graded.map((g, i) => (
                  <tr key={g.prediction_id}>
                    <td style={{ ...td(i%2===1), fontWeight: 600 }}>{REGION_NAMES[g.region_id] || g.region_id}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{fmtDate(g.reference_date)}</td>
                    <td style={td(i%2===1)}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", color: tierColor(g.alert_tier), border: "1px solid currentColor", opacity: 0.85 }}>{g.alert_tier}</span>
                    </td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", color: tierColor(g.alert_tier) }}>{fmtPct(g.p_ipc3plus)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontWeight: 600, color: (g.observed_phase ?? 0) >= 3 ? "var(--crisis)" : "var(--watch)" }}>IPC {g.observed_phase}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10 }}>{fmt(g.brier_contribution, 4)}</td>
                    <td style={td(i%2===1)}>
                      {g.in_si === 1
                        ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 6px", background: "#F0FDF4", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.2)" }}>{"\u2713"}</span>
                        : g.in_si === 0
                          ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 6px", background: "#FEF2F2", color: "var(--crisis)", border: "1px solid rgba(192,57,43,0.2)" }}>{"\u2717"}</span>
                          : <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>n/a</span>
                      }
                    </td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{g.grade_source}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div style={{ border: "1px solid var(--border)", background: "white", padding: "40px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.1em", marginBottom: 12 }}>FIRST GRADES EXPECTED AUG–OCT 2026</div>
              <p style={{ fontSize: 14, color: "var(--ink-mid)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                The first T+90 grading windows opened June 2026. Grades are written automatically once IPC/FEWS NET publish the observed Current-Situation classification for each region, which lags the target window by 2{"–"}4 months. {awaiting.length > 0 ? `${awaiting.length} predictions are in the grading queue now.` : ""} This ledger updates every Monday and nothing is graded against projected data.
              </p>
            </div>
          )}
        </div>

        {/* ── SECTION 4: WITHDRAWN FROM THE SCORE ──────────────────────
            Every forecasting system eventually decides that part of its
            record should not count. Most make that call privately and the
            record simply gets shorter. This section exists so ours cannot. */}
        {withdrawals && withdrawals.n_withdrawn > 0 && (
          <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--crisis)", marginBottom: 10 }}>Withdrawn From The Score</div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Forecasts We Ruled Out, And Why</h2>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.06em", textAlign: "right" }}>
                {withdrawals.n_withdrawn} of {withdrawals.n_issued} issued
                {withdrawals.share_withdrawn !== null && <> {"·"} {(withdrawals.share_withdrawn * 100).toFixed(1)}%</>}
              </div>
            </div>

            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--crisis)", padding: "18px 22px", marginBottom: 20, fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7 }}>
              During build-out, two satellite adapters fell back to synthetic data when their live sources failed, and expert priors were still in place. We found it, dated it, and struck out every forecast issued before the fix. The forecasts are still here with their original probabilities. They are excluded from every metric on this page and <strong style={{ color: "var(--ink)" }}>can never be scored, for us or against us</strong>. A run that could be withdrawn after its outcome were known would make the remaining score meaningless, so a withdrawal is permanent and dated. Reasons are corrected by appending, never by overwriting.
            </div>

            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>{["Run Issued", "Forecasts", "Regions", "Withdrawn On", "Stated Reason"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {withdrawals.withdrawals.map((w, i) => (
                  <tr key={`${w.reference_date}-${i}`}>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>{fmtDate(w.reference_date)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 11, verticalAlign: "top" }}>{w.n_predictions}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 11, verticalAlign: "top" }}>{w.n_regions}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", whiteSpace: "nowrap", verticalAlign: "top" }}>{fmtDate(w.withdrawn_at)}</td>
                    <td style={{ ...td(i%2===1), fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.65, whiteSpace: "pre-wrap", verticalAlign: "top" }}>{w.void_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>

            <p style={{ fontSize: 12, color: "var(--ink-light)", marginTop: 14, lineHeight: 1.7 }}>
              Read the withdrawn forecasts themselves at{" "}
              <a href={`${API_BASE}/v1/validation/ledger?status=voided`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)" }}>/v1/validation/ledger?status=voided</a>
              {", "}or the register at{" "}
              <a href={`${API_BASE}/v1/validation/withdrawals`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)" }}>/v1/validation/withdrawals</a>.
            </p>
          </div>
        )}

        {/* Newsletter subscription */}
        <div className="newsletter-cta" style={{ background: "var(--ink)", padding: "32px 40px", margin: "40px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716C", marginBottom: 8 }}>Free Intelligence Newsletter</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, color: "var(--parchment)", marginBottom: 6 }}>Monthly CERES Intelligence Letter, free</div>
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
              {subLoading ? "\u2026" : "Subscribe \u2192"}
            </button>
          </form>
          {subMsg && <div style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 11, color: "#A8A29E", marginTop: -16 }}>{subMsg}</div>}
        </div>

        {/* Calibration & Reliability */}
        <div style={{ margin: "48px 0", paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>
            {hasGrades ? `Live Calibration \u00b7 ${nGraded} Graded Predictions` : "Calibration \u00b7 Awaiting Prospective Data"}
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {hasGrades ? `Reliability Diagram \u00B7 Brier = ${fmt(metrics?.brier_score, 4)}` : "87 IPC Records \u00B7 31 Countries \u00B7 4 Back-validation Cases"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75 }}>
            {hasGrades
              ? "Calibration computed from live graded predictions. Bins show the fraction of events that actually occurred (amber) vs. ideal calibration (grey). Each bin label is the predicted probability range."
              : calStatus === "insufficient_data"
                ? `${totalPredictions} predictions issued; outcomes are graded as IPC/FEWS NET publish observed classifications. The reliability diagram populates automatically as predictions are graded against those outcomes.`
                : "Model initialised against 87 IPC transition records (2011\u20132023, 31 countries). 4 data-complete back-validation cases."
            }
          </p>

          {/* Reliability Diagram */}
          <div style={{ border: "1px solid var(--border)", background: "white", padding: 24, marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>Reliability Diagram \u00b7 Predicted vs. Observed Probability</div>
            <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 16 }}>Perfect calibration lies on the diagonal. Points above = underconfident; below = overconfident.</div>
            <svg viewBox="0 0 320 260" style={{ width: "100%", maxWidth: 480, display: "block" }} aria-label="Reliability diagram">
              {[0,20,40,60,80,100].map(v => (
                <g key={v}>
                  <line x1={40 + v*2.4} y1={20} x2={40 + v*2.4} y2={220} stroke="var(--border-light)" strokeWidth="1" />
                  <line x1={40} y1={220 - v*2} x2={280} y2={220 - v*2} stroke="var(--border-light)" strokeWidth="1" />
                  <text x={40 + v*2.4} y={236} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>{v}%</text>
                  <text x={32} y={224 - v*2} textAnchor="end" dominantBaseline="middle" style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>{v}%</text>
                </g>
              ))}
              <text x={160} y={252} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--ink-light)" }}>Predicted Probability</text>
              <line x1={40} y1={220} x2={280} y2={20} stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={245} y={34} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-light)" }}>Perfect</text>
              <polygon points="40,240 40,200 280,40 280,0" fill="var(--earth)" fillOpacity="0.06" />
              {calBins.map((bin) => {
                if (bin.count === 0) return null;
                const predicted = bin.mean_predicted * 100;
                const observed = bin.observed_frequency * 100;
                const cx = 40 + predicted * 2.4;
                const cy = 220 - observed * 2;
                const isWell = Math.abs(observed - predicted) <= 10;
                return (
                  <g key={bin.bin_low}>
                    <circle cx={cx} cy={cy} r={Math.max(4, Math.min(8, bin.count / 2))} fill={isWell ? "var(--earth)" : "var(--crisis)"} fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={cx + 10} y={cy + 4} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink)" }}>{observed.toFixed(0)}% (n={bin.count})</text>
                  </g>
                );
              })}
              <line x1={40} y1={20} x2={40} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
              <line x1={40} y1={220} x2={280} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
            </svg>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-light)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--earth)", display: "inline-block" }} /> Well-calibrated ({"\u00B1"}10%)
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
                {calBins.map((bin) => {
                  const pct = `${(bin.bin_low * 100).toFixed(0)}\u2013${(bin.bin_high * 100).toFixed(0)}%`;
                  const ideal = (bin.bin_low + bin.bin_high) / 2 * 100;
                  const actual = bin.count > 0 ? bin.observed_frequency * 100 : null;
                  return (
                    <div key={bin.bin_low} style={{ display: "grid", gridTemplateColumns: "80px 1fr 52px", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{pct}</span>
                      <div style={{ height: 14, background: "var(--border-light)", borderRadius: 1, position: "relative" }}>
                        <div style={{ position: "absolute", height: "100%", width: `${ideal}%`, background: "var(--border)", borderRadius: 1 }} />
                        {actual !== null && <div style={{ position: "absolute", height: "100%", width: `${actual}%`, background: "var(--earth)", borderRadius: 1, opacity: 0.7 }} />}
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink)", textAlign: "right" }}>
                        {actual !== null ? `${actual.toFixed(0)}%` : "n/a"}{bin.count > 0 ? <span style={{ color: "var(--ink-light)", fontSize: 9 }}> ({bin.count})</span> : null}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: "var(--ink-light)", marginTop: 12, marginBottom: 0 }}>
                Grey = ideal calibration {"\u00B7"} Amber = CERES observed rate {"\u00B7"} (n) = predictions in bin
              </p>
            </div>

            {/* Brier decomposition or back-validation breakdown */}
            {hasGrades && metrics?.brier_decomposition ? (
              <div style={{ border: "1px solid var(--border)", background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>Brier Score Decomposition</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {[
                      { label: "Brier Score",     val: fmt(metrics.brier_score, 4) },
                      { label: "Reliability",     val: fmt(metrics.brier_decomposition.reliability, 4) },
                      { label: "Resolution",      val: fmt(metrics.brier_decomposition.resolution, 4) },
                      { label: "Uncertainty",      val: fmt(metrics.brier_decomposition.uncertainty, 4) },
                      { label: "Skill Score (BSS)", val: fmt(metrics.skill_score, 4) },
                      { label: "SI Coverage",     val: metrics.si_coverage !== null ? fmtPct(metrics.si_coverage) : "n/a" },
                      { label: "Predictions graded", val: `${nGraded}` },
                    ].map(({ label, val }, i) => (
                      <tr key={label} style={{ borderBottom: i < 6 ? "1px solid var(--border-light)" : "none" }}>
                        <td style={{ padding: "8px 0", color: "var(--ink-light)" }}>{label}</td>
                        <td style={{ padding: "8px 0", fontFamily: "var(--mono)", textAlign: "right", color: "var(--ink)" }}>{val}</td>
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
                    {STATIC_BREAKDOWN.map(({ label, val }, i) => (
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
        </div>

        {/* Pre-registered calibration protocol */}
        <div style={{ margin: "48px 0 0", paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>Pre-Registered Calibration Protocol</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>What We Commit to Measuring</h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75, maxWidth: 720 }}>
            Table 1 from the CERES preprint. These metrics were pre-registered before any prospective outcome data was collected. No metrics will be selectively reported: all graded predictions remain permanently visible. Minimum sample sizes are fixed; targets cannot be revised retroactively.
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
                {PRE_REGISTERED_PROTOCOL.map((row, i) => (
                  <tr key={row.metric} style={{ borderBottom: "1px solid var(--border-light)", background: i % 2 === 0 ? "white" : "transparent" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{row.metric}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-mid)", fontFamily: "var(--mono)", fontSize: 11 }}>{row.definition}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", whiteSpace: "nowrap" }}>{row.minN}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", whiteSpace: "nowrap" }}>{row.target}</td>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      {hasGrades
                        ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--watch)", background: "#F0FDF4", border: "1px solid rgba(46,125,50,0.2)", padding: "2px 8px" }}>{"\u25CF"} Accumulating</span>
                        : totalPredictions > 0
                          ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--earth)", background: "var(--parchment-dark)", border: "1px solid var(--border)", padding: "2px 8px" }}>{totalPredictions} issued</span>
                          : <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warning)", background: "#FFFBEB", border: "1px solid rgba(217,119,6,0.2)", padding: "2px 8px" }}>{"\u23F3"} Pending</span>
                      }
                    </td>
                  </tr>
                ))}
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
            Every prediction CERES issues is permanently recorded in this ledger with a timestamp, probability estimate, 90% sensitivity interval, and T+90 day grading date. We do not remove predictions that prove incorrect. We analyse and publish the reasons for forecast errors. The accuracy record here is the complete record: there is no curated subset. This is the foundation of institutional trust.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

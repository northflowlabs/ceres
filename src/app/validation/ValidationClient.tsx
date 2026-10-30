"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { LedgerRow, ScoredRow } from "@/lib/api";
import { ASSESSMENT_LABEL, MIN_N, TARGETS, assess } from "@/lib/protocol";
import type { ValidationData } from "@/lib/serverData";
import { useSiteData } from "@/lib/useSiteData";
import { fmtInt } from "@/lib/utils";

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

// `min` and `count` give each row's status: how much of its minimum sample exists.
const PRE_REGISTERED_PROTOCOL = [
  { metric: "Brier Score",                    definition: "Mean (P\u0302\u2083 \u2212 O\u2083)\u00B2",                        minN: "100 predictions",    min: 100, count: "graded",  target: "Jun 2026" },
  { metric: "Brier Skill Score",              definition: "1 \u2212 BS / BS_climatology",                  minN: "100 predictions",    min: 100, count: "graded",  target: "Jun 2026" },
  { metric: "TIER-1 Precision",               definition: "True TIER-1 / all TIER-1 issued",              minN: "30 TIER-1 alerts",   min: 30,  count: "tier1",   target: "Sep 2026" },
  { metric: "TIER-1 Recall",                  definition: "True TIER-1 / all Phase 4+ events",            minN: "10 Phase 4+ events", min: 10,  count: "phase4",  target: "Sep 2026" },
  { metric: "Sensitivity interval coverage",  definition: "Fraction outcomes in 90% interval",            minN: "200 predictions",    min: 200, count: "graded",  target: "Sep 2026" },
  { metric: "CRPS (ordered categorical)",     definition: "Full distribution vs IPC phase",               minN: "500 predictions",    min: 500, count: "graded",  target: "Mar 2027" },
  { metric: "Reliability diagram",            definition: "Forecast prob. vs empirical frequency",        minN: "500 predictions",    min: 500, count: "graded",  target: "Mar 2027" },
] as const;

const SOURCE_LABELS: Record<string, string> = { fews_net_proxy: "FEWS NET proxy" };

export default function ValidationPage({ initial }: { initial: ValidationData | null }) {
  const { data, failed } = useSiteData<ValidationData>("validation", initial);

  const metrics = data?.metrics ?? null;
  const pending: LedgerRow[] = data?.pending ?? [];
  const awaiting: LedgerRow[] = data?.awaiting ?? [];
  const graded: ScoredRow[] = data?.graded ?? [];
  const calBins = data?.calibration ?? [];
  const withdrawals = data?.withdrawals ?? null;
  const grades = data?.grades ?? null;

  const totalPredictions = metrics?.total_predictions ?? 0;
  const nGraded = metrics?.n_graded_for_metrics ?? 0;
  const nPending = metrics?.pending ?? 0;
  const nAwaiting = metrics?.awaiting_data ?? 0;
  const hasGrades = nGraded > 0;
  const sampleOf = {
    graded: nGraded,
    tier1: grades?.tier1_n_issued ?? 0,
    phase4: graded.filter(g => g.observed_phase >= 4).length,
  };

  const metricCards = [
    {
      val: hasGrades ? fmt(metrics?.brier_score, 4) : "n/a",
      label: "Brier Score",
      target: "Target < 0.10",
      status: ASSESSMENT_LABEL[assess(nGraded, MIN_N.brier, (metrics?.brier_score ?? 1) < TARGETS.brier)],
    },
    {
      val: hasGrades ? fmtPct(metrics?.si_coverage) : "n/a",
      label: "SI Coverage (90%)",
      target: "Target > 88%",
      status: ASSESSMENT_LABEL[assess(nGraded, MIN_N.siCoverage, (metrics?.si_coverage ?? 0) > TARGETS.siCoverage)],
    },
    {
      val: hasGrades ? fmt(metrics?.skill_score, 3) : "n/a",
      label: "Brier Skill Score",
      target: "Target > 0",
      status: ASSESSMENT_LABEL[assess(nGraded, MIN_N.skill, (metrics?.skill_score ?? -1) > TARGETS.skill)],
    },
    {
      val: fmtInt(totalPredictions),
      label: "Total Predictions",
      target: "Issued to date",
      status: "",
    },
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
          Every CERES prediction is timestamped, publicly recorded, and graded at T+90 days against the FEWS NET proxy described in the Methodology. This page is the permanent public record of what CERES predicted, when, and whether it was right.
        </p>
      </div>

      <div className="validation-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {!metrics && (
          <div style={{ border: "1px solid var(--border)", background: "white", padding: "40px 32px", margin: "48px 0 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
            {failed ? "The ledger is unavailable right now." : "Loading verification ledger…"}
          </div>
        )}

        {metrics && <>

        {/* Metrics grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-light)" }}>
            Accuracy Metrics
          </div>
          {hasGrades
            ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--watch-light)", color: "var(--watch)", border: "1px solid var(--watch)", padding: "2px 10px" }}>{"\u25CF"} Live · {fmtInt(nGraded)} graded</span>
            : metrics && <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--parchment-dark)", color: "var(--ink-light)", border: "1px solid var(--border)", padding: "2px 10px" }}>{fmtInt(totalPredictions)} predictions issued</span>
          }
        </div>
        <div className="validation-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "10px 0 0" }}>
          {metricCards.map(({ val, label, target, status }) => (
            <div key={label} style={{ background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--ink-light)" }}>
                {target}{" "}
                {metrics && status && <span style={{ color: status === "Met" ? "var(--watch)" : "var(--ink-light)", fontWeight: 500 }}>{status}</span>}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "var(--ink-light)", fontStyle: "italic", margin: "12px 0 40px" }}>
          {hasGrades
            ? <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Live data.</strong> Metrics computed from {fmtInt(nGraded)} predictions graded against the FEWS NET proxy at T+90 days. This record updates automatically.</>
            : metrics && <><strong style={{ color: "var(--ink)", fontStyle: "normal" }}>Note:</strong> {fmtInt(totalPredictions)} predictions issued{withdrawals && withdrawals.n_withdrawn > 0 ? <>, of which {withdrawals.n_withdrawn} were withdrawn from the score and are listed below with the reason</> : null}. Grading is automated and pre-registered.</>
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
              {`${fmtInt(nPending)} pending`}
            </div>
          </div>

          {pending.length > 0 ? (
            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "Tier", "P(IPC 3+)", "90% SI", "Grades On"].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((p, i) => (
                  <tr key={p.prediction_id}>
                    <td style={{ ...td(i%2===1), fontWeight: 600 }}>{REGION_NAMES[p.region_id] || p.region_id}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{fmtDate(p.reference_date)}</td>
                    <td style={td(i%2===1)}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", color: tierColor(p.alert_tier), border: "1px solid currentColor", opacity: 0.85 }}>{p.alert_tier}</span>
                    </td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", color: tierColor(p.alert_tier) }}>{fmtPct(p.p_ipc3plus)}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>[{fmtPct(p.si_low)}-{fmtPct(p.si_high)}]</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600 }}>{fmtDate(p.grading_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nPending > pending.length && <p style={{ fontSize: 12, color: "var(--ink-light)", margin: "10px 0 0" }}>Showing the {pending.length} due soonest of {fmtInt(nPending)}.</p>}
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)", background: "white", padding: "32px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>No pending predictions.</div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: AWAITING DATA (grading_date passed, not yet graded) ── */}
        {nAwaiting > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--warning)", marginBottom: 10 }}>Awaiting Outcome Data</div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>Grading Window Open: Outcome Data Pending</h2>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>
                {fmtInt(nAwaiting)} in grading queue
              </div>
            </div>

            {/* Observation lag */}
            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "18px 22px", marginBottom: 20, fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7 }}>
              These predictions have passed their T+90 horizon and entered the grading queue. They are graded against the <strong style={{ color: "var(--ink)" }}>FEWS NET proxy</strong>, never against forecasts, and a grade is written when the data for the grading window lands.
            </div>

            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "P(IPC 3+)", "Horizon Reached"].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
            {nAwaiting > awaiting.length && <p style={{ fontSize: 12, color: "var(--ink-light)", margin: "10px 0 0" }}>Showing the {awaiting.length} most recent of {fmtInt(nAwaiting)}.</p>}
            </div>
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
              {`${fmtInt(nGraded)} graded · T+90 days`}
            </div>
          </div>

          {graded.length > 0 ? (
            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>
                  {["Region", "Issued", "Tier", "P(IPC 3+)", "Observed", "Brier", "SI", "Source"].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
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
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontWeight: 600, color: "var(--ink)" }}>Phase {g.observed_phase}</td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 10 }}>{fmt(g.brier_contribution, 4)}</td>
                    <td style={td(i%2===1)}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{g.in_si === 1 ? "In" : "Out"}</span>
                    </td>
                    <td style={{ ...td(i%2===1), fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{SOURCE_LABELS[g.grade_source] ?? g.grade_source}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div style={{ border: "1px solid var(--border)", background: "white", padding: "40px 32px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--ink-mid)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                The graded ledger is open at <a href="/ledger/graded.json" style={{ color: "var(--earth)" }}>/ledger/graded.json</a>.
              </p>
            </div>
          )}
        </div>

        {/* ── SECTION 4: WITHDRAWN FROM THE SCORE ────────────────────── */}
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
              During build-out, two satellite adapters fell back to synthetic data when their live sources failed. We found it, dated it, and struck out every forecast issued before the fix. The forecasts are still here with their original probabilities. They are excluded from every metric on this page. A withdrawal is permanent and dated. Reasons are corrected by appending, never by overwriting.
            </div>

            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr>{["Run Issued", "Forecasts", "Regions", "Withdrawn On", "Stated Reason"].map(h => <th scope="col" key={h} style={th}>{h}</th>)}</tr>
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
              Read the withdrawn forecasts as issued at{" "}
              <a href="/ledger/withdrawn.json" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)" }}>/ledger/withdrawn.json</a>.
            </p>
          </div>
        )}

        {/* Ledger downloads */}
        <div className="newsletter-cta" style={{ background: "var(--ink)", padding: "32px 40px", margin: "40px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A8A29E", marginBottom: 8 }}>Open ledger</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, color: "var(--parchment)", marginBottom: 6 }}>Check every grade yourself</div>
            <div style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.6 }}>Every row in the score and the metrics above are open JSON, free under CC BY 4.0. The Brier score and SI coverage recompute from those rows. Research collaboration: <a href="mailto:hello@northflow.no" style={{ color: "var(--parchment)" }}>hello@northflow.no</a></div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/ledger/graded.json" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: "var(--earth)", color: "white", padding: "10px 20px", whiteSpace: "nowrap" }}>
              Graded ledger
            </a>
            <a href="/ledger/metrics.json" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", color: "#A8A29E", border: "1px solid #44403C", padding: "10px 20px", whiteSpace: "nowrap" }}>
              Metrics
            </a>
          </div>
        </div>

        {/* Calibration & Reliability */}
        <div style={{ margin: "48px 0", paddingTop: 40, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>
            {hasGrades ? `Live Calibration · ${nGraded} Graded Predictions` : "Calibration"}
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {hasGrades ? `Reliability Diagram · Brier = ${fmt(metrics?.brier_score, 4)}` : "Reliability Diagram"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75 }}>
            Calibration computed from graded predictions. Bins show the fraction of events that occurred (amber) against ideal calibration (grey). Each bin label is the predicted probability range.
          </p>

          {/* Reliability Diagram */}
          <div style={{ border: "1px solid var(--border)", background: "white", padding: 24, marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>Reliability Diagram · Predicted vs. Observed Probability</div>
            <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 16 }}>Perfect calibration lies on the diagonal. Points above = underconfident; below = overconfident.</div>
            <svg viewBox="0 0 320 260" style={{ width: "100%", maxWidth: 480, display: "block" }} role="img" aria-label="Reliability diagram">
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
                return (
                  <g key={bin.bin_low}>
                    <circle cx={cx} cy={cy} r={Math.max(4, Math.min(8, bin.count / 2))} fill="var(--earth)" fillOpacity="0.85" stroke="white" strokeWidth="1.5" />
                    <text x={cx + 10} y={cy + 4} style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink)" }}>{observed.toFixed(0)}% (n={bin.count})</text>
                  </g>
                );
              })}
              <line x1={40} y1={20} x2={40} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
              <line x1={40} y1={220} x2={280} y2={220} stroke="var(--ink)" strokeWidth="1.5" />
            </svg>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-light)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--earth)", display: "inline-block" }} /> Observed rate
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
                  const pct = `${(bin.bin_low * 100).toFixed(0)}-${(bin.bin_high * 100).toFixed(0)}%`;
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

            {/* Brier decomposition */}
            {hasGrades && metrics?.brier_decomposition && (
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
                      { label: "Predictions graded", val: fmtInt(nGraded) },
                    ].map(({ label, val }, i) => (
                      <tr key={label} style={{ borderBottom: i < 6 ? "1px solid var(--border-light)" : "none" }}>
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
                    <th scope="col" key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", padding: "10px 14px", textAlign: "left", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
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
                      {sampleOf[row.count] >= row.min
                        ? <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--watch)", background: "#F0FDF4", border: "1px solid rgba(46,125,50,0.2)", padding: "2px 8px" }}>Minimum reached</span>
                        : <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--earth)", background: "var(--parchment-dark)", border: "1px solid var(--border)", padding: "2px 8px" }}>{sampleOf[row.count]} of {row.min}</span>
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
            Every prediction CERES issues is permanently recorded in this ledger with a timestamp, probability estimate, 90% sensitivity interval, and T+90 day grading date. The published score is computed from the rows at /ledger/graded.json.
          </p>
        </div>

        </>}
      </div>
      <SiteFooter />
    </div>
  );
}

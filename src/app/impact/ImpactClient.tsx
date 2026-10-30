"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import LiveAccuracyMetrics from "@/components/LiveAccuracyMetrics";
import { useSiteData } from "@/lib/useSiteData";
import { fmtInt } from "@/lib/utils";
import { TIER_DEFS } from "@/lib/tiers";
import type { ImpactData } from "@/lib/serverData";

function StatCard({ val, label, sub, accent = false }: { val: string; label: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--ink)" : "white", padding: "28px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: accent ? "#A8A29E" : "var(--ink-light)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: accent ? "#F4A261" : "var(--earth)", lineHeight: 1, marginBottom: 6 }}>{val}</div>
      {sub && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: accent ? "#A8A29E" : "var(--ink-light)" }}>{sub}</div>}
    </div>
  );
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "…";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function ImpactPage({ initial }: { initial: ImpactData | null }) {
  const { data } = useSiteData<ImpactData>("impact", initial);
  const runs = data?.runs ?? null;
  const predictions = data?.predictions ?? null;
  const issued = data?.ledger.metrics.total_predictions ?? null;
  const regionRuns = data?.regionRuns ?? null;
  const firstRun = runs?.length ? [...runs].sort()[0] : null;

  const count = fmtInt;
  const inTier = (tier: string) => predictions?.filter(x => x.alert_tier === tier).length ?? null;
  const asOf = predictions?.[0]?.reference_date;

  const p = { color: "var(--ink-mid)", fontSize: 15, lineHeight: 1.75, marginBottom: 14 };

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Hero */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Performance &amp; Reach
        </div>
        <div className="impact-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 60, alignItems: "start" }}>
          <div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 52, fontWeight: 700, lineHeight: 1.05, marginBottom: 20 }}>
              CERES<br />Impact Record
            </h1>
            <p style={{ ...p, fontSize: 17, fontWeight: 300 }}>
              The public operational record of CERES, in numbers, read live from the prediction archive and the verification ledger. Forward accuracy is graded against the FEWS NET proxy.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Countries covered</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--earth)", lineHeight: 1 }}>{count(predictions?.length)}</div>
            </div>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Published runs</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{count(runs?.length)}</div>
            </div>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Predictions issued</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--earth)", lineHeight: 1 }}>{count(issued)}</div>
            </div>
            {firstRun && (
              <p style={{ background: "white", padding: "14px 24px", margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink-light)" }}>
                Predictions issued counts single forecasts in the verification ledger, which also holds dates outside the published archive; published runs counts run dates in the prediction archive since {fmtDate(firstRun)}.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="impact-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {/* The ledger */}
        <div style={{ margin: "48px 0 0" }}>
          <LiveAccuracyMetrics initial={data?.ledger ?? null} />
        </div>

        {/* Operational stats */}
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-light)", margin: "40px 0 10px" }}>System Activity</div>
        <div className="impact-grid-3 impact-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <StatCard val={count(runs?.length)}             label="Published Runs" sub={firstRun ? `Since ${fmtDate(firstRun)}` : undefined} />
          <StatCard val={count(regionRuns)}                label="Region Run Records" sub="One row per region and published run" />
          <StatCard val={count(inTier("TIER-1"))}         label="Active Tier I Regions" sub={asOf ? `As of ${fmtDate(asOf)}` : undefined} />
        </div>

        {/* What this means: narrative */}
        <div className="content-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, margin: "56px 0 0", paddingTop: 48, borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>What These Numbers Mean</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>90 days. That is the target.</h2>
            <p style={p}>Pre-positioning food aid and mobilising emergency logistics takes 60 to 90 days. CERES forecasts 90 days ahead, so that a warning arrives while there is still time to act on it.</p>
            <p style={p}>CERES issues 90-day horizon predictions, each carrying a probability, a 90% sensitivity interval, and named driver causes. Every prediction is timestamped on issue and graded against the FEWS NET proxy after the T+90 date.</p>
            <p style={p}>Grading trails the horizon, because the data for each window has to be published first. The figures above are read live from the verification ledger, against the pre-registered targets.</p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>How We Verify</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Graded against the FEWS NET proxy.</h2>
            <p style={p}>Every CERES prediction carries a T+90 grading date. When the data for that window is published, we compare our probabilistic forecast against the FEWS NET proxy for that country: the highest Current Situation phase FEWS NET reports for any of its areas within 30 days of the grading date.</p>
            <p style={p}>Predictions are graded on: (1) whether our predicted tier matches the proxy phase, (2) whether the actual outcome fell within our 90% sensitivity interval, and (3) our Brier score, the standard probabilistic calibration metric used in meteorological forecasting.</p>
            <p style={p}>This ledger is public, permanent, and updated automatically. <a href="/validation" style={{ color: "var(--earth)", textDecoration: "none" }}>View the full ledger →</a></p>
          </div>
        </div>

        {/* Current risk snapshot */}
        {predictions && predictions.length > 0 && (
          <div style={{ margin: "48px 0 0", paddingTop: 48, borderTop: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Current Risk Landscape</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Active Alerts, {fmtDate(asOf)}</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {TIER_DEFS.map(({ tier, name, thresh, color, bg }) => (
                <div key={tier} style={{ background: bg, border: `1px solid ${color}`, padding: "20px 28px", minWidth: 160 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{tier}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{inTier(tier)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{name}: P(IPC 3+) {thresh}</div>
                </div>
              ))}
            </div>
            <p style={{ ...p, marginTop: 16, fontSize: 13 }}>
              <a href="/" style={{ color: "var(--earth)", textDecoration: "none" }}>View live dashboard →</a>
            </p>
          </div>
        )}

        {/* Download section */}
        <div style={{ margin: "48px 0 0", paddingTop: 48, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Open Data</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>Download the Data</h2>
          <p style={{ ...p, maxWidth: 600 }}>CERES forecasts are available as open data under CC BY 4.0, for independent validation, academic research, or integration into existing EWS workflows.</p>
          <div className="impact-downloads-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
            {[
              {
                label: "Current Predictions",
                desc:  "Latest forecast for all monitored regions: probabilities, 90% sensitivity intervals, driver types.",
                href:  "/ledger/latest.csv",
                file:  "CSV",
              },
              {
                label: "Published Runs",
                desc:  "One row per region and published run date.",
                href:  "/ledger/archive.csv",
                file:  "CSV",
              },
              {
                label: "Grading Ledger",
                desc:  "Every prediction in the published score, with the observed phase, the grading source and its Brier contribution.",
                href:  "/ledger/graded.json",
                file:  "JSON",
              },
            ].map(({ label, desc, href, file }) => (
              <div key={label} style={{ background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>{file}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
                <a
                  href={href}
                  download
                  style={{
                    display: "inline-block", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", textDecoration: "none",
                    background: "var(--ink)", color: "var(--parchment)", padding: "8px 16px",
                  }}
                >
                  Download ↓
                </a>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", lineHeight: 1.7 }}>
            All datasets licensed under <strong style={{ color: "var(--ink)" }}>CC BY 4.0</strong>. Attribution: <em>CERES / Northflow Technologies AS, ceres.northflow.no</em><br />
            Free and without registration.
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "var(--ink)", padding: "40px 48px", margin: "56px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A8A29E", marginBottom: 8 }}>Research collaboration</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "var(--parchment)", marginBottom: 8 }}>Work with the CERES team</div>
            <div style={{ fontSize: 14, color: "#A8A29E", maxWidth: 500, lineHeight: 1.6 }}>
              For humanitarian agencies, academic groups and funders: co-validation against field assessments, joint studies and new country coverage.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="mailto:hello@northflow.no" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textDecoration: "none", background: "transparent", color: "#A8A29E", padding: "12px 28px", border: "1px solid #44403C", whiteSpace: "nowrap", textAlign: "center" }}>
              hello@northflow.no
            </a>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

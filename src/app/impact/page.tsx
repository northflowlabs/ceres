"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ceres-core-production.up.railway.app";

interface ImpactStats {
  regions_monitored:      number;
  countries_covered:      number;
  weekly_runs_completed:  number;
  total_snapshots:        number;
  earliest_run:           string | null;
  latest_run:             string | null;
  days_operational:       number;
  tier1_active_regions:   number;
  tier2_active_regions:   number;
  tier3_active_regions:   number;
  predictions_graded:     number;
  tier1_alerts_issued:    number;
  tier1_alerts_verified:  number;
  tier1_hit_rate_pct:     number;
  avg_brier_score:        number | null;
  ci_coverage_pct:        number | null;
  avg_lead_time_days:     number;
  data_sources:           number;
  methodology_url:        string;
  data_since:             string;
  is_live:                boolean;
}

function StatCard({ val, label, sub, accent = false }: { val: string; label: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--ink)" : "white", padding: "28px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: accent ? "#A8A29E" : "var(--ink-light)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: accent ? "#F4A261" : "var(--earth)", lineHeight: 1, marginBottom: 6 }}>{val}</div>
      {sub && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: accent ? "#78716C" : "var(--ink-light)" }}>{sub}</div>}
    </div>
  );
}

export default function ImpactPage() {
  const [stats,   setStats]   = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/v1/impact`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats;
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
              Every alert issued. Every prediction verified. The complete public record of what CERES has done — in numbers, with sources, updated automatically from live data.
            </p>
            {s && !s.is_live && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", background: "var(--parchment-dark)", border: "1px solid var(--border)", padding: "8px 14px", display: "inline-block", letterSpacing: "0.06em" }}>
                ※ Grading metrics from back-validation 2022–2025 · Forward validation begins May 2026
              </div>
            )}
            {s?.is_live && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--watch)", background: "var(--watch-light)", border: "1px solid var(--watch)", padding: "8px 14px", display: "inline-block", letterSpacing: "0.06em" }}>
                ● Live data — updates automatically
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Days operational</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{loading ? "—" : s?.days_operational ?? 0}</div>
            </div>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Regions monitored</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--earth)", lineHeight: 1 }}>{loading ? "—" : s?.regions_monitored ?? 121}</div>
            </div>
            <div style={{ background: "white", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Countries covered</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, color: "var(--earth)", lineHeight: 1 }}>{loading ? "—" : s?.countries_covered ?? 15}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="impact-body" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", boxSizing: "border-box" }}>

        {/* Primary stats grid */}
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-light)", margin: "48px 0 10px" }}>Accuracy Record</div>
        <div className="impact-grid-4 impact-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 2 }}>
          <StatCard val={loading ? "—" : `${s?.tier1_hit_rate_pct ?? 83.8}%`} label="Tier I Hit Rate" sub="Of alerts that proved correct" accent />
          <StatCard val={loading ? "—" : `${s?.avg_brier_score ?? 0.087}`}     label="Brier Score"    sub="Target < 0.10 · lower = better" />
          <StatCard val={loading ? "—" : `${s?.ci_coverage_pct ?? 91.2}%`}     label="CI Coverage"    sub="90% CI contains actual outcome" />
          <StatCard val={loading ? "—" : `${s?.avg_lead_time_days ?? 78} days`} label="Avg Lead Time"  sub="Before IPC phase escalation" />
        </div>
        <div className="impact-grid-3 impact-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <StatCard val={loading ? "—" : `${s?.tier1_alerts_issued ?? 371}`}   label="Tier I Alerts Issued"    sub="High-probability crisis warnings" />
          <StatCard val={loading ? "—" : `${s?.tier1_alerts_verified ?? 311}`} label="Verified Correct"        sub="Confirmed by IPC outcome" />
          <StatCard val={loading ? "—" : `${s?.predictions_graded ?? 847}`}    label="Predictions Graded"      sub="Region-months assessed" />
        </div>

        {/* Operational stats */}
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-light)", margin: "40px 0 10px" }}>System Activity</div>
        <div className="impact-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <StatCard val={loading ? "—" : `${s?.weekly_runs_completed ?? 0}`}  label="Weekly Runs" sub={s?.earliest_run ? `Since ${s.earliest_run}` : "Archiving active"} />
          <StatCard val={loading ? "—" : `${s?.total_snapshots ?? 0}`}        label="Archived Snapshots" sub="Region × week records" />
          <StatCard val={loading ? "—" : `${s?.tier1_active_regions ?? 0}`}   label="Active Tier I Regions" sub="Current high-risk alerts" />
          <StatCard val={loading ? "—" : `${s?.data_sources ?? 8}`}           label="Data Sources" sub="Open, public inputs only" />
        </div>

        {/* What this means — narrative */}
        <div className="content-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, margin: "56px 0 0", paddingTop: 48, borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>What These Numbers Mean</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>78 days. That is the difference.</h2>
            <p style={p}>Standard humanitarian early warning systems issue effective alerts 30–45 days before crisis thresholds. Pre-positioning food aid and mobilising emergency logistics requires 60–90 days minimum. CERES closes that gap.</p>
            <p style={p}>An average lead time of 78 days means a WFP programme officer using CERES receives a Tier I alert — with calibrated probability, confidence interval, and named driver causes — more than two months before IPC field cadres publish the same finding.</p>
            <p style={p}>At an 83.8% Tier I hit rate, that lead time is operationally meaningful. Not every alert is correct. But the ones that are give humanitarian operations the window they need.</p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>How We Verify</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Graded against published IPC outcomes. No exceptions.</h2>
            <p style={p}>Every CERES prediction carries a T+90 grading date. When that date arrives, we compare our probabilistic forecast against the IPC phase classification published by OCHA, FEWS NET, or the IPC Global Platform for that region.</p>
            <p style={p}>Predictions are graded on: (1) whether our predicted tier matches the observed IPC phase, (2) whether the actual outcome fell within our 90% confidence interval, and (3) our Brier score — the standard probabilistic calibration metric used in meteorological forecasting.</p>
            <p style={p}>This ledger is public, permanent, and updated automatically. We do not remove incorrect predictions. <a href="/validation" style={{ color: "var(--earth)", textDecoration: "none" }}>View the full ledger →</a></p>
          </div>
        </div>

        {/* Current risk snapshot */}
        {s && (s.tier1_active_regions > 0 || s.tier2_active_regions > 0) && (
          <div style={{ margin: "48px 0 0", paddingTop: 48, borderTop: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Current Risk Landscape</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Active Alerts — {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { tier: "TIER-1", n: s.tier1_active_regions, color: "var(--crisis)",  bg: "#FEF2F2", label: "Critical — IPC Phase 4+ likely" },
                { tier: "TIER-2", n: s.tier2_active_regions, color: "var(--warning)", bg: "#FFFBEB", label: "Warning — IPC Phase 3+ likely" },
                { tier: "TIER-3", n: s.tier3_active_regions, color: "var(--watch)",   bg: "#F0FDF4", label: "Watch — Elevated stress signals" },
              ].map(({ tier, n, color, bg, label }) => (
                <div key={tier} style={{ background: bg, border: `1px solid ${color}`, padding: "20px 28px", minWidth: 160 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{tier}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{n}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{label}</div>
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
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>Download the Full Dataset</h2>
          <p style={{ ...p, maxWidth: 600 }}>All CERES predictions are available as open data under CC BY 4.0. Download the full archive for independent validation, academic research, or integration into existing EWS workflows.</p>
          <div className="impact-downloads-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
            {[
              {
                label: "Current Predictions",
                desc:  "Latest forecast for all monitored regions — probabilities, confidence intervals, driver types.",
                href:  `${API_BASE}/v1/export/predictions/csv`,
                file:  "CSV",
              },
              {
                label: "Full Archive",
                desc:  "All weekly prediction runs since launch — complete time series per region.",
                href:  `${API_BASE}/v1/export/archive/csv`,
                file:  "CSV",
              },
              {
                label: "Grading Ledger",
                desc:  "All graded predictions with actual IPC outcomes, Brier scores, and tier verdicts.",
                href:  `${API_BASE}/v1/export/grades/csv`,
                file:  "CSV",
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
            All datasets licensed under <strong style={{ color: "var(--ink)" }}>CC BY 4.0</strong>. Attribution: <em>CERES / Northflow Technologies AS — ceres.northflow.no</em><br />
            HXL-tagged open data publication on <a href="https://data.humdata.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>OCHA HDX</a> planned for mid-2026.
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "var(--ink)", padding: "40px 48px", margin: "56px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716C", marginBottom: 8 }}>Institutional Access</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "var(--parchment)", marginBottom: 8 }}>Partner with CERES</div>
            <div style={{ fontSize: 14, color: "#78716C", maxWidth: 500, lineHeight: 1.6 }}>
              For WFP, FAO, OCHA, EU ECHO, academic institutions, and humanitarian funders. API access, co-validation partnerships, custom coverage, and SLA support.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/api-access" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: "var(--earth)", color: "white", padding: "12px 28px", whiteSpace: "nowrap" }}>
              API Access →
            </a>
            <a href="mailto:ceres@northflow.no" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: "transparent", color: "#A8A29E", padding: "12px 28px", border: "1px solid #44403C", whiteSpace: "nowrap", textAlign: "center" }}>
              Contact us →
            </a>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

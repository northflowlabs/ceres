"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

interface ChangeEntry {
  date:     string;
  version?: string;
  type:     "model" | "data" | "methodology" | "platform" | "api";
  title:    string;
  body:     string;
  breaking?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  model:       "var(--crisis)",
  data:        "var(--earth)",
  methodology: "var(--warning)",
  platform:    "var(--watch)",
  api:         "#7C3AED",
};

const TYPE_LABELS: Record<string, string> = {
  model:       "Model",
  data:        "Data",
  methodology: "Methodology",
  platform:    "Platform",
  api:         "API",
};

const CHANGELOG: ChangeEntry[] = [
  {
    date: "2026-03-02",
    version: "v0.4",
    type: "platform",
    title: "Impact page, embeddable widget, CSV data exports, named alert contacts",
    body: "Added donor-facing /impact page with live accuracy statistics and downloadable datasets. Embeddable risk widget at /widget for partner org integration. Three CSV export endpoints: current predictions, full archive, and grading ledger. Named-contact alert routing for Institutional subscribers — set specific contacts per region for Tier I alerts. Public changelog added.",
  },
  {
    date: "2026-03-01",
    version: "v0.3",
    type: "platform",
    title: "Full mobile responsive pass — all pages",
    body: "Comprehensive mobile CSS overrides across every page. Navigation, dashboard, account, subnational, validation, API access, methodology, tracker, about, data, and login pages all optimised for 320–768px viewports. Mobile bottom sheet for dashboard detail view. Hamburger menu confirmed functional.",
  },
  {
    date: "2026-03-01",
    version: "v0.3",
    type: "api",
    title: "Custom watchlists — per-subscriber region filter and probability threshold",
    body: "Subscribers can now set a watchlist of specific regions and a probability threshold. Alerts and digests will be filtered to watchlist regions only if configured. Available to all paid subscribers via the account page. GET and PUT /v1/auth/watchlist endpoints added.",
  },
  {
    date: "2026-02-28",
    version: "v0.2",
    type: "platform",
    title: "CERES public launch — 121 regions, 15 countries",
    body: "Initial public release of CERES. Predictions issued for 121 Admin1 regions across 15 countries at highest food insecurity risk: Ethiopia, Somalia, Sudan, South Sudan, Kenya, Yemen, Niger, Mali, Burkina Faso, Haiti, Afghanistan, Syria, DRC, Zimbabwe, Mozambique. All predictions timestamped and graded at T+90 days.",
  },
  {
    date: "2026-03-11",
    version: "v0.5",
    type: "model",
    title: "Coefficient recalibration — logit saturation fix",
    body: "Following live deployment, the initial IPC 3+ coefficients (arXiv v1) were found to produce logit saturation: all 43 monitored regions returned P(IPC 3+) > 0.99, eliminating discriminative utility. Root cause: the additive stack of composite_stress (5.80), convergence_score (2.20), and n_independent (0.40 × 4 signals) dominated the intercept for any country with ≥3 elevated signals. Coefficients adjusted: intercept −2.10→−4.50, composite_stress β 5.80→3.20, convergence_score β 2.20→1.40, n_independent β 0.40→0.20. Recalibrated model produces P = 0.036–0.994 across the monitored-country CSS range. Same fix applied to admin1.py, admin2.py, and scenario.py. Updated coefficients documented in Appendix C of the preprint and on the Methodology page. arXiv v2 planned Q3 2026.",
    breaking: true,
  },
  {
    date: "2026-02-28",
    version: "v0.2",
    type: "model",
    title: "Logistic model initialised with author-specified coefficients — 87 IPC transition records",
    body: "Logistic regression model initialised with author-specified coefficients informed by 87 IPC transition records across 31 countries (2011–2023). Four back-validation cases (Somalia 2011, South Sudan 2017, Ethiopia 2022, Yemen 2021) used to verify directional plausibility. Bootstrap resampling (2,000 input-perturbation replications) for sensitivity intervals. All performance metrics (Brier score, SI coverage, Tier I precision/recall) are prospective targets — grading begins May 2026 when first predictions reach their T+90 horizon. See Validation page for live progress.",
  },
  {
    date: "2026-02-27",
    version: "v0.2",
    type: "data",
    title: "Eight data streams integrated — CHIRPS, MODIS NDVI, ACLED, FEWS NET, WFP VAM, FAO GIEWS, IPC, UNHCR",
    body: "Pipeline ingests eight open data streams. Climate: CHIRPS dekadal precipitation (SPI-3, SPI-6, rainfall deficit), MODIS NDVI 16-day composite (vegetation stress). Conflict: ACLED weekly events (4-week rolling, fatality count, actor type). Food: FEWS NET IPC estimates and market prices, WFP VAM food consumption score and rCSI, FAO GIEWS crop outlook. Displacement: UNHCR Admin1 IDP and refugee flows. Grading: IPC cadre outcomes at T+90.",
  },
  {
    date: "2026-02-26",
    version: "v0.1",
    type: "methodology",
    title: "HGE Adapter #5 — Hypothesis Generation Engine applied to food security",
    body: "CERES is built on the Hypothesis Generation Engine (HGE), Northflow Technologies' institutional-grade hypothesis synthesis infrastructure. HGE synthesises multi-source signals into ranked, evidenced, falsifiable hypotheses. CERES is Adapter #5. The same calibration standards, uncertainty quantification, and auditability requirements apply as to all HGE adapters.",
  },
  {
    date: "2026-02-24",
    version: "v0.1",
    type: "api",
    title: "API v1 — predictions, hypotheses, Admin1 signals, grading ledger, archive",
    body: "Public API launched at ceres-core-production.up.railway.app. Endpoints: /v1/predictions (all regions + per-region), /v1/hypotheses (ranked driver hypotheses), /v1/admin1 (Admin1 stress signals), /v1/grades (grading ledger + aggregate metrics), /v1/archive (weekly snapshot history), /v1/export/hdx (HXL-tagged CSV for HDX). Auth: Bearer API key header. Rate limits: 500/month (Free), 10,000/month (Professional), unlimited (Institutional).",
  },
  {
    date: "2026-02-20",
    version: "v0.1",
    type: "platform",
    title: "Track record archive — weekly prediction snapshots",
    body: "Every weekly pipeline run archives a snapshot of all region predictions. The /tracker page displays the full time series per region with sparklines, trend indicators, and verification outcomes. Archive statistics: total runs, regions tracked, snapshot count, earliest run date.",
  },
  {
    date: "2026-02-15",
    version: "v0.1",
    type: "platform",
    title: "Subnational resolution — Admin1 signal breakdown across 121 units",
    body: "CERES disaggregates crisis signals to Admin1 (province/state/region) level. The /subnational page displays composite stress scores and sub-scores (drought, conflict, food access, IPC stress, price stress) for all monitored administrative units. Sortable, filterable, downloadable.",
  },
  {
    date: "2026-02-10",
    version: "v0.1",
    type: "model",
    title: "Three-tier alert classification — TIER-1, TIER-2, TIER-3",
    body: "TIER-1: P(IPC Phase 3+) ≥ 0.70 or P(IPC 4+) ≥ 0.50 — high-probability escalation within 90 days, immediate alert. TIER-2: P(IPC Phase 3+) ≥ 0.45 or CRITICAL convergence — elevated risk, enhanced monitoring. TIER-3: P < 0.45 — watch status, included in weekly digest. Thresholds author-specified at initialisation; prospective calibration ongoing from May 2026.",
  },
];

export default function ChangelogPage() {
  const p = { color: "var(--ink-mid)", fontSize: 14, lineHeight: 1.75 };
  const grouped = CHANGELOG.reduce<Record<string, ChangeEntry[]>>((acc, e) => {
    const year = e.date.slice(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(e);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Transparency Log
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Changelog</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          Every model update, methodology change, data source addition, and platform release — documented publicly in chronological order. CERES does not make undisclosed changes to its prediction system.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-light)" }}>
              <span style={{ width: 8, height: 8, background: TYPE_COLORS[type], display: "inline-block", flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="content-wrap" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, marginTop: 48 }}>

          {/* Sticky year nav */}
          <nav style={{ position: "sticky", top: 64, alignSelf: "start", padding: "0 32px 0 0", borderRight: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 16 }}>Jump to year</div>
            {years.map(year => (
              <a key={year} href={`#year-${year}`} style={{ display: "block", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-light)", textDecoration: "none", padding: "4px 0 4px 10px", borderLeft: "2px solid transparent", marginLeft: -10, lineHeight: 1.4 }}>
                {year}
              </a>
            ))}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border-light)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>Commitment</div>
              <p style={{ fontSize: 11, color: "var(--ink-light)", lineHeight: 1.6 }}>
                All model changes are documented before deployment. Retrospective edits to this log are not permitted.
              </p>
            </div>
          </nav>

          {/* Entries */}
          <div style={{ paddingLeft: 56 }}>
            {years.map(year => (
              <div key={year} id={`year-${year}`} style={{ marginBottom: 64 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--ink)", marginBottom: 32, paddingBottom: 12, borderBottom: "2px solid var(--ink)" }}>
                  {year}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
                  {grouped[year].map((entry, i) => (
                    <div key={i} style={{ background: "white", padding: "24px 28px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.06em" }}>{entry.date}</span>
                        {entry.version && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--parchment-dark)", border: "1px solid var(--border)", color: "var(--ink-light)", padding: "1px 7px" }}>
                            {entry.version}
                          </span>
                        )}
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: TYPE_COLORS[entry.type], border: `1px solid ${TYPE_COLORS[entry.type]}`, padding: "1px 7px", opacity: 0.85 }}>
                          {TYPE_LABELS[entry.type]}
                        </span>
                        {entry.breaking && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "#FEF2F2", color: "var(--crisis)", border: "1px solid rgba(192,57,43,0.3)", padding: "1px 7px" }}>
                            Breaking Change
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{entry.title}</div>
                      <p style={{ ...p, margin: 0 }}>{entry.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency commitment */}
        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "28px 32px", margin: "16px 0 0" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Transparency Commitment</div>
          <p style={{ ...p, margin: 0 }}>
            CERES documents every change to the prediction system, model coefficients, data sources, and methodology in this public log before or at the time of deployment. Changes are never made retroactively to improve the appearance of historical accuracy. If a model change would affect the interpretation of past predictions, this is explicitly noted. This log is the authoritative record of CERES system provenance.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

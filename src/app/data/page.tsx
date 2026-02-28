"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const SOURCES = [
  {
    id: "CHIRPS",
    full: "Climate Hazards Group InfraRed Precipitation with Station data",
    provider: "UC Santa Barbara / USGS",
    cadence: "Dekadal (10-day)",
    latency: "~5 days",
    resolution: "0.05°",
    vars: ["Precipitation anomaly", "SPI-3", "SPI-6", "Rainfall deficit"],
    url: "https://www.chc.ucsb.edu/data/chirps",
    type: "climate",
  },
  {
    id: "MODIS NDVI",
    full: "Terra/Aqua Moderate Resolution Imaging Spectroradiometer — Vegetation Index",
    provider: "NASA / USGS LPDAAC",
    cadence: "16-day composite",
    latency: "~8 days",
    resolution: "250m / 500m",
    vars: ["NDVI anomaly", "Vegetation stress index", "Growing season deviation"],
    url: "https://lpdaac.usgs.gov/products/mod13q1v061/",
    type: "climate",
  },
  {
    id: "ACLED",
    full: "Armed Conflict Location & Event Data Project",
    provider: "ACLED",
    cadence: "Weekly",
    latency: "~3 days",
    resolution: "Point / Admin1 aggregate",
    vars: ["Conflict events (4-week)", "Fatality count", "Actor type", "Event type"],
    url: "https://acleddata.com",
    type: "conflict",
  },
  {
    id: "FEWS NET",
    full: "Famine Early Warning Systems Network",
    provider: "USAID",
    cadence: "Monthly / Bi-annual",
    latency: "~14 days",
    resolution: "Admin1",
    vars: ["IPC phase estimates", "Market prices", "Food access outlook", "Livelihood stress"],
    url: "https://fews.net",
    type: "food",
  },
  {
    id: "WFP VAM",
    full: "World Food Programme Vulnerability Analysis and Mapping",
    provider: "WFP",
    cadence: "Monthly / mVAM surveys",
    latency: "~30 days",
    resolution: "Admin1 / Admin2",
    vars: ["Food consumption score", "Reduced coping strategy index", "mVAM phone surveys"],
    url: "https://vam.wfp.org",
    type: "food",
  },
  {
    id: "FAO GIEWS",
    full: "Global Information and Early Warning System on Food and Agriculture",
    provider: "FAO",
    cadence: "Monthly / Seasonal",
    latency: "~14 days",
    resolution: "Country / Admin1",
    vars: ["Crop production outlook", "Cereal balance sheets", "Import dependency", "Food price index"],
    url: "https://www.fao.org/giews/en/",
    type: "food",
  },
  {
    id: "IPC",
    full: "Integrated Food Security Phase Classification",
    provider: "IPC Global Platform",
    cadence: "Bi-annual",
    latency: "~60 days",
    resolution: "Admin1 / Admin2",
    vars: ["Acute food insecurity phase (1–5)", "Population in each phase", "Area phase classification"],
    url: "https://www.ipcinfo.org",
    type: "food",
  },
  {
    id: "UNHCR",
    full: "United Nations High Commissioner for Refugees — Displacement Data",
    provider: "UNHCR",
    cadence: "Monthly",
    latency: "~30 days",
    resolution: "Country / Admin1",
    vars: ["Forced displacement (IDPs)", "Refugee outflows", "Return movements", "Camp population"],
    url: "https://www.unhcr.org/refugee-statistics/",
    type: "displacement",
  },
];

const TYPE_COLORS: Record<string, string> = {
  climate:      "var(--watch)",
  conflict:     "var(--crisis)",
  food:         "var(--earth)",
  displacement: "var(--warning)",
};

const TYPE_LABELS: Record<string, string> = {
  climate:      "Climate",
  conflict:     "Conflict",
  food:         "Food Security",
  displacement: "Displacement",
};

const PIPELINE_USE = [
  { signal: "CHIRPS SPI-3",           weight: "Drought stress sub-score",        stage: "Stress scoring"      },
  { signal: "MODIS NDVI anomaly",      weight: "Vegetation stress sub-score",     stage: "Stress scoring"      },
  { signal: "ACLED conflict events",   weight: "Conflict intensity sub-score",    stage: "Stress scoring"      },
  { signal: "FEWS NET IPC estimate",   weight: "IPC phase sub-score",             stage: "Stress scoring"      },
  { signal: "WFP VAM food access",     weight: "Food access sub-score",           stage: "Stress scoring"      },
  { signal: "FEWS NET market prices",  weight: "Market deviation sub-score",      stage: "Stress scoring"      },
  { signal: "IPC cadre outcome",       weight: "Ground-truth for grading",        stage: "Calibration (T+90d)" },
  { signal: "UNHCR displacement",      weight: "HGE hypothesis corroboration",    stage: "Hypothesis generation"},
];

export default function DataPage() {
  const th = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--parchment)", background: "var(--ink)", padding: "10px 14px", textAlign: "left" as const, fontWeight: 500 };

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Signal Coverage
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Data Sources</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          CERES ingests eight open data streams covering rainfall, vegetation, conflict, food access, market prices, and displacement. All sources are publicly available. No proprietary data is used.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-light)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[type], display: "inline-block", flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px" }}>

        {/* Source cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "48px 0 48px" }}>
          {SOURCES.map(({ id, full, provider, cadence, latency, resolution, vars, url, type }) => (
            <div key={id} style={{ background: "white", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[type], display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--ink)", letterSpacing: "0.04em" }}>{id}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 6px", background: "var(--parchment-dark)", color: "var(--ink-light)", border: "1px solid var(--border-light)" }}>
                      {TYPE_LABELS[type]}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.4 }}>{full}</div>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--earth)", textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.08em", marginTop: 2 }}>
                  Source ↗
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "12px 0", padding: "12px 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
                {[
                  { label: "Provider",    val: provider   },
                  { label: "Cadence",     val: cadence    },
                  { label: "Latency",     val: latency    },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 6 }}>Variables Used</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {vars.map((v) => (
                    <span key={v} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-mid)", background: "var(--parchment-dark)", border: "1px solid var(--border-light)", padding: "2px 7px" }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>Spatial Resolution</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{resolution}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline usage table */}
        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 48 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Pipeline Integration</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>How Each Signal Is Used</h2>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 24, lineHeight: 1.75, maxWidth: 640 }}>
            Each data stream feeds into a specific stage of the CERES pipeline. Sub-scores are combined into a composite stress score which drives the probabilistic forecast. See the <a href="/methodology" style={{ color: "var(--earth)", textDecoration: "none" }}>Methodology</a> page for full mathematical specification.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Signal", "Role in Pipeline", "Stage"].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {PIPELINE_USE.map(({ signal, weight, stage }, i) => (
                <tr key={signal} style={{ background: i % 2 === 1 ? "white" : "transparent" }}>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>{signal}</td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)", color: "var(--ink-mid)" }}>{weight}</td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", padding: "2px 7px", background: "var(--parchment-dark)", color: "var(--ink-light)", border: "1px solid var(--border-light)" }}>
                      {stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data principles */}
        <div style={{ margin: "48px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { title: "100% Open Data",      body: "Every source used by CERES is publicly available and free to access. No proprietary or licensed data is used in the pipeline." },
            { title: "Source Provenance",   body: "Every prediction stores the data retrieval timestamps for all eight sources. Full audit trail from raw signal to probability estimate." },
            { title: "Latency Transparency", body: "Data latency for each source is published here. Known latency constraints are explicitly modelled as limitations in forecast uncertainty." },
          ].map(({ title, body }) => (
            <div key={title} style={{ background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.65, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

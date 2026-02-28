"use client";

import { useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const TOC = [
  { id: "overview",     label: "Overview" },
  { id: "pipeline",     label: "Pipeline Architecture" },
  { id: "hge",          label: "HGE Engine" },
  { id: "model",        label: "Probabilistic Model" },
  { id: "tiers",        label: "Tier Classification" },
  { id: "calibration",  label: "Calibration" },
  { id: "limitations",  label: "Limitations" },
  { id: "citation",     label: "Citation" },
];

const PIPELINE_STEPS = [
  { n: "1", title: "Signal Ingestion",          desc: "Eight data adapters ingest satellite, conflict, market, and displacement streams. Each adapter normalises its source to a shared 0.25° spatial grid (~28km cells) and ISO-week temporal cadence. Raw data is cached with source provenance and retrieval timestamp." },
  { n: "2", title: "Stress Scoring",            desc: "Per-Admin1 composite stress scores are computed as a weighted sum across six sub-scores: drought stress, vegetation anomaly, conflict intensity, food access, IPC phase, and market price deviation. Weights are learned from the retrospective validation set (2022–2025)." },
  { n: "3", title: "HGE — Hierarchical Grounding Engine", desc: "Elevated signals are clustered into ranked driver hypotheses. Each hypothesis identifies a primary causal mechanism (e.g. conflict-driven market failure), supporting evidence records, and a confidence weight. Up to three hypotheses are generated per region per run." },
  { n: "4", title: "Probabilistic Forecast",    desc: "A logistic regression model converts composite stress scores into P(IPC Phase 3+) at a 90-day horizon. Bootstrap resampling (n=2,000) generates calibrated 90% confidence intervals. Both the point estimate and the full CI are reported for every prediction." },
  { n: "5", title: "Tier Classification",       desc: "Predictions are assigned to one of three alert tiers based on probability thresholds. Tier assignment triggers downstream alerting and determines the urgency framing in intelligence reports." },
  { n: "6", title: "Grading & Calibration",     desc: "At T+90 days, each prediction is graded against the published IPC outcome for that region-month. Brier scores, CI coverage, and precision/recall metrics are updated continuously. Calibration failures trigger model review." },
];

const ARCHETYPES = [
  { type: "Conflict-driven",    signals: "ACLED, FEWS NET, UNHCR",       regions: "Sudan, Somalia, Yemen, South Sudan" },
  { type: "Climate-driven",     signals: "CHIRPS, MODIS NDVI, FAO GIEWS", regions: "Sahel, Horn (off-conflict seasons)" },
  { type: "Economic/market",    signals: "WFP VAM, FEWS NET prices",      regions: "Urban centres, import-dependent regions" },
  { type: "Multi-causal",       signals: "All streams",                   regions: "Active conflict zones with drought overlay" },
];

const TIERS = [
  { color: "var(--crisis)",  name: "Tier I · Critical", thresh: "> 90%",   desc: "IPC Phase 4–5 (Emergency or Famine) probable within 90 days. Immediate humanitarian pre-positioning recommended." },
  { color: "var(--warning)", name: "Tier II · Warning", thresh: "70–90%",  desc: "IPC Phase 3 (Crisis) likely within 90 days. Enhanced monitoring and contingency planning indicated." },
  { color: "var(--watch)",   name: "Tier III · Watch",  thresh: "50–70%",  desc: "Elevated risk of IPC Phase 3 deterioration. Situational monitoring and early preparedness recommended." },
];

const METRICS = [
  { val: "0.087", label: "Brier Score",        note: "Target <0.10 ✓ — Lower is better. Equivalent to well-calibrated probabilistic weather forecasting." },
  { val: "91.2%", label: "CI Coverage (90%)",  note: "Target >88% ✓ — Empirical proportion of true outcomes within stated 90% CI." },
  { val: "0.84",  label: "Tier-I Precision",   note: "Target >0.80 ✓ — Of Tier-I alerts issued, 84% correctly preceded IPC Phase 3+ outcomes." },
  { val: "0.91",  label: "Tier-I Recall",      note: "Target >0.85 ✓ — Of IPC Phase 3+ events that occurred, 91% were preceded by a Tier-I alert." },
];

export default function MethodologyPage() {
  const tocRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          Object.values(tocRefs.current).forEach((el) => {
            if (el) el.style.color = "var(--ink-light)";
            if (el) el.style.borderLeftColor = "transparent";
          });
          const el = tocRefs.current[e.target.id];
          if (el) { el.style.color = "var(--earth)"; el.style.borderLeftColor = "var(--earth)"; }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const s = { fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.85 } as const;

  return (
    <div style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="topo-texture">
      <SiteNav />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Technical Documentation
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>How CERES Works</h1>
        <p style={{ fontSize: 18, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          A complete description of the pipeline, modelling approach, calibration methodology, and tier classification system used to generate 90-day probabilistic famine forecasts.
        </p>
      </div>

      {/* Content grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "200px 1fr", padding: "0 40px", alignItems: "start" }}>

        {/* TOC */}
        <nav style={{ position: "sticky", top: 64, padding: "48px 32px 48px 0", borderRight: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 16 }}>Contents</div>
          {TOC.map(({ id, label }) => (
            <a key={id} href={`#${id}`} ref={(el) => { tocRefs.current[id] = el; }} style={{
              display: "block", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em",
              color: "var(--ink-light)", textDecoration: "none", padding: "6px 0 6px 10px",
              borderLeft: "2px solid transparent", marginLeft: -10, transition: "all 0.15s", lineHeight: 1.4,
            }}>
              {label}
            </a>
          ))}
        </nav>

        {/* Article */}
        <article ref={articleRef} style={{ padding: "48px 0 80px 56px" }}>

          <section id="overview" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 1 — Overview</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>The 90-Day Lead Time Problem</h2>
            <p style={s}>Existing humanitarian early warning systems — including FEWS NET and IPC cadres — provide effective lead times of <strong style={{ color: "var(--ink)" }}>30–45 days</strong> before a food crisis reaches emergency thresholds. Pre-positioning food aid, mobilising logistics, and securing emergency funding through multilateral mechanisms requires a minimum of <strong style={{ color: "var(--ink)" }}>60–90 days</strong>.</p>
            <p style={s}>CERES is designed to close this gap. It produces <strong style={{ color: "var(--ink)" }}>falsifiable, probabilistic 90-day forecasts</strong> of acute food insecurity, expressed as P(IPC Phase 3+) — the probability that a monitored region will reach crisis-level hunger within 90 days — with explicit calibrated confidence intervals.</p>
            <div style={{ borderLeft: "3px solid var(--crisis)", background: "#FEFCF7", border: "1px solid var(--border-light)", borderLeftWidth: 3, borderLeftColor: "var(--crisis)", padding: "16px 20px", margin: "24px 0" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--crisis)", marginBottom: 6 }}>Operational Scope</div>
              <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0 }}>CERES predictions are research outputs intended to augment — not replace — field-based IPC assessments and expert humanitarian judgement. All forecasts carry explicit uncertainty quantification and should be interpreted alongside ground-truth verification.</p>
            </div>
            <p style={s}>The system ingests eight open data streams covering rainfall, vegetation, conflict, food access, market prices, and displacement. These are synthesised by the <strong style={{ color: "var(--ink)" }}>Hierarchical Grounding Engine (HGE)</strong> into ranked driver hypotheses, which feed a calibrated logistic model producing probabilistic risk scores at Admin1 resolution across 121 administrative units in 15 countries.</p>
          </section>

          <section id="pipeline" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 2 — Pipeline Architecture</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Six-Stage Processing Pipeline</h2>
            <p style={s}>Each pipeline run proceeds through six sequential stages. The run identifier (e.g. <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>CERES-20260228-160603</span>) is recorded with every prediction, enabling complete reproducibility and audit.</p>
            <div style={{ border: "1px solid var(--border)", margin: "32px 0" }}>
              {PIPELINE_STEPS.map(({ n, title, desc }, i) => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "56px 1fr", borderBottom: i < 5 ? "1px solid var(--border-light)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--earth)", borderRight: "1px solid var(--border-light)", background: "var(--parchment-dark)", padding: "20px 0" }}>{n}</div>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", marginBottom: 4, fontWeight: 500 }}>{title}</div>
                    <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="hge" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 3 — Hypothesis Generation Engine</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>The HGE: From Signals to Hypotheses</h2>
            <p style={s}>The Hierarchical Grounding Engine (HGE) is the core intelligence layer that distinguishes CERES from threshold-based early warning systems. Rather than flagging when a single indicator crosses a threshold, HGE synthesises multi-source signal convergence into causal hypotheses — ranked, evidenced explanations of <em>why</em> risk is elevated.</p>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, margin: "32px 0 12px" }}>Signal Convergence Detection</h3>
            <p style={s}>HGE monitors for simultaneous stress elevation across independent data streams. When two or more signals from different domains (e.g. CHIRPS rainfall deficit + ACLED conflict escalation + WFP VAM food access deterioration) converge on the same Admin1 region in the same time window, this constitutes a convergence event — a materially stronger signal than any single indicator in isolation.</p>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, margin: "32px 0 12px" }}>Hypothesis Taxonomy</h3>
            <p style={s}>Each convergence event is classified into one of four primary causal archetypes:</p>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "24px 0", fontSize: 13 }}>
              <thead>
                <tr>{["Archetype","Primary Signals","Typical Regions"].map(h=><th key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--parchment)", background: "var(--ink)", padding: "10px 14px", textAlign: "left", fontWeight: 500 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {ARCHETYPES.map(({ type, signals, regions }, i) => (
                  <tr key={type} style={{ background: i % 2 === 1 ? "white" : "transparent" }}>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)", fontWeight: 600, color: "var(--ink)" }}>{type}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{signals}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)", color: "var(--ink-mid)" }}>{regions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, margin: "32px 0 12px" }}>Evidence Records</h3>
            <p style={s}>Every hypothesis is grounded in structured evidence records — individual signal observations that either support or contradict the hypothesis. Each record specifies: source, variable name, observed value, baseline threshold, deviation direction, and a binary support/contradict verdict.</p>
            <div style={{ borderLeft: "3px solid var(--watch)", background: "#FEFCF7", border: "1px solid var(--border-light)", borderLeftWidth: 3, borderLeftColor: "var(--watch)", padding: "16px 20px", margin: "24px 0" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--watch)", marginBottom: 6 }}>Design Principle</div>
              <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0 }}>HGE never produces a prediction without an auditable evidence chain. Every probability estimate has a traceable hypothesis. Every hypothesis has traceable evidence records. This is a deliberate design constraint — it is what makes CERES predictions defensible to institutional reviewers.</p>
            </div>
          </section>

          <section id="model" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 4 — Probabilistic Model</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Logistic Model & Confidence Intervals</h2>
            <p style={s}>CERES uses a calibrated logistic regression model to convert composite stress scores into IPC Phase 3+ exceedance probabilities at a 90-day horizon. The choice of logistic regression is deliberate: it is well-understood, natively probabilistic, and produces outputs that are straightforwardly interpretable by non-technical reviewers.</p>
            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "20px 24px", margin: "24px 0", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", lineHeight: 2 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Core Model</div>
              P(IPC 3+ | X, t+90) = σ(β₀ + β₁·CSS + β₂·conflict + β₃·NDVI_anomaly + β₄·rainfall_SPI + β₅·IPC_current)<br />
              <br />
              <span style={{ color: "var(--ink-light)" }}>where σ is the logistic function, CSS is the composite stress score,<br />and coefficients β are estimated on the 2022–2025 retrospective validation set.</span>
            </div>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, margin: "32px 0 12px" }}>Bootstrap Confidence Intervals</h3>
            <p style={s}>Point estimates alone are insufficient for humanitarian decision-making. CERES generates 90% confidence intervals via non-parametric bootstrap resampling with n=2,000 replications. This captures both model parameter uncertainty and data variability, producing intervals that reflect genuine epistemic uncertainty.</p>
            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "20px 24px", margin: "24px 0", fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", lineHeight: 2 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>CI Construction</div>
              CI₉₀ = [P̂₅, P̂₉₅] where P̂ₖ is the k-th percentile of the bootstrap distribution<br />
              n_bootstrap = 2,000 · Empirical coverage = 91.2% (target: ≥88%)
            </div>
          </section>

          <section id="tiers" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 5 — Tier Classification</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Alert Tier Definitions</h2>
            <p style={s}>Predictions are assigned to one of three alert tiers based on the point estimate of P(IPC Phase 3+). Tier thresholds are calibrated to IPC phase transition probabilities estimated from the validation dataset.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "24px 0" }}>
              {TIERS.map(({ color, name, thresh, desc }) => (
                <div key={name} style={{ border: "1px solid var(--border)", padding: 20, background: "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, color }}>{name}</span>
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color, marginBottom: 6 }}>{thresh}</div>
                  <p style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.5, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ borderLeft: "3px solid var(--crisis)", background: "#FEFCF7", border: "1px solid var(--border-light)", borderLeftWidth: 3, borderLeftColor: "var(--crisis)", padding: "16px 20px", margin: "24px 0" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--crisis)", marginBottom: 6 }}>Important</div>
              <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0 }}>Tier I classification does not constitute a famine declaration. Only the IPC Global Platform, through its established cadre process and field verification, has the mandate to declare famine (IPC Phase 5). CERES Tier I indicates a probability of reaching Phase 3 or above.</p>
            </div>
          </section>

          <section id="calibration" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 6 — Validation & Calibration</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Model Performance</h2>
            <p style={s}>CERES is validated against 847 region-months of published IPC outcomes spanning six countries and three famine-grade events between 2022 and 2025. Four performance targets are set and continuously tracked.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
              {METRICS.map(({ val, label, note }) => (
                <div key={label} style={{ background: "white", padding: 20 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
                  <p style={{ fontSize: 12, color: "var(--ink-light)", margin: 0 }}>{note}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="limitations" style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 7 — Limitations</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Known Limitations & Constraints</h2>
            {[
              { title: "Data Latency",           body: "Several input streams (IPC, FAO GIEWS) are updated bi-annually or monthly. Between updates, predictions rely on interpolated or lagged data, which may not capture rapidly deteriorating situations driven by sudden shocks (conflict escalation, flash flooding)." },
              { title: "Admin1 Resolution",       body: "Predictions are generated at Admin1 (provincial) level. Intra-provincial heterogeneity — particularly in large regions like Oromia (Ethiopia) or Jonglei (South Sudan) — may be significant. Admin1 classifications mask sub-national variation that field assessments would capture." },
              { title: "Model Transferability",   body: "The logistic model is trained on six countries in the Horn of Africa and Arabian Peninsula. Performance in geographically or structurally distinct contexts (South Asia, Central America) has not been validated and should not be assumed." },
              { title: "Conflict Dynamics",       body: "ACLED conflict data captures reported events with variable reporting lag. In active conflict zones, the most acute areas may be the least reported. CERES may systematically under-estimate risk in media-dark conflict environments." },
            ].map(({ title, body }) => (
              <div key={title}>
                <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, margin: "32px 0 12px" }}>{title}</h3>
                <p style={s}>{body}</p>
              </div>
            ))}
            <div style={{ borderLeft: "3px solid var(--watch)", background: "#FEFCF7", border: "1px solid var(--border-light)", borderLeftWidth: 3, borderLeftColor: "var(--watch)", padding: "16px 20px", margin: "24px 0" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--watch)", marginBottom: 6 }}>Transparency Commitment</div>
              <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0 }}>This limitations section is intentionally complete. CERES is an open system. Reviewers, funders, and operational partners are encouraged to scrutinise these constraints and communicate additional concerns to the Northflow research team.</p>
            </div>
          </section>

          <section id="citation" style={{ marginBottom: 0, paddingBottom: 0 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 10 }}>§ 8 — Citation</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>How to Cite CERES</h2>
            <p style={s}>If you reference CERES predictions or methodology in published work, please use the following citation format. An arXiv pre-print describing the full methodology and validation dataset is forthcoming.</p>
            <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "20px 24px", margin: "24px 0", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", lineHeight: 1.8 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Preferred Citation</div>
              Northflow Technologies (2026). <em>CERES: Calibrated Early-warning & Risk Evaluation System — A Probabilistic Famine Forecasting System.</em> Technical Report. Northflow Technologies. https://ceres.northflow.no/methodology
            </div>
          </section>

        </article>
      </div>
      <SiteFooter />
    </div>
  );
}

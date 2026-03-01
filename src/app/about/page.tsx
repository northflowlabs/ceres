"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const ADAPTERS = [
  { color: "var(--watch)",   name: "MARVIS — Maritime",       desc: "Maritime AI Validation & Intelligence System · EIC proposal" },
  { color: "var(--watch)",   name: "GAIA — Climate",          desc: "Earth systems intelligence · Active" },
  { color: "var(--warning)", name: "ORION — Conflict",        desc: "Conflict reconstruction intelligence · Ukraine focus · Active" },
  { color: "var(--watch)",   name: "Medical / Biotech",       desc: "Arrhythmia & drug discovery · EIC proposal" },
  { color: "var(--earth)",   name: "CERES — Famine Intelligence", desc: "This system · HGE Adapter #5 · Live" },
];

const STATS = [
  { num: "90d",   label: "Forecast Horizon",        note: "vs. 30–45 days for existing EWS" },
  { num: "847",   label: "Validation Observations",  note: "Region-months, 2022–2025, 6 countries" },
  { num: "0.087", label: "Brier Score",              note: "Target <0.10 — all 4 metrics met" },
  { num: "8",     label: "Data Sources",             note: "CHIRPS · MODIS · ACLED · IPC · FEWS NET · WFP VAM · FAO · UNHCR" },
];

const p = { fontSize: 15, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.85 } as const;

export default function AboutPage() {
  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* HERO */}
      <div className="about-hero" style={{ borderBottom: "1px solid var(--border)", padding: "80px 40px", maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 380px", gap: 80, alignItems: "start" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
            About CERES
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>Built to close the humanitarian lead-time gap</h1>
          <p style={p}>CERES was built because the gap between when a famine becomes predictable and when the humanitarian system acts is measured in lives. Current early warning systems provide 30–45 days of actionable lead time. Pre-positioning food aid, mobilising logistics, and securing emergency funding requires 60–90 days.</p>
          <p style={p}>CERES is an open, falsifiable, probabilistic forecasting system that synthesises eight data streams into calibrated 90-day famine risk predictions — designed to give the humanitarian system the lead time it currently lacks.</p>
          <p style={p}>It is free. It is open. Its methodology is published. Its predictions are timestamped and graded against outcomes. It is built to be scrutinised.</p>
        </div>
        <div style={{ border: "1px solid var(--border)", background: "white", padding: 32 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 24 }}>System at a Glance</div>
          {STATS.map(({ num, label, note }, i) => (
            <div key={label} style={{ marginBottom: i < 3 ? 24 : 0, paddingBottom: i < 3 ? 24 : 0, borderBottom: i < 3 ? "1px solid var(--border-light)" : "none" }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{num}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MISSION BLOCK */}
      <div style={{ background: "var(--ink)", color: "var(--parchment)", padding: "60px 40px" }}>
        <div className="about-missions" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716C", marginBottom: 16 }}>Mission</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 400, fontStyle: "italic", lineHeight: 1.4, color: "var(--parchment)" }}>
              &ldquo;Give the humanitarian system the <strong style={{ fontStyle: "normal", fontWeight: 700, color: "var(--warning)" }}>lead time</strong> it needs to act before a food crisis becomes a famine.&rdquo;
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { title: "Open by design",            body: "The methodology is published. The code is public. Every prediction is timestamped and graded against real-world outcomes. We built CERES to be examined — by scientists, by funders, by the people whose lives depend on getting this right." },
              { title: "Calibrated, not overconfident", body: "CERES never gives you a single number and calls it certainty. Every forecast carries a 90% confidence interval, built from 2,000 bootstrap replications. Honest uncertainty is more useful to a humanitarian programme officer than false precision." },
              { title: "Built to be proven wrong",  body: "Every prediction CERES issues is publicly recorded before the outcome is known. If we are wrong, it is visible. That is not a vulnerability — it is the point. A forecast system that cannot be falsified is not a forecast system." },
            ].map(({ title, body }) => (
              <div key={title} style={{ borderLeft: "2px solid #44403C", paddingLeft: 16 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A29E", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: "#78716C", lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content-wrap" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px" }}>

        {/* HGE Platform */}
        <div className="content-two-col" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 60, padding: "64px 0", borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Northflow Technologies</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>The HGE Platform</h2>
            <p style={p}>CERES is built on the <strong style={{ color: "var(--ink)" }}>Hypothesis Generation Engine (HGE)</strong> — AI-native infrastructure developed by Northflow Technologies for institutional-grade intelligence across complex, data-rich domains.</p>
            <p style={p}>HGE is designed to do one thing: synthesise multi-source signals into ranked, evidenced, falsifiable hypotheses. It is not a dashboard. It is not a threshold alert system. It is a system that reads the evidence and tells you — with calibrated confidence — what it thinks is happening and why.</p>
            <p style={p}>CERES is HGE Adapter #5. Each adapter applies the same hypothesis engine to a different domain. The same rigour. The same calibration standards. The same commitment to auditable reasoning.</p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>HGE Adapter Family</div>
            <div style={{ border: "1px solid var(--border)" }}>
              {ADAPTERS.map(({ color, name, desc }, i) => (
                <div key={name} style={{ display: "grid", gridTemplateColumns: "auto 1fr", borderBottom: i < 4 ? "1px solid var(--border-light)" : "none" }}>
                  <div style={{ padding: 16, background: "var(--parchment-dark)", borderRight: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.06em", marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scope & Limits */}
        <div className="content-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, padding: "64px 0", borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Scope &amp; Limits</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>What CERES Is Not</h2>
            <p style={p}>CERES is a research and early warning tool. It is <strong style={{ color: "var(--ink)" }}>not</strong> an operational replacement for IPC field assessments, humanitarian programme decisions, or famine declarations.</p>
            <p style={p}>Only the IPC Global Platform, through its established cadre process and field verification, has the mandate to declare famine (IPC Phase 5). A CERES Tier I prediction indicates a high probability of reaching IPC Phase 3+ — a signal for preparedness, not a declaration.</p>
            <p style={p}>CERES predictions should be interpreted alongside, not instead of, FEWS NET situation reports, WFP VAM assessments, and field-based humanitarian intelligence.</p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Institutional Context</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Designed for Institutional Review</h2>
            <p style={p}>Every design decision in CERES — from the calibrated confidence intervals to the publicly timestamped prediction ledger to the published limitations section — is made with institutional reviewers in mind.</p>
            <p style={p}>The system is designed to be reviewed by WFP technical staff, FAO analysts, EU ECHO programme officers, academic food security researchers, and independent funders. It is built to withstand scrutiny, not to impress with outputs.</p>
            <p style={p}>CERES is live as of 28 February 2026. Predictions are timestamped and graded against IPC outcomes at T+90 days. Retrospective validation covers 847 region-months across six countries. Forward validation is ongoing and publicly visible in the <a href="/validation" style={{ color: "var(--earth)", textDecoration: "none" }}>Validation Ledger</a>. An arXiv pre-print describing the full methodology is in preparation.</p>
          </div>
        </div>

        {/* Contact */}
        <div style={{ padding: "64px 0", borderBottom: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Get In Touch</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Institutional Collaboration &amp; Access</h2>
          <p style={{ ...p, maxWidth: 600 }}>CERES is an open system seeking institutional partners for validation, deployment, and co-development. If you represent a humanitarian organisation, research institution, or funding body, we welcome your engagement.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
            {[
              { label: "Research & Academic",        title: "Methodology Review",     body: "For peer review, co-authorship, or academic collaboration on the validation dataset."               },
              { label: "Humanitarian Organisations", title: "Operational Partnership", body: "WFP, FAO, OCHA, NGOs — for data sharing, co-validation, or integration into existing EWS workflows." },
              { label: "Funders & Institutions",     title: "Programme Funding",      body: "For foundation programme officers, EU funding bodies, and institutional investors in humanitarian AI."  },
            ].map(({ label, title, body }) => (
              <div key={title} style={{ background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
          <a href="mailto:ceres@northflow.no" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
            background: "var(--ink)", color: "var(--parchment)",
            padding: "12px 24px", marginTop: 4,
          }}>
            ceres@northflow.no → Get in touch
          </a>
        </div>

        {/* Partners */}
        <div style={{ padding: "64px 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Institutional Partners</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Validation &amp; Partnership</h2>
          <p style={{ ...p, maxWidth: 600 }}>CERES is actively seeking institutional co-validation partners. The following organisations are priority engagement targets.</p>
          <div style={{ border: "1px dashed var(--border)", padding: 32, textAlign: "center", background: "white" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Partnership Status — 2026</div>
            <div style={{ fontSize: 14, color: "var(--ink-light)", fontStyle: "italic" }}>WFP Innovation Accelerator · FAO GIEWS · EU ECHO · USAID FEWS NET · IFPRI<br />Engagement in progress — co-validation partnerships forthcoming.</div>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

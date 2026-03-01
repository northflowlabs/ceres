"use client";

import { useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const TOC = [
  { id: "access",      label: "Access Tiers"    },
  { id: "base",        label: "Base URL"         },
  { id: "predictions", label: "Predictions"      },
  { id: "hypotheses",  label: "Hypotheses"       },
  { id: "admin1",      label: "Admin1"           },
  { id: "formats",     label: "Response Format"  },
  { id: "attribution", label: "Attribution"      },
];

const TIERS = [
  {
    tier: "Tier A", name: "Open Research", price: "Free",
    features: ["All prediction endpoints","All hypothesis data","Admin1 signal breakdown","100 requests / day","Academic & NGO use"],
  },
  {
    tier: "Tier B", name: "Institutional", price: "€500–2,000 / month",
    features: ["All Open Research features","5,000 requests / day","Webhook alerts on Tier-I events","White-label PDF reports","Dedicated support"],
  },
  {
    tier: "Tier C", name: "Sovereign / Custom", price: "Contact us",
    features: ["All Institutional features","Unlimited requests","Custom region coverage","Private deployment option","SLA & integration support"],
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ background: "#1C1917", border: "1px solid var(--border)", padding: 20, overflowX: "auto", margin: 0, borderTop: "none" }}>
      <code style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, color: "#D4C5A9", display: "block" }}>
        {children}
      </code>
    </pre>
  );
}

function Endpoint({ method, path, desc, children }: { method: string; path: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--parchment-dark)", border: "1px solid var(--border)", padding: "10px 14px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, padding: "3px 8px", background: "#E8F5E9", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.2)" }}>{method}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)" }}>{path}</span>
        <span style={{ fontSize: 12, color: "var(--ink-light)", marginLeft: "auto" }}>{desc}</span>
      </div>
      <Code>{children}</Code>
    </div>
  );
}

// Coloured spans for code syntax
function Str({ children }: { children: React.ReactNode }) { return <span style={{ color: "#F4A261" }}>{children}</span>; }
function Key({ children }: { children: React.ReactNode }) { return <span style={{ color: "#9ECBFF" }}>{children}</span>; }
function Num({ children }: { children: React.ReactNode }) { return <span style={{ color: "#79C0FF" }}>{children}</span>; }
function Cm({ children }: { children: React.ReactNode })  { return <span style={{ color: "#6E7681" }}>{children}</span>; }

const sectionLabel = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--earth)", marginBottom: 10 };
const h2Style = { fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginBottom: 14, lineHeight: 1.2 };
const h3Style = { fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, margin: "28px 0 10px" };
const pStyle  = { color: "var(--ink-mid)", fontSize: 14, marginBottom: 12, lineHeight: 1.75 };
const section = { marginBottom: 56, paddingBottom: 56, borderBottom: "1px solid var(--border-light)" };

export default function ApiAccessPage() {
  const tocRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          Object.values(tocRefs.current).forEach((el) => {
            if (el) { el.style.color = "var(--ink-light)"; el.style.borderLeftColor = "transparent"; }
          });
          const el = tocRefs.current[e.target.id];
          if (el) { el.style.color = "var(--earth)"; el.style.borderLeftColor = "var(--earth)"; }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav ctaHref="mailto:ceres@northflow.no" ctaLabel="Request Access →" />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Developer &amp; Institutional Access
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>CERES API</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
          Programmatic access to CERES predictions, hypotheses, and Admin1 signal data. Free for academic and humanitarian use. Institutional tiers available for organisations requiring higher volume or custom integration.
        </p>
      </div>

      {/* Content grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, alignItems: "start" }}>

        {/* Sidebar TOC */}
        <nav style={{ position: "sticky", top: 64, padding: "48px 32px 48px 0", borderRight: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 12 }}>Contents</div>
          {TOC.map(({ id, label }) => (
            <a key={id} href={`#${id}`} ref={(el) => { tocRefs.current[id] = el; }} style={{
              display: "block", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em",
              color: "var(--ink-light)", textDecoration: "none", padding: "5px 0 5px 10px",
              borderLeft: "2px solid transparent", marginLeft: -10, transition: "all 0.15s", lineHeight: 1.4,
            }}>
              {label}
            </a>
          ))}
        </nav>

        {/* Article */}
        <article style={{ padding: "48px 0 48px 56px" }}>

          <section id="access" style={section}>
            <div style={sectionLabel}>§ 1 — Access</div>
            <h2 style={h2Style}>Access Tiers</h2>
            <p style={pStyle}>CERES API access is free for academic institutions and humanitarian organisations. All tiers share the same endpoints and data quality — the difference is rate limits and support.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
              {TIERS.map(({ tier, name, price, features }) => (
                <div key={tier} style={{ background: "white", padding: 24 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>{tier}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--earth)", marginBottom: 12 }}>{price}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {features.map((f) => (
                      <li key={f} style={{ fontSize: 12, color: "var(--ink-mid)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                        <span style={{ color: "var(--watch)", fontFamily: "var(--mono)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-light)" }}>
              To request API access, email <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a> with your organisation name and intended use. Academic and humanitarian requests are approved within 48 hours.
            </p>
          </section>

          <section id="base" style={section}>
            <div style={sectionLabel}>§ 2 — Base URL</div>
            <h2 style={h2Style}>Connection</h2>
            <Code>
              <Cm># Production{"\n"}</Cm>
              {"Base URL: "}<Str>https://ceres.northflow.no/api</Str>{"\n\n"}
              <Cm># All endpoints require the version prefix{"\n"}</Cm>
              {"GET "}<Str>https://ceres.northflow.no/api/v1/predictions</Str>{"\n\n"}
              <Cm># Authentication (Tier B/C){"\n"}</Cm>
              {"Authorization: Bearer "}<Str>YOUR_API_KEY</Str>{"\n\n"}
              <Cm># Open Research: no authentication required{"\n"}</Cm>
              {"GET "}<Str>https://ceres.northflow.no/api/v1/predictions</Str>
            </Code>
          </section>

          <section id="predictions" style={section}>
            <div style={sectionLabel}>§ 3 — Endpoints</div>
            <h2 style={h2Style}>Predictions</h2>

            <Endpoint method="GET" path="/v1/predictions" desc="All active regional forecasts">
              <Cm># Returns all monitored regions with current forecast{"\n"}</Cm>
              {"GET /v1/predictions?tier=1&format=json\n\n"}
              <Cm># Response{"\n"}</Cm>
              {"{\n"}
              {"  "}<Key>"run_id"</Key>{": "}<Str>"CERES-20260228-160603"</Str>{",\n"}
              {"  "}<Key>"generated_at"</Key>{": "}<Str>"2026-02-28T16:06:03Z"</Str>{",\n"}
              {"  "}<Key>"horizon_days"</Key>{": "}<Num>90</Num>{",\n"}
              {"  "}<Key>"predictions"</Key>{": [\n"}
              {"    {\n"}
              {"      "}<Key>"region_id"</Key>{": "}<Str>"SDN"</Str>{",\n"}
              {"      "}<Key>"region_name"</Key>{": "}<Str>"Sudan"</Str>{",\n"}
              {"      "}<Key>"p_ipc3_plus"</Key>{": "}<Num>0.966</Num>{",\n"}
              {"      "}<Key>"ci_lower"</Key>{": "}<Num>0.923</Num>{",\n"}
              {"      "}<Key>"ci_upper"</Key>{": "}<Num>0.984</Num>{",\n"}
              {"      "}<Key>"tier"</Key>{": "}<Num>1</Num>{",\n"}
              {"      "}<Key>"composite_stress"</Key>{": "}<Num>0.51</Num>{",\n"}
              {"      "}<Key>"primary_driver"</Key>{": "}<Str>"conflict"</Str>{"\n"}
              {"    }\n"}
              {"  ]\n}"}
            </Endpoint>

            <Endpoint method="GET" path="/v1/predictions/{region_id}" desc="Single region detail">
              {"GET /v1/predictions/SDN\n\n"}
              <Cm># Returns full prediction with hypothesis IDs{"\n"}</Cm>
              {"{\n"}
              {"  "}<Key>"region_id"</Key>{": "}<Str>"SDN"</Str>{",\n"}
              {"  "}<Key>"p_ipc3_plus"</Key>{": "}<Num>0.966</Num>{",\n"}
              {"  "}<Key>"p_ipc4_plus"</Key>{": "}<Num>0.676</Num>{",\n"}
              {"  "}<Key>"ci_lower"</Key>{": "}<Num>0.923</Num>{",\n"}
              {"  "}<Key>"ci_upper"</Key>{": "}<Num>0.984</Num>{",\n"}
              {"  "}<Key>"hypothesis_ids"</Key>{": ["}<Str>"H-SDN-001"</Str>{", "}<Str>"H-SDN-002"</Str>{", "}<Str>"H-SDN-003"</Str>{"]\n}"}
            </Endpoint>

            <h3 style={h3Style}>Query Parameters</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0", fontSize: 13 }}>
              <thead>
                <tr>{["Parameter","Type","Description"].map(h=><th key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--parchment)", background: "var(--ink)", padding: "8px 12px", textAlign: "left" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  { p: "tier",   t: "optional", d: "Filter by tier: 1, 2, or 3" },
                  { p: "format", t: "optional", d: "json (default) or csv" },
                  { p: "run_id", t: "optional", d: "Retrieve a specific historical run" },
                ].map(({ p, t, d }, i) => (
                  <tr key={p} style={{ background: i % 2 === 1 ? "white" : "transparent" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-light)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{p}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-light)" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", background: "var(--parchment-dark)", padding: "1px 5px" }}>{t}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-light)", color: "var(--ink-mid)" }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="hypotheses" style={section}>
            <h2 style={h2Style}>Hypotheses</h2>
            <Endpoint method="GET" path="/v1/hypotheses/{id}" desc="Full hypothesis with evidence records">
              {"GET /v1/hypotheses/H-SDN-001\n\n"}
              {"{\n"}
              {"  "}<Key>"id"</Key>{": "}<Str>"H-SDN-001"</Str>{",\n"}
              {"  "}<Key>"region_id"</Key>{": "}<Str>"SDN"</Str>{",\n"}
              {"  "}<Key>"rank"</Key>{": "}<Num>1</Num>{",\n"}
              {"  "}<Key>"archetype"</Key>{": "}<Str>"conflict-driven"</Str>{",\n"}
              {"  "}<Key>"confidence"</Key>{": "}<Num>0.88</Num>{",\n"}
              {"  "}<Key>"text"</Key>{": "}<Str>"Armed conflict has severely disrupted agricultural labour..."</Str>{",\n"}
              {"  "}<Key>"evidence"</Key>{": [\n"}
              {"    {\n"}
              {"      "}<Key>"source"</Key>{": "}<Str>"ACLED"</Str>{",\n"}
              {"      "}<Key>"variable"</Key>{": "}<Str>"conflict_events_4wk"</Str>{",\n"}
              {"      "}<Key>"observed"</Key>{": "}<Num>312</Num>{",\n"}
              {"      "}<Key>"threshold"</Key>{": "}<Num>50</Num>{",\n"}
              {"      "}<Key>"direction"</Key>{": "}<Str>"above"</Str>{",\n"}
              {"      "}<Key>"verdict"</Key>{": "}<Str>"SUPPORTS"</Str>{"\n"}
              {"    }\n"}
              {"  ]\n}"}
            </Endpoint>
          </section>

          <section id="admin1" style={section}>
            <h2 style={h2Style}>Admin1 Resolution</h2>
            <Endpoint method="GET" path="/v1/admin1/{country_id}" desc="Sub-national signal breakdown">
              {"GET /v1/admin1/ETH\n\n"}
              <Cm># Returns Admin1 units for Ethiopia{"\n"}</Cm>
              {"{\n"}
              {"  "}<Key>"country"</Key>{": "}<Str>"ETH"</Str>{",\n"}
              {"  "}<Key>"units"</Key>{": [\n"}
              {"    {\n"}
              {"      "}<Key>"admin1_id"</Key>{": "}<Str>"ETH-OR"</Str>{",\n"}
              {"      "}<Key>"name"</Key>{": "}<Str>"Oromia"</Str>{",\n"}
              {"      "}<Key>"composite_stress"</Key>{": "}<Num>0.61</Num>{",\n"}
              {"      "}<Key>"ipc_phase_current"</Key>{": "}<Num>3</Num>{",\n"}
              {"      "}<Key>"signals"</Key>{": { "}<Str>"chirps"</Str>{": "}<Num>-1.8</Num>{", "}<Str>"ndvi"</Str>{": "}<Num>-0.14</Num>{" ... }\n"}
              {"    }\n"}
              {"  ]\n}"}
            </Endpoint>
          </section>

          <section id="formats" style={section}>
            <div style={sectionLabel}>§ 4 — Response Format</div>
            <h2 style={h2Style}>Response Format</h2>
            <p style={pStyle}>All endpoints return JSON. Dates are ISO 8601. Probabilities are floats in [0, 1]. Confidence intervals are 90% bootstrap CIs.</p>
            <Code>
              <Cm># Standard envelope{"\n"}</Cm>
              {"{\n"}
              {"  "}<Key>"run_id"</Key>{": "}<Str>"CERES-20260228-160603"</Str>{",\n"}
              {"  "}<Key>"generated_at"</Key>{": "}<Str>"2026-02-28T16:06:03Z"</Str>{",\n"}
              {"  "}<Key>"horizon_days"</Key>{": "}<Num>90</Num>{",\n"}
              {"  "}<Key>"reference_date"</Key>{": "}<Str>"2026-02-28"</Str>{",\n"}
              {"  "}<Key>"data"</Key>{": { ... }\n}"}
            </Code>
            <Code>
              <Cm># Error envelope{"\n"}</Cm>
              {"{\n"}
              {"  "}<Key>"error"</Key>{": "}<Str>"region_not_found"</Str>{",\n"}
              {"  "}<Key>"message"</Key>{": "}<Str>"Region XYZ is not currently monitored"</Str>{",\n"}
              {"  "}<Key>"status"</Key>{": "}<Num>404</Num>{"\n}"}
            </Code>
            <p style={pStyle}>All probabilities follow the same field pattern: <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>p_ipc3plus_90d</code>, <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>ci_90_low</code>, <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>ci_90_high</code>.</p>
          </section>

          <section id="attribution" style={{ marginBottom: 0, paddingBottom: 0 }}>
            <div style={sectionLabel}>§ 5 — Attribution</div>
            <h2 style={h2Style}>Attribution Requirements</h2>
            <p style={pStyle}>All use of CERES data — whether in publications, dashboards, or operational systems — requires attribution to Northflow Technologies and CERES.</p>
            <Code>
              <Cm># Required attribution string{"\n"}</Cm>
              <Str>"Source: CERES (Calibrated Early-warning & Risk Evaluation System),{"\n"} Northflow Technologies, 2026. ceres.northflow.no"</Str>
              {"\n\n"}
              <Cm># For academic publications, also cite the methodology pre-print{"\n"}</Cm>
              <Str>"Northflow Technologies (2026). CERES: Calibrated Early-warning &{"\n"} Risk Evaluation System. arXiv:2026.XXXXX"</Str>
            </Code>
            <p style={{ ...pStyle, marginTop: 16 }}>
              CERES predictions are provided under a Creative Commons Attribution 4.0 International licence (CC BY 4.0). Commercial use requires a Tier B or C agreement.
            </p>
          </section>

        </article>
      </div>
      <SiteFooter />
    </div>
  );
}

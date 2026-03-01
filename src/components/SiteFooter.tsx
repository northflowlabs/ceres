import Link from "next/link";

const PAGES = [
  { href: "/",            label: "Dashboard"    },
  { href: "/methodology", label: "Methodology"  },
  { href: "/data",        label: "Data Sources" },
  { href: "/validation",  label: "Validation"   },
  { href: "/tracker",     label: "Track Record" },
  { href: "/api-access",  label: "API Access"   },
  { href: "/about",       label: "About"        },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "2px solid var(--ink)", background: "var(--ink)", color: "var(--parchment)", padding: 40, position: "relative", zIndex: 1, marginTop: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", marginBottom: 12 }}>CERES</div>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, margin: 0 }}>Calibrated Early-warning &amp; Risk Evaluation System</p>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, marginTop: 8 }}>Ingests satellite, conflict, and market data across 8 open sources to produce calibrated 90-day IPC Phase 3+ probability forecasts with bootstrap confidence intervals. Built on the HGE inference engine. Free for humanitarian and academic use.</p>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, marginTop: 8 }}>Open Humanitarian Intelligence<br />Northflow Technologies · 2026</p>
        </div>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", marginBottom: 12 }}>Pages</div>
          {PAGES.map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, textDecoration: "none", display: "block" }}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", marginBottom: 12 }}>Northflow Technologies</div>
          <a href="https://northflow.no" style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, textDecoration: "none", display: "block" }}>northflow.no</a>
          <a href="mailto:ceres@northflow.no" style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, textDecoration: "none", display: "block" }}>ceres@northflow.no</a>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, marginTop: 8 }}>Research-grade forecasts. Not a substitute for field-based IPC assessment or operational humanitarian decision-making.</p>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid #292524", display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 10, color: "#57534E", letterSpacing: "0.06em" }}>
        <span>CERES v0.1.0 · HGE Adapter #5 · Live since 28 Feb 2026 · arXiv pre-print in preparation</span>
        <span>© 2026 Northflow Technologies</span>
      </div>
    </footer>
  );
}

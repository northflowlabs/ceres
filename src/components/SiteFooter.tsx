import Link from "next/link";

const PAGES = [
  { href: "/",            label: "Dashboard"    },
  { href: "/impact",      label: "Impact"       },
  { href: "/tracker",     label: "Track Record" },
  { href: "/validation",  label: "Validation"   },
  { href: "/subnational", label: "Sub-national" },
  { href: "/methodology", label: "Methodology"  },
  { href: "/data",        label: "Data Sources" },
  { href: "/api-access",  label: "API Access"   },
  { href: "/embed",       label: "Embed Widget" },
  { href: "/changelog",   label: "Changelog"    },
  { href: "/about",       label: "About"        },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "2px solid var(--ink)", background: "var(--ink)", color: "var(--parchment)", padding: 40, position: "relative", zIndex: 1, marginTop: "auto" }}>
      <div className="footer-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", marginBottom: 12 }}>CERES</div>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, margin: 0 }}>Calibrated Early-warning and Risk Estimation System</p>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, marginTop: 8 }}>Automated probabilistic forecasting system for acute food insecurity. Generates 90-day ahead probability estimates of IPC Phase 3+, 4+, and 5 conditions for 43 high-risk countries, updated weekly. Fuses six data streams — CHIRPS, MODIS NDVI, ACLED, IPC, WFP VAM, and FAO/WFP — through a logistic scoring model with parametric input-perturbation intervals (n=2,000 draws). Free for humanitarian and academic use.</p>
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
          <a href="mailto:ceres@northflow.no" style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, textDecoration: "none", display: "block" }}>ceres@northflow.no</a>
          <a href="https://northflow.no" style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, textDecoration: "none", display: "block" }}>northflow.no</a>
          <p style={{ fontSize: 13, color: "#A8A29E", lineHeight: 1.8, marginTop: 8 }}>Research-grade forecasts. Not a substitute for field-based IPC assessment or operational humanitarian decision-making.</p>
        </div>
      </div>
      <div className="footer-bottom" style={{ maxWidth: 1100, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid #292524", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontFamily: "var(--mono)", fontSize: 10, color: "#57534E", letterSpacing: "0.06em" }}>
        <span>CERES v0.4.0 · HGE Adapter #5 · Live since 28 Feb 2026 · arXiv preprint in preparation</span>
        <span style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "#57534E", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/cookies" style={{ color: "#57534E", textDecoration: "none" }}>Cookies</Link>
          <Link href="/terms" style={{ color: "#57534E", textDecoration: "none" }}>Terms of Use</Link>
          <span>© 2026 Northflow Technologies</span>
        </span>
      </div>
    </footer>
  );
}

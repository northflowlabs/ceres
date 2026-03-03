import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — CERES",
  description: "Cookie Policy for CERES — Northflow Technologies AS.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ceres.northflow.no/cookies" },
};

const LAST_UPDATED = "3 March 2026";

export default function CookiesPage() {
  const h2 = { fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, marginBottom: 12, marginTop: 40, lineHeight: 1.2 } as const;
  const p  = { fontSize: 14, color: "var(--ink-mid)", marginBottom: 12, lineHeight: 1.85 } as const;
  const td = { padding: "10px 14px", borderBottom: "1px solid var(--border-light)", fontSize: 13, color: "var(--ink-mid)", verticalAlign: "top" as const };
  const th = { padding: "10px 14px", fontFamily: "var(--mono)" as const, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--parchment)", background: "var(--ink)", textAlign: "left" as const };

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Legal
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>Cookie Policy</h1>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.06em" }}>Last updated: {LAST_UPDATED}</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "48px 40px 80px", boxSizing: "border-box" }}>

        <p style={p}>
          This Cookie Policy explains what cookies CERES uses, why we use them, and how you can control them. CERES is operated by Northflow Technologies AS. For broader privacy information, see our <a href="/privacy" style={{ color: "var(--earth)" }}>Privacy Policy</a>.
        </p>

        <h2 style={h2}>1. What Are Cookies</h2>
        <p style={p}>
          Cookies are small text files stored on your device by your web browser when you visit a website. They allow the website to remember information about your visit. Some cookies are essential for the site to function; others are optional and require your consent under GDPR.
        </p>

        <h2 style={h2}>2. Cookies We Use</h2>

        <div className="table-scroll" style={{ margin: "24px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 500 }}>
            <thead>
              <tr>
                {["Cookie / Technology", "Type", "Purpose", "Duration", "Consent Required"].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Session authentication token",
                  type: "Essential",
                  purpose: "Keeps you logged in to your CERES account during a session.",
                  duration: "Session (deleted on browser close)",
                  consent: "No — essential",
                },
                {
                  name: "CSRF token",
                  type: "Essential",
                  purpose: "Protects against cross-site request forgery attacks.",
                  duration: "Session",
                  consent: "No — essential",
                },
                {
                  name: "Google Analytics 4 (_ga, _ga_*)",
                  type: "Analytics",
                  purpose: "Measures page views, session duration, and anonymous user behaviour to help us understand how CERES is used and improve the service. IP anonymisation is enabled. No personal data is shared with Google.",
                  duration: "Up to 14 months",
                  consent: "Yes — analytics consent required",
                },
                {
                  name: "Cookie consent preference",
                  type: "Functional",
                  purpose: "Stores your cookie consent decision so we do not ask repeatedly.",
                  duration: "12 months",
                  consent: "No — stores your choice",
                },
              ].map(({ name, type, purpose, duration, consent }, i) => (
                <tr key={name} style={{ background: i % 2 === 1 ? "white" : "transparent" }}>
                  <td style={{ ...td, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>{name}</td>
                  <td style={{ ...td }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "2px 7px",
                      color: type === "Essential" ? "var(--watch)" : type === "Analytics" ? "var(--earth)" : "var(--ink-light)",
                      border: `1px solid currentColor`,
                    }}>{type}</span>
                  </td>
                  <td style={td}>{purpose}</td>
                  <td style={{ ...td, fontFamily: "var(--mono)", fontSize: 11, whiteSpace: "nowrap" }}>{duration}</td>
                  <td style={{ ...td, fontFamily: "var(--mono)", fontSize: 11, color: consent.startsWith("No") ? "var(--ink-light)" : "var(--earth)" }}>{consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>3. Essential Cookies</h2>
        <p style={p}>
          Essential cookies are strictly necessary for the website to function. They enable core features such as account login and security. These cookies cannot be disabled, as doing so would break the site. No consent is required to place them under GDPR (Recital 25, ePrivacy Directive).
        </p>

        <h2 style={h2}>4. Analytics Cookies (Google Analytics 4)</h2>
        <p style={p}>
          We use Google Analytics 4 to understand how visitors use CERES — which pages are visited, how long sessions last, and what device types are used. This helps us improve the platform.
        </p>
        <p style={p}>
          GA4 analytics are only loaded if you have given consent. IP addresses are anonymised before being sent to Google. We do not use GA4 for advertising or remarketing. Google processes data under a Data Processing Addendum in compliance with GDPR.
        </p>
        <p style={p}>
          You can opt out at any time using the controls below, or by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>Google Analytics Opt-out Browser Add-on</a>.
        </p>

        <h2 style={h2}>5. How to Control Cookies</h2>
        <p style={p}>You can manage cookies in several ways:</p>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 8, lineHeight: 1.75 }}>
            <strong>Browser settings</strong> — most browsers allow you to block or delete cookies via their settings menu. Note that disabling essential cookies will prevent you from logging in.
          </li>
          <li style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 8, lineHeight: 1.75 }}>
            <strong>Google Analytics opt-out</strong> — install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>GA opt-out add-on</a>.
          </li>
          <li style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 8, lineHeight: 1.75 }}>
            <strong>Contact us</strong> — email <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a> with any cookie-related requests.
          </li>
        </ul>

        <h2 style={h2}>6. Third-Party Links</h2>
        <p style={p}>
          CERES links to external sites (FEWS NET, IPC, WFP, OCHA, etc.). These sites have their own cookie policies which we do not control. We recommend reviewing their policies separately.
        </p>

        <h2 style={h2}>7. Changes to This Policy</h2>
        <p style={p}>
          We may update this Cookie Policy when we add or remove cookies. The date at the top of this page reflects the most recent revision.
        </p>

        <h2 style={h2}>8. Contact</h2>
        <p style={p}>
          Questions about cookies or this policy: <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a>
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border-light)", display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" }}>
          <a href="/privacy" style={{ color: "var(--earth)", textDecoration: "none" }}>Privacy Policy →</a>
          <a href="/terms" style={{ color: "var(--earth)", textDecoration: "none" }}>Terms of Use →</a>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

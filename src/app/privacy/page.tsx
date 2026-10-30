import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CERES",
  description: "Privacy Policy for CERES, the Calibrated Early-warning and Risk Estimation System. Northflow Technologies AS.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ceres.northflow.no/privacy" },
};

const LAST_UPDATED = "30 October 2026";
const CONTROLLER = "Northflow Technologies AS";
const ORG_NUMBER = "936 979 815";
const EMAIL = "hello@northflow.no";
const STREET = "Jåttåveien 92";
const POSTAL_CITY = "4020 Stavanger";
const COUNTRY = "Norway";
const PHONE = "+47 95 08 50 45";
const PHONE_HREF = "tel:+4795085045";

export default function PrivacyPage() {
  const h2 = { fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, marginBottom: 12, marginTop: 40, lineHeight: 1.2 } as const;
  const p  = { fontSize: 14, color: "var(--ink-mid)", marginBottom: 12, lineHeight: 1.85 } as const;
  const li = { fontSize: 14, color: "var(--ink-mid)", marginBottom: 8, lineHeight: 1.75 } as const;

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Legal
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>Privacy Policy</h1>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.06em" }}>Last updated: {LAST_UPDATED}</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "48px 40px 80px", boxSizing: "border-box" }}>

        <p style={p}>
          This Privacy Policy explains how {CONTROLLER} (&ldquo;Northflow&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and protects personal data in connection with the CERES platform at <strong>ceres.northflow.no</strong>. We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) and applicable Norwegian data protection law.
        </p>

        <h2 style={h2}>1. Data Controller</h2>
        <p style={p}>
          The data controller responsible for your personal data is:<br /><br />
          <strong>{CONTROLLER}</strong><br />
          Org. no. {ORG_NUMBER}<br />
          {STREET}<br />
          {POSTAL_CITY}<br />
          {COUNTRY}<br />
          <a href={PHONE_HREF} style={{ color: "var(--earth)" }}>{PHONE}</a><br />
          <a href={`mailto:${EMAIL}`} style={{ color: "var(--earth)" }}>{EMAIL}</a>
        </p>

        <h2 style={h2}>2. What Data We Collect</h2>
        <p style={p}>We collect only the data necessary to provide the CERES service:</p>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Email address and organisation name</strong>: collected when you contact us, and held for people who signed up to the CERES newsletter or an API plan earlier. Used to answer you and to keep those existing records.</li>
          <li style={li}><strong>Payment data</strong>: earlier API plans were paid through Stripe. We have never stored card numbers or payment credentials. Stripe acts as an independent data processor under its own privacy policy.</li>
          <li style={li}><strong>Usage data</strong>: analytics via Google Analytics 4. With your consent this includes pages visited, session duration, and device type, measured with cookies. Without consent Google may receive cookieless measurements. See the <a href="/cookies" style={{ color: "var(--earth)" }}>Cookie Policy</a>.</li>
          <li style={li}><strong>API request logs</strong>: IP address and request timestamps for API calls. Retained for 30 days for security and abuse prevention.</li>
        </ul>

        <h2 style={h2}>3. Legal Basis for Processing</h2>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Contract performance (Art. 6(1)(b) GDPR)</strong>: processing the email and billing records of earlier newsletter and API sign-ups.</li>
          <li style={li}><strong>Legitimate interests (Art. 6(1)(f) GDPR)</strong>: security logging, fraud prevention, and platform analytics.</li>
          <li style={li}><strong>Consent (Art. 6(1)(a) GDPR)</strong>: where you have given explicit consent, such as accepting cookie tracking for analytics.</li>
        </ul>

        <h2 style={h2}>4. How We Use Your Data</h2>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}>Responding to research and institutional enquiries</li>
          <li style={li}>Keeping the records of earlier subscriptions that accounting law requires</li>
          <li style={li}>Monitoring platform health and preventing abuse</li>
          <li style={li}>Improving the service through usage analytics</li>
        </ul>
        <p style={p}>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

        <h2 style={h2}>5. Data Processors and Third Parties</h2>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Stripe Inc.</strong>: payment processing for earlier API plans. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>Stripe Privacy Policy</a></li>
          <li style={li}><strong>Google LLC (Analytics and Fonts)</strong>: website analytics and typefaces. Analytics data is processed under a Data Processing Addendum. Your browser fetches the typefaces directly from Google, which receives your IP address with the request. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>Google Privacy Policy</a></li>
          <li style={li}><strong>Esri Inc.</strong>: map tiles. Your browser fetches them directly from Esri on pages with a map.</li>
          <li style={li}><strong>GitHub Inc.</strong>: country outlines on the map page. Your browser fetches them directly from raw.githubusercontent.com.</li>
          <li style={li}><strong>Samtykkr</strong>: the consent banner, loaded from app.samtykkr.no. Your choice is stored in your own browser.</li>
          <li style={li}><strong>Railway Inc.</strong>: cloud infrastructure hosting the API backend. Data processed within the EU/EEA or under Standard Contractual Clauses.</li>
          <li style={li}><strong>Vercel Inc.</strong>: frontend hosting. Data processed under Vercel&rsquo;s Data Processing Addendum.</li>
        </ul>

        <h2 style={h2}>6. Data Retention</h2>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Earlier newsletter sign-ups</strong>: retained until you ask us to remove them.</li>
          <li style={li}><strong>Earlier API plans</strong>: retained for the duration of the plan plus 2 years for accounting purposes.</li>
          <li style={li}><strong>Enquiries</strong>: retained for as long as the conversation is relevant.</li>
          <li style={li}><strong>API request logs</strong>: 30 days.</li>
          <li style={li}><strong>Analytics data</strong>: Google Analytics default retention (14 months).</li>
        </ul>

        <h2 style={h2}>7. Your Rights Under GDPR</h2>
        <p style={p}>You have the following rights regarding your personal data:</p>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Right of access</strong>: request a copy of the personal data we hold about you.</li>
          <li style={li}><strong>Right to rectification</strong>: request correction of inaccurate data.</li>
          <li style={li}><strong>Right to erasure</strong>: request deletion of your data (&ldquo;right to be forgotten&rdquo;), subject to legal retention obligations.</li>
          <li style={li}><strong>Right to data portability</strong>: receive your data in a machine-readable format.</li>
          <li style={li}><strong>Right to object</strong>: object to processing based on legitimate interests.</li>
          <li style={li}><strong>Right to withdraw consent</strong>: where processing is based on consent, you may withdraw at any time.</li>
        </ul>
        <p style={p}>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} style={{ color: "var(--earth)" }}>{EMAIL}</a>. We will respond within 30 days.</p>
        <p style={p}>You also have the right to lodge a complaint with the Norwegian Data Protection Authority (Datatilsynet) at <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>datatilsynet.no</a>.</p>

        <h2 style={h2}>8. Cookies</h2>
        <p style={p}>
          CERES uses few cookies. See our <a href="/cookies" style={{ color: "var(--earth)" }}>Cookie Policy</a> for full details.
          Analytics cookies require your consent and can be declined.
        </p>

        <h2 style={h2}>9. International Data Transfers</h2>
        <p style={p}>
          Some of our processors (Stripe, Google, Vercel) may process data outside the EEA. Where this occurs, we ensure appropriate safeguards are in place, including EU Standard Contractual Clauses (SCCs) or adequacy decisions. Contact us for details.
        </p>

        <h2 style={h2}>10. Security</h2>
        <p style={p}>
          We implement appropriate technical and organisational measures to protect your personal data, including HTTPS encryption in transit, access controls, and regular security reviews. No system is completely secure: please contact us immediately if you suspect a data breach.
        </p>

        <h2 style={h2}>11. Changes to This Policy</h2>
        <p style={p}>
          We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision. Material changes are published on this page with a new date.
        </p>

        <h2 style={h2}>12. Contact</h2>
        <p style={p}>
          For any privacy-related questions or requests:<br /><br />
          <strong>{CONTROLLER}</strong><br />
          {STREET}<br />
          {POSTAL_CITY}<br />
          {COUNTRY}<br />
          <a href={PHONE_HREF} style={{ color: "var(--earth)" }}>{PHONE}</a><br />
          <a href={`mailto:${EMAIL}`} style={{ color: "var(--earth)" }}>{EMAIL}</a>
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border-light)", display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" }}>
          <a href="/cookies" style={{ color: "var(--earth)", textDecoration: "none" }}>Cookie Policy →</a>
          <a href="/terms" style={{ color: "var(--earth)", textDecoration: "none" }}>Terms of Use →</a>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

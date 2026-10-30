import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | CERES",
  description: "Terms of Use for CERES, the Calibrated Early-warning and Risk Estimation System. Northflow Technologies AS.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ceres.northflow.no/terms" },
};

const LAST_UPDATED = "19 October 2026";

export default function TermsPage() {
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
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>Terms of Use</h1>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.06em" }}>Last updated: {LAST_UPDATED}</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "48px 40px 80px", boxSizing: "border-box" }}>

        <p style={p}>
          These Terms of Use govern your access to and use of the CERES platform at <strong>ceres.northflow.no</strong>, the CERES API, and any associated services (collectively, the &ldquo;Service&rdquo;) operated by <strong>Northflow Technologies AS</strong> (&ldquo;Northflow&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing or using the Service you agree to these Terms. If you do not agree, do not use the Service.
        </p>

        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--crisis)", padding: "16px 20px", margin: "24px 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--crisis)", marginBottom: 6 }}>Important Limitation</div>
          <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0, lineHeight: 1.7 }}>
            CERES is a research and early warning tool. It is <strong>not</strong> an operational replacement for IPC field assessments, famine declarations, or humanitarian programme decisions. CERES predictions must not be used as the sole basis for life-affecting operational decisions. See Section 7 for full disclaimer.
          </p>
        </div>

        <h2 style={h2}>1. The Service</h2>
        <p style={p}>
          CERES provides probabilistic forecasts of acute food insecurity (IPC Phase 3+). Headline forecasts are issued at national level across 43 high-risk countries, with a separate sub-national screening score, on a weekly schedule. The Service includes the public dashboard, the open data downloads, the public REST API, and supporting documentation.
        </p>
        <p style={p}>
          The Service is provided by Northflow Technologies AS, a Norwegian technology company. Norwegian law applies to these Terms.
        </p>

        <h2 style={h2}>2. Access</h2>
        <p style={p}>
          The Service is available to individuals, organisations, researchers, and humanitarian entities worldwide. The dashboard, the open data downloads and the public API endpoints are free and need no account. Research collaborations are agreed in writing through <a href="mailto:hello@northflow.no" style={{ color: "var(--earth)" }}>hello@northflow.no</a>.
        </p>

        <h2 style={h2}>3. Open Access</h2>
        <p style={p}>
          Open data published under CC BY 4.0 may be downloaded, used, adapted, and redistributed, including commercially, with attribution.
        </p>
        <p style={p}>
          We may change or limit the public endpoints with reasonable notice, for example to protect the Service from abuse.
        </p>

        <h2 style={h2}>4. API Use</h2>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}><strong>Fair use</strong>: automated clients should keep request volume reasonable. Heavy traffic may be rate-limited.</li>
          <li style={li}><strong>Earlier plans</strong>: API plans agreed before 19 October 2026 continue on the terms that applied when they were agreed. To cancel one, write to <a href="mailto:hello@northflow.no" style={{ color: "var(--earth)" }}>hello@northflow.no</a>.</li>
        </ul>

        <h2 style={h2}>5. Intellectual Property</h2>
        <p style={p}>
          The CERES forecasting engine, its models and the methodology documentation are the intellectual property of Northflow Technologies AS. The source code of this website is published under the Apache License 2.0 at <a href="https://github.com/northflowlabs/ceres" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>github.com/northflowlabs/ceres</a>. Third-party components keep their own licences.
        </p>
        <p style={p}>
          <strong>Open data</strong>: Prediction outputs published by CERES are licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>CC BY 4.0</a>. You may use, share, and adapt them freely provided you give attribution: <em>&ldquo;CERES / Northflow Technologies AS, ceres.northflow.no&rdquo;</em>.
        </p>
        <p style={p}>
          <strong>API outputs</strong>: Data returned by the public API, including sensitivity intervals, driver hypotheses, and Admin1 signals, is covered by the same CC BY 4.0 licence.
        </p>

        <h2 style={h2}>6. Acceptable Use</h2>
        <p style={p}>You agree not to:</p>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 24 }}>
          <li style={li}>Attempt to circumvent rate limits, access controls, or authentication mechanisms</li>
          <li style={li}>Scrape, mirror, or reproduce the CERES platform without authorisation</li>
          <li style={li}>Use the Service to generate, distribute, or amplify disinformation about humanitarian conditions</li>
          <li style={li}>Represent CERES outputs as official IPC assessments, famine declarations, or UN agency findings</li>
          <li style={li}>Use the Service in any manner that violates applicable law or regulation</li>
          <li style={li}>Interfere with the security, integrity, or availability of the Service</li>
        </ul>

        <h2 style={h2}>7. Disclaimer: Research Tool, Not Operational Authority</h2>
        <p style={p}>
          <strong>CERES is a research and early warning tool. It is not an operational humanitarian authority.</strong>
        </p>
        <p style={p}>
          Only the IPC Global Platform, through its established field-based Cadre Harmonisé or IPC Acute Food Insecurity process, has the mandate to classify and declare famine (IPC Phase 5). A CERES Tier I prediction indicates a high statistical probability of reaching IPC Phase 3 or above within 90 days. It is a signal for preparedness and monitoring, not a famine declaration.
        </p>
        <p style={p}>
          CERES predictions are probabilistic estimates based on satellite, conflict, and market data. They carry uncertainty. They may be wrong. They should always be interpreted alongside field intelligence, FEWS NET situation reports, WFP VAM assessments, and direct humanitarian expertise.
        </p>
        <p style={p}>
          Northflow Technologies AS accepts no liability for operational decisions made on the basis of CERES outputs, including but not limited to pre-positioning, funding allocation, evacuation, or programme design decisions.
        </p>

        <h2 style={h2}>8. Limitation of Liability</h2>
        <p style={p}>
          To the maximum extent permitted by applicable law, Northflow Technologies AS and its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.
        </p>
        <p style={p}>
          Our total liability to you for any claim arising from these Terms or the Service shall not exceed the amount you paid us in the 12 months prior to the claim, or NOK 1,000, whichever is greater.
        </p>

        <h2 style={h2}>9. Service Availability</h2>
        <p style={p}>
          We aim to maintain high availability but do not guarantee uninterrupted access. The pipeline runs on a best-effort basis. Scheduled maintenance, infrastructure incidents, or upstream data source outages may cause delays or gaps in predictions. We communicate significant outages via the changelog.
        </p>

        <h2 style={h2}>10. Termination</h2>
        <p style={p}>
          We reserve the right to suspend or terminate access to the Service, with or without notice, if you violate these Terms or engage in conduct that is harmful to the platform, other users, or third parties. Holders of an earlier paid plan receive a pro-rata refund for any remaining prepaid period.
        </p>

        <h2 style={h2}>11. Governing Law and Dispute Resolution</h2>
        <p style={p}>
          These Terms are governed by Norwegian law. Any disputes shall be subject to the exclusive jurisdiction of the Norwegian courts, with Oslo District Court as the agreed venue of first instance.
        </p>
        <p style={p}>
          If you are a consumer in the EU/EEA, you retain the right to bring claims before the courts of your country of residence.
        </p>

        <h2 style={h2}>12. Changes to These Terms</h2>
        <p style={p}>
          We may update these Terms from time to time. Material changes are published on this page at least 14 days before taking effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
        </p>

        <h2 style={h2}>13. Contact</h2>
        <p style={p}>
          For questions about these Terms:<br /><br />
          <strong>Northflow Technologies AS</strong><br />
          Jåttåveien 92<br />
          4020 Stavanger<br />
          Norway<br />
          <a href="tel:+4795085045" style={{ color: "var(--earth)" }}>+47 95 08 50 45</a><br />
          <a href="mailto:hello@northflow.no" style={{ color: "var(--earth)" }}>hello@northflow.no</a>
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border-light)", display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" }}>
          <a href="/privacy" style={{ color: "var(--earth)", textDecoration: "none" }}>Privacy Policy →</a>
          <a href="/cookies" style={{ color: "var(--earth)", textDecoration: "none" }}>Cookie Policy →</a>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

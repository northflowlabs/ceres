"use client";

import dynamic from "next/dynamic";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const CeresMap = dynamic(() => import("./CeresMap"), { ssr: false, loading: () => (
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 480, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.1em" }}>
    Loading map…
  </div>
)});

export default function MapPage() {
  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />
      <div style={{ borderBottom: "1px solid var(--border)", padding: "40px 40px 32px", maxWidth: 1300, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          CERES Risk Intelligence · Live Map
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginBottom: 10 }}>
          Global Famine Risk Map
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-mid)", maxWidth: 680, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
          90-day IPC Phase 3+ probability across country, Admin1, and Admin2 layers. Click any region for full signal breakdown.
        </p>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 1300, margin: "0 auto", width: "100%", padding: "0 40px 60px", boxSizing: "border-box" }}>
        <CeresMap />
      </div>
      <SiteFooter />
    </div>
  );
}

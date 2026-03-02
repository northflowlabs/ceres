"use client";

import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const SITE_URL = "https://ceres.northflow.no";

interface WidgetConfig {
  theme:   "light" | "dark";
  limit:   number;
  tier:    string;
  compact: boolean;
  height:  number;
  width:   string;
}

function buildUrl(cfg: WidgetConfig): string {
  const params = new URLSearchParams();
  if (cfg.theme !== "light") params.set("theme", cfg.theme);
  if (cfg.limit !== 5)       params.set("limit", String(cfg.limit));
  if (cfg.tier)              params.set("tier",  cfg.tier);
  if (cfg.compact)           params.set("compact", "true");
  const qs = params.toString();
  return `${SITE_URL}/widget${qs ? `?${qs}` : ""}`;
}

function buildEmbed(cfg: WidgetConfig): string {
  const url = buildUrl(cfg);
  return `<iframe
  src="${url}"
  width="${cfg.width}"
  height="${cfg.height}"
  frameborder="0"
  scrolling="no"
  style="border:none;overflow:hidden;"
  title="CERES Food Crisis Risk Monitor"
></iframe>`;
}

export default function EmbedPage() {
  const [cfg, setCfg] = useState<WidgetConfig>({
    theme: "light", limit: 5, tier: "", compact: false, height: 340, width: "320",
  });
  const [copied, setCopied] = useState(false);
  const embedCode = buildEmbed(cfg);
  const previewUrl = buildUrl(cfg);

  function copy() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const p = { color: "var(--ink-mid)", fontSize: 14, lineHeight: 1.75, marginBottom: 12 };
  const label = { fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-light)", display: "block", marginBottom: 6 };
  const input = {
    fontFamily: "var(--mono)", fontSize: 12, padding: "8px 12px",
    border: "1px solid var(--border)", background: "white",
    color: "var(--ink)", outline: "none", width: "100%", boxSizing: "border-box" as const,
  };
  const section = { marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border-light)" };

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Partner Integration
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Embeddable Widget</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          Add a live CERES risk monitor to your organisation&rsquo;s website, dashboard, or intranet with a single line of HTML. No API key required. Updates automatically every week.
        </p>
      </div>

      <div className="methodology-layout" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "48px 40px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>

        {/* Configurator */}
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16 }}>Configure Widget</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
            {/* Theme */}
            <div>
              <label style={label}>Theme</label>
              <div style={{ display: "flex", gap: 1, background: "var(--border)" }}>
                {(["light", "dark"] as const).map(t => (
                  <button key={t} onClick={() => setCfg(c => ({ ...c, theme: t }))} style={{
                    flex: 1, padding: "9px 0", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", border: "none", cursor: "pointer",
                    background: cfg.theme === t ? "var(--ink)" : "white",
                    color: cfg.theme === t ? "var(--parchment)" : "var(--ink-light)",
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div>
              <label style={label}>Rows to show: {cfg.limit}</label>
              <input type="range" min={1} max={15} value={cfg.limit}
                onChange={e => setCfg(c => ({ ...c, limit: Number(e.target.value), height: 70 + Number(e.target.value) * (cfg.compact ? 42 : 54) }))}
                style={{ width: "100%", accentColor: "var(--earth)" }}
              />
            </div>

            {/* Tier filter */}
            <div>
              <label style={label}>Filter by tier (optional)</label>
              <select value={cfg.tier} onChange={e => setCfg(c => ({ ...c, tier: e.target.value }))} style={{ ...input, appearance: "none" }}>
                <option value="">All tiers</option>
                <option value="TIER-1">TIER-1 only (critical)</option>
                <option value="TIER-2">TIER-2 only (warning)</option>
                <option value="TIER-3">TIER-3 only (watch)</option>
              </select>
            </div>

            {/* Compact */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="compact" checked={cfg.compact}
                onChange={e => setCfg(c => ({ ...c, compact: e.target.checked, height: 70 + c.limit * (e.target.checked ? 42 : 54) }))}
                style={{ accentColor: "var(--earth)", width: 14, height: 14 }}
              />
              <label htmlFor="compact" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-mid)", cursor: "pointer" }}>
                Compact mode (smaller rows, no CI)
              </label>
            </div>

            {/* Width */}
            <div>
              <label style={label}>Width</label>
              <div style={{ display: "flex", gap: 1, background: "var(--border)" }}>
                {["280", "320", "400", "100%"].map(w => (
                  <button key={w} onClick={() => setCfg(c => ({ ...c, width: w }))} style={{
                    flex: 1, padding: "9px 0", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em",
                    border: "none", cursor: "pointer",
                    background: cfg.width === w ? "var(--ink)" : "white",
                    color: cfg.width === w ? "var(--parchment)" : "var(--ink-light)",
                  }}>{w}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Code output */}
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 8 }}>Embed code</div>
          <div style={{ position: "relative" }}>
            <pre style={{
              background: "#1C1917", border: "1px solid var(--border)", padding: "16px 18px",
              fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.7, color: "#D4C5A9",
              overflowX: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>
              {embedCode}
            </pre>
            <button
              onClick={copy}
              style={{
                position: "absolute", top: 10, right: 10,
                fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                background: copied ? "var(--watch)" : "var(--earth)", color: "white", border: "none",
                padding: "5px 12px", cursor: "pointer",
              }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--earth)", textDecoration: "none" }}
            >
              Open widget in new tab ↗
            </a>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16 }}>Live Preview</div>
          <div style={{ border: "1px solid var(--border)", background: "#F5F5F5", padding: 20, display: "flex", justifyContent: "center" }}>
            <iframe
              src={previewUrl}
              width={cfg.width === "100%" ? "100%" : Number(cfg.width)}
              height={cfg.height}
              frameBorder={0}
              scrolling="no"
              style={{ border: "none", overflow: "hidden", display: "block" }}
              title="CERES Widget Preview"
            />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 8, letterSpacing: "0.06em" }}>
            Preview loads live data — may take a moment
          </div>

          {/* Usage notes */}
          <div style={{ marginTop: 32, ...section }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>URL Parameters</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Parameter", "Values", "Default"].map(h => (
                    <th key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", padding: "6px 8px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["theme",   "light | dark",              "light"],
                  ["limit",   "1–15",                      "5"],
                  ["tier",    "TIER-1 | TIER-2 | TIER-3",  "all"],
                  ["region",  "region_id e.g. ETH-TIGRAY", "all"],
                  ["compact", "true | false",               "false"],
                ].map(([param, vals, def], i) => (
                  <tr key={param} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "8px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--earth)" }}>{param}</td>
                    <td style={{ padding: "8px", color: "var(--ink-mid)" }}>{vals}</td>
                    <td style={{ padding: "8px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Licence &amp; Attribution</div>
            <p style={p}>
              The CERES widget is free to embed on any website. No API key required. Data is licensed under <strong style={{ color: "var(--ink)" }}>CC BY 4.0</strong>. The widget footer includes automatic attribution to ceres.northflow.no.
            </p>
            <p style={p}>
              For custom integrations, white-label embedding, or removal of the CERES branding, contact <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a>.
            </p>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

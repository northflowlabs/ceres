"use client";

import { useEffect, useState, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const API_BASE = "https://ceres-core-production.up.railway.app";

const TIER_LABELS: Record<string, string> = {
  free:          "Open Research",
  professional:  "Professional",
  institutional: "Institutional",
  admin:         "Admin",
};

const TIER_COLORS: Record<string, string> = {
  free:          "var(--ink-light)",
  professional:  "var(--earth)",
  institutional: "var(--crisis)",
  admin:         "#7C3AED",
};

interface UsageData {
  tier: string;
  org_name: string;
  requests_this_month: number;
  monthly_limit: number;
  remaining: number;
  month_bucket: string;
}

export default function AccountPage() {
  const [apiKey,    setApiKey]    = useState("");
  const [usage,     setUsage]     = useState<UsageData | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function lookupKey(key: string) {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    setUsage(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/billing/usage`, {
        headers: { "X-API-Key": key.trim() },
      });
      if (resp.status === 401) throw new Error("Invalid API key — check for typos or contact ceres@northflow.no");
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();
      setUsage(data);
      // Persist in sessionStorage for convenience
      sessionStorage.setItem("ceres_api_key", key.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    if (!apiKey.trim()) return;
    setPortalLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/v1/billing/portal`, {
        headers: { "X-API-Key": apiKey.trim() },
      });
      if (!resp.ok) throw new Error("Could not open billing portal");
      const { portal_url } = await resp.json();
      window.open(portal_url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal error");
    } finally {
      setPortalLoading(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Restore from session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("ceres_api_key");
    if (saved) {
      setApiKey(saved);
      lookupKey(saved);
    }
  }, []);

  const usagePct = usage ? Math.min(100, (usage.requests_this_month / Math.max(1, usage.monthly_limit)) * 100) : 0;
  const usageColor = usagePct >= 90 ? "var(--crisis)" : usagePct >= 70 ? "var(--warning)" : "var(--watch)";
  const isUnlimited = usage && usage.monthly_limit > 1_000_000;

  const s = {
    label: {
      fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em",
      textTransform: "uppercase" as const, color: "var(--ink-light)", marginBottom: 6, display: "block",
    },
    val: {
      fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: "var(--ink)",
    },
    card: {
      background: "white", border: "1px solid var(--border)", padding: "24px 28px",
    },
  };

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 860, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Subscriber Account
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
          API Account
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-mid)", maxWidth: 560, lineHeight: 1.7, fontWeight: 300 }}>
          Enter your API key to view usage, remaining requests, and manage your subscription.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "40px 40px 80px" }}>

        {/* Key input */}
        <div style={{ marginBottom: 32 }}>
          <label style={s.label}>Your API Key</label>
          <div style={{ display: "flex", gap: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookupKey(apiKey)}
              placeholder="ceres_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              style={{
                flex: 1, padding: "12px 16px",
                fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.04em",
                border: "1px solid var(--border)", borderRight: "none",
                background: "white", color: "var(--ink)", outline: "none",
              }}
            />
            <button
              onClick={() => lookupKey(apiKey)}
              disabled={loading || !apiKey.trim()}
              style={{
                padding: "12px 24px",
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                background: "var(--ink)", color: "var(--parchment)", border: "1px solid var(--ink)",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Loading…" : "Look Up →"}
            </button>
            {apiKey.trim() && (
              <button
                onClick={copyKey}
                style={{
                  padding: "12px 16px", marginLeft: 8,
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em",
                  background: copied ? "var(--watch)" : "var(--parchment-dark)",
                  color: copied ? "white" : "var(--ink-light)",
                  border: "1px solid var(--border)", cursor: "pointer",
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 8 }}>
            Your key was emailed when your subscription was confirmed. Header: <code style={{ background: "var(--parchment-dark)", padding: "1px 4px" }}>X-API-Key: your_key</code>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.3)", padding: "14px 18px", marginBottom: 28, fontFamily: "var(--mono)", fontSize: 12, color: "var(--crisis)" }}>
            ✗ {error}
          </div>
        )}

        {/* Usage dashboard */}
        {usage && (
          <>
            {/* Tier + org strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: "14px 20px", background: "white", border: "1px solid var(--border)", borderLeft: `4px solid ${TIER_COLORS[usage.tier] ?? "var(--earth)"}` }}>
              <div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>Subscription</span>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: TIER_COLORS[usage.tier] ?? "var(--earth)" }}>
                  {TIER_LABELS[usage.tier] ?? usage.tier}
                </div>
              </div>
              {usage.org_name && (
                <div style={{ borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>Organisation</span>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{usage.org_name}</div>
                </div>
              )}
              <div style={{ marginLeft: "auto", borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)" }}>Billing period</span>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{usage.month_bucket || "—"}</div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
              {[
                {
                  label: "Requests this month",
                  val: usage.requests_this_month.toLocaleString(),
                  sub: isUnlimited ? "Unlimited plan" : `of ${usage.monthly_limit.toLocaleString()} limit`,
                },
                {
                  label: "Remaining",
                  val: isUnlimited ? "∞" : usage.remaining.toLocaleString(),
                  sub: isUnlimited ? "No cap" : `resets 1st of month`,
                },
                {
                  label: "Usage",
                  val: isUnlimited ? "—" : `${usagePct.toFixed(1)}%`,
                  sub: isUnlimited ? "Unlimited" : usagePct >= 90 ? "Near limit" : "Healthy",
                  color: isUnlimited ? "var(--earth)" : usageColor,
                },
              ].map(({ label, val, sub, color }) => (
                <div key={label} style={{ background: "white", padding: "24px 28px" }}>
                  <span style={s.label}>{label}</span>
                  <div style={{ ...s.val, color: color ?? "var(--ink)" }}>{val}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 6 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Usage bar */}
            {!isUnlimited && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ height: 6, background: "var(--border-light)", borderRadius: 3 }}>
                  <div style={{ height: "100%", borderRadius: 3, background: usageColor, width: `${usagePct}%`, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 4 }}>
                  <span>0</span>
                  <span>{usage.monthly_limit.toLocaleString()} requests / month</span>
                </div>
              </div>
            )}

            {/* API reference */}
            <div style={{ ...s.card, marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 14 }}>Quick Reference</div>
              <div style={{ background: "#1C1917", padding: "16px 20px", fontFamily: "var(--mono)", fontSize: 12, color: "#D4C5A9", lineHeight: 2 }}>
                <span style={{ color: "#6E7681" }}># Base URL{"\n"}</span>
                <span style={{ color: "#9ECBFF" }}>curl </span>
                <span style={{ color: "#F4A261" }}>https://ceres-core-production.up.railway.app/v1/predictions </span>
                <span style={{ color: "#9ECBFF" }}>-H </span>
                <span style={{ color: "#F4A261" }}>"X-API-Key: {apiKey.slice(0, 16)}…"{"\n"}</span>
                <span style={{ color: "#6E7681" }}>{"\n"}# Check usage{"\n"}</span>
                <span style={{ color: "#9ECBFF" }}>curl </span>
                <span style={{ color: "#F4A261" }}>https://ceres-core-production.up.railway.app/v1/billing/usage </span>
                <span style={{ color: "#9ECBFF" }}>-H </span>
                <span style={{ color: "#F4A261" }}>"X-API-Key: {apiKey.slice(0, 16)}…"</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {usage.tier !== "free" && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  style={{
                    padding: "12px 24px",
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "var(--ink)", color: "var(--parchment)", border: "none",
                    cursor: portalLoading ? "not-allowed" : "pointer", opacity: portalLoading ? 0.6 : 1,
                  }}
                >
                  {portalLoading ? "Opening…" : "Manage Subscription →"}
                </button>
              )}
              <a
                href="/api-access"
                style={{
                  padding: "12px 24px",
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "transparent", color: "var(--ink)", border: "1px solid var(--border)",
                  textDecoration: "none", display: "inline-block",
                }}
              >
                API Documentation →
              </a>
              {usage.tier === "free" && (
                <a
                  href="/api-access"
                  style={{
                    padding: "12px 24px",
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "var(--earth)", color: "white", border: "none",
                    textDecoration: "none", display: "inline-block",
                  }}
                >
                  Upgrade to Professional →
                </a>
              )}
            </div>
          </>
        )}

        {/* Empty state — not yet looked up */}
        {!usage && !loading && !error && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 16 }}>
              Enter your API key above to view your account
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7 }}>
              Don&apos;t have a key?{" "}
              <a href="/api-access" style={{ color: "var(--earth)" }}>Get access →</a>
            </p>
          </div>
        )}

        {/* Note */}
        <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 40, lineHeight: 1.7 }}>
          Your API key is sensitive. Never share it publicly. If compromised, email <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a> to rotate it immediately. Usage counters reset on the 1st of each month UTC.
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}

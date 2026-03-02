"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface MeData {
  email: string;
  tier: string;
  org_name: string;
  key_prefix: string;
  requests_this_month: number;
  monthly_limit: number;
  remaining: number;
  month_bucket: string;
  is_alert_subscriber: boolean;
  has_api_key: boolean;
}

const SESSION_KEY = "ceres_session_token";

export default function AccountPage() {
  const router = useRouter();
  const [me,            setMe]            = useState<MeData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [portalLoading,  setPortalLoading]  = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [webhooks,       setWebhooks]       = useState<string[]>([]);
  const [webhookUrl,     setWebhookUrl]     = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError,   setWebhookError]   = useState<string | null>(null);

  async function fetchWebhooks(token: string) {
    try {
      const resp = await fetch(`${API_BASE}/v1/auth/webhooks?session_token=${encodeURIComponent(token)}`);
      if (resp.ok) {
        const data = await resp.json();
        setWebhooks(data.webhooks ?? []);
      }
    } catch { /* non-fatal */ }
  }

  async function addWebhook(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem(SESSION_KEY);
    if (!token || !webhookUrl.trim()) return;
    setWebhookLoading(true);
    setWebhookError(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/auth/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_token: token, url: webhookUrl.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? `Error ${resp.status}`);
      setWebhookUrl("");
      await fetchWebhooks(token);
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : "Failed to register webhook");
    } finally {
      setWebhookLoading(false);
    }
  }

  async function removeWebhook(url: string) {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    try {
      await fetch(`${API_BASE}/v1/auth/webhooks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_token: token, url }),
      });
      setWebhooks(prev => prev.filter(w => w !== url));
    } catch { /* non-fatal */ }
  }

  async function fetchMe(token: string) {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/auth/me?session_token=${encodeURIComponent(token)}`);
      if (resp.status === 401) {
        localStorage.removeItem(SESSION_KEY);
        router.push("/login");
        return;
      }
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const meData = await resp.json();
      setMe(meData);
      if (["professional", "institutional"].includes(meData.tier)) {
        fetchWebhooks(token);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  }

  async function exchangeToken(magicToken: string) {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/v1/auth/verify?token=${encodeURIComponent(magicToken)}`);
      if (!resp.ok) {
        setError("This login link is invalid or has expired. Please request a new one.");
        setLoading(false);
        return;
      }
      const { session_token } = await resp.json();
      localStorage.setItem(SESSION_KEY, session_token);
      // Remove token from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
      await fetchMe(session_token);
    } catch {
      setError("Login failed — please try again.");
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get("token");
    if (magicToken) {
      exchangeToken(magicToken);
      return;
    }
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      router.push("/login");
      return;
    }
    fetchMe(session);
  }, []);

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    router.push("/login");
  }

  async function openPortal() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return;
    setPortalLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/v1/billing/portal`, {
        headers: { "X-Session-Token": session },
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

  function copyPrefix() {
    if (!me?.key_prefix) return;
    navigator.clipboard.writeText(me.key_prefix).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const s = {
    label: {
      fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em",
      textTransform: "uppercase" as const, color: "var(--ink-light)", marginBottom: 6, display: "block",
    },
    val: {
      fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: "var(--ink)",
    },
  };

  const usagePct    = me ? Math.min(100, (me.requests_this_month / Math.max(1, me.monthly_limit)) * 100) : 0;
  const usageColor  = usagePct >= 90 ? "var(--crisis)" : usagePct >= 70 ? "var(--warning, #D97706)" : "var(--watch)";
  const isUnlimited = me && me.monthly_limit > 1_000_000;

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 860, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Subscriber Account
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
            {me ? `Hello${me.org_name ? `, ${me.org_name}` : ""}` : "Your Account"}
          </h1>
          {me && (
            <button onClick={signOut} style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "var(--ink-light)", border: "1px solid var(--border)", padding: "8px 16px", cursor: "pointer" }}>
              Sign out
            </button>
          )}
        </div>
        {me && (
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-light)" }}>{me.email}</p>
        )}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", width: "100%", padding: "40px 40px 80px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.1em" }}>
            Loading account…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.3)", padding: "20px 24px", marginBottom: 28, fontFamily: "var(--mono)", fontSize: 12, color: "var(--crisis)", lineHeight: 1.7 }}>
            ✗ {error}
            <div style={{ marginTop: 12 }}>
              <a href="/login" style={{ color: "var(--earth)", textDecoration: "none" }}>Request a new login link →</a>
            </div>
          </div>
        )}

        {me && !loading && (
          <>
            {/* Tier strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: "14px 20px", background: "white", border: "1px solid var(--border)", borderLeft: `4px solid ${TIER_COLORS[me.tier] ?? "var(--earth)"}` }}>
              <div>
                <span style={s.label}>Subscription</span>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: TIER_COLORS[me.tier] ?? "var(--earth)" }}>
                  {TIER_LABELS[me.tier] ?? me.tier}
                </div>
              </div>
              {me.org_name && (
                <div style={{ borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
                  <span style={s.label}>Organisation</span>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{me.org_name}</div>
                </div>
              )}
              <div style={{ marginLeft: "auto", borderLeft: "1px solid var(--border-light)", paddingLeft: 16 }}>
                <span style={s.label}>Billing period</span>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{me.month_bucket || "—"}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
              {[
                { label: "Requests this month", val: me.requests_this_month.toLocaleString(), sub: isUnlimited ? "Unlimited plan" : `of ${me.monthly_limit.toLocaleString()} limit` },
                { label: "Remaining",           val: isUnlimited ? "∞" : me.remaining.toLocaleString(), sub: isUnlimited ? "No cap" : "resets 1st of month" },
                { label: "Usage",               val: isUnlimited ? "—" : `${usagePct.toFixed(1)}%`, sub: isUnlimited ? "Unlimited" : usagePct >= 90 ? "Near limit" : "Healthy", color: isUnlimited ? "var(--earth)" : usageColor },
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
                  <span>{me.monthly_limit.toLocaleString()} requests / month</span>
                </div>
              </div>
            )}

            {/* API key prefix */}
            {me.has_api_key && (
              <div style={{ background: "white", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 12 }}>
                  API Key
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#1C1917", padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 13, color: "#F4A261", flex: 1 }}>
                    {me.key_prefix}••••••••••••••••••••••••••••••••
                  </div>
                  <button onClick={copyPrefix} style={{ padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", background: copied ? "var(--watch)" : "var(--parchment-dark)", color: copied ? "white" : "var(--ink-light)", border: "1px solid var(--border)", cursor: "pointer" }}>
                    {copied ? "✓ Copied prefix" : "Copy prefix"}
                  </button>
                </div>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 10, lineHeight: 1.7 }}>
                  Full key was emailed at subscription time — check your inbox. Header: <code style={{ background: "var(--parchment-dark)", padding: "1px 4px" }}>X-API-Key: your_full_key</code>
                </p>
              </div>
            )}

            {/* Quick reference */}
            <div style={{ background: "white", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 14 }}>Quick Reference</div>
              <div style={{ background: "#1C1917", padding: "16px 20px", fontFamily: "var(--mono)", fontSize: 12, color: "#D4C5A9", lineHeight: 2 }}>
                <span style={{ color: "#6E7681" }}># Authenticate all requests{"\n"}</span>
                <span style={{ color: "#9ECBFF" }}>curl </span>
                <span style={{ color: "#F4A261" }}>https://ceres-core-production.up.railway.app/v1/predictions</span>
                {" "}<span style={{ color: "#9ECBFF" }}>-H</span>
                {" "}<span style={{ color: "#F4A261" }}>"X-API-Key: YOUR_KEY"</span>
              </div>
            </div>

            {/* Webhook management — Professional/Institutional only */}
            {["professional", "institutional"].includes(me.tier) && (
              <div style={{ background: "white", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: 28 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
                  Webhook Alerts
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7, margin: "0 0 16px" }}>
                  Receive a JSON POST to your endpoint whenever a region escalates to Tier I or Tier II.
                </p>

                {/* Registered webhooks */}
                {webhooks.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {webhooks.map(url => (
                      <div key={url} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--parchment)", border: "1px solid var(--border)", marginBottom: 6, fontFamily: "var(--mono)", fontSize: 12 }}>
                        <span style={{ flex: 1, color: "var(--ink)", wordBreak: "break-all" }}>{url}</span>
                        <button
                          onClick={() => removeWebhook(url)}
                          style={{ flexShrink: 0, padding: "4px 10px", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", color: "var(--crisis)", border: "1px solid var(--crisis)", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {webhooks.length === 0 && (
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", marginBottom: 16 }}>
                    No webhooks registered yet.
                  </p>
                )}

                {/* Add webhook form */}
                <form onSubmit={addWebhook} style={{ display: "flex", gap: 0 }}>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-server.example.com/ceres-webhook"
                    style={{ flex: 1, padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, background: "var(--parchment)", border: "1px solid var(--border)", borderRight: "none", color: "var(--ink)", outline: "none" }}
                  />
                  <button
                    type="submit"
                    disabled={webhookLoading || !webhookUrl.trim()}
                    style={{ padding: "10px 20px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: webhookLoading ? "var(--ink-light)" : "var(--ink)", color: "var(--parchment)", border: "none", cursor: webhookLoading ? "not-allowed" : "pointer" }}
                  >
                    {webhookLoading ? "Adding…" : "Register →"}
                  </button>
                </form>
                {webhookError && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)", marginTop: 8 }}>{webhookError}</div>
                )}
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 10, lineHeight: 1.7 }}>
                  Payload: <code style={{ background: "var(--parchment-dark)", padding: "1px 4px" }}>{"{ event, run_id, timestamp, n_alerts, alerts[] }"}</code>
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {me.tier !== "free" && me.has_api_key && (
                <button onClick={openPortal} disabled={portalLoading} style={{ padding: "12px 24px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", border: "none", cursor: portalLoading ? "not-allowed" : "pointer", opacity: portalLoading ? 0.6 : 1 }}>
                  {portalLoading ? "Opening…" : "Manage Subscription →"}
                </button>
              )}
              <a href="/api-access" style={{ padding: "12px 24px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "var(--ink)", border: "1px solid var(--border)", textDecoration: "none", display: "inline-block" }}>
                API Documentation →
              </a>
              {(me.tier === "free" || !me.has_api_key) && (
                <a href="/api-access" style={{ padding: "12px 24px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--earth)", color: "white", border: "none", textDecoration: "none", display: "inline-block" }}>
                  Upgrade to Professional →
                </a>
              )}
            </div>

            <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 40, lineHeight: 1.7 }}>
              Your API key is sensitive — never share it publicly. If compromised, email <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a> to rotate it. Usage counters reset on the 1st of each month UTC.
            </p>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

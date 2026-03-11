"use client";

import { useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const API_BASE = "https://ceres-core-production.up.railway.app";

const TIER_LABELS: Record<string, string> = {
  professional:  "CERES Professional — $199 / month",
  institutional: "CERES Institutional — $999 / month",
};

function CheckoutModal({
  tier,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  tier: string;
  onClose: () => void;
  onSubmit: (email: string, org: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const [org,   setOrg]   = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim(), org.trim());
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", boxSizing: "border-box",
    fontFamily: "var(--mono)", fontSize: 13,
    background: "var(--parchment)", border: "1px solid var(--border)",
    color: "var(--ink)", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: 6,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--parchment)", border: "1px solid var(--border)",
          maxWidth: 420, width: "100%", padding: 32,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 8 }}>
            Subscribe
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
            {TIER_LABELS[tier]}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-light)", marginTop: 6, lineHeight: 1.5 }}>
            You'll be redirected to Stripe to complete payment. Your API key will be emailed immediately after.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Work email *</label>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organisation.org"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Organisation name</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="WFP, FAO, University of Oslo…"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: "var(--crisis-light)", border: "1px solid var(--crisis)", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                flex: 1, padding: "12px 0",
                fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                background: loading || !email.trim() ? "var(--ink-light)" : "var(--ink)",
                color: "var(--parchment)", border: "none",
                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Redirecting to Stripe…" : "Continue to payment →"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 20px",
                fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                background: "transparent", color: "var(--ink-mid)",
                border: "1px solid var(--border)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", lineHeight: 1.6 }}>
            🔒 Payments processed securely by Stripe. Cancel anytime from the billing portal.
          </div>
        </form>
      </div>
    </div>
  );
}

const TOC = [
  { id: "access",      label: "Access Tiers"    },
  { id: "hdx",         label: "Open Data (HDX)" },
  { id: "auth",        label: "Authentication"  },
  { id: "alerts",      label: "Alerts & Digest" },
  { id: "base",        label: "Base URL"         },
  { id: "predictions", label: "Predictions"      },
  { id: "hypotheses",  label: "Hypotheses"       },
  { id: "admin1",      label: "Admin1"           },
  { id: "formats",     label: "Response Format"  },
  { id: "attribution", label: "Attribution"      },
];

const TIERS = [
  {
    key: "free",
    tier: "Tier A", name: "Open Research", price: "Free", priceNote: "forever",
    highlight: false,
    cta: "Start for Free",
    ctaAction: "email",
    features: [
      "All prediction endpoints",
      "All hypothesis data",
      "Admin1 sub-national signals",
      "500 API requests / month",
      "Monthly intelligence newsletter",
      "Full archive CSV download",
      "Embeddable risk widget",
      "CC BY 4.0 open licence",
    ],
  },
  {
    key: "professional",
    tier: "Tier B", name: "Professional", price: "$199", priceNote: "/ month",
    highlight: true,
    cta: "Subscribe →",
    ctaAction: "checkout",
    features: [
      "Everything in Tier A",
      "10,000 API requests / month",
      "Real-time Tier I/II email alerts",
      "Weekly intelligence digest",
      "Weekly PDF intelligence briefs (downloadable)",
      "Webhook delivery to any endpoint",
      "Custom watchlist — region + threshold filter",
      "Priority email support",
    ],
  },
  {
    key: "institutional",
    tier: "Tier C", name: "Institutional", price: "$999", priceNote: "/ month",
    highlight: false,
    cta: "Subscribe →",
    ctaAction: "checkout",
    features: [
      "Everything in Tier B",
      "Unlimited API requests",
      "Named alert contacts — per-region routing",
      "Weekly PDF briefs — white-labelled with org name",
      "Scenario / counterfactual API — model 'what if' driver changes",
      "Team accounts — up to 10 logins under one subscription",
      "Custom region coverage on request",
      "SLA & dedicated integration support",
      "Designed for WFP · FAO · OCHA · ECHO · Foundations",
    ],
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
      <div className="endpoint-header" style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--parchment-dark)", border: "1px solid var(--border)", padding: "10px 14px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500, padding: "3px 8px", background: "#E8F5E9", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.2)" }}>{method}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)" }}>{path}</span>
        <span className="endpoint-desc" style={{ fontSize: 12, color: "var(--ink-light)", marginLeft: "auto" }}>{desc}</span>
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
  const [modalTier,       setModalTier]       = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState<string | null>(null);
  const [freeModal,       setFreeModal]       = useState(false);
  const [freeEmail,       setFreeEmail]       = useState("");
  const [freeLoading,     setFreeLoading]     = useState(false);
  const [freeSuccess,     setFreeSuccess]     = useState(false);
  const [freeError,       setFreeError]       = useState<string | null>(null);

  async function handleFreeSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!freeEmail.trim()) return;
    setFreeLoading(true);
    setFreeError(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/alerts/subscribe/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: freeEmail.trim() }),
      });
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      setFreeSuccess(true);
    } catch (err) {
      setFreeError(err instanceof Error ? err.message : "Something went wrong — try again or email ceres@northflow.no");
    } finally {
      setFreeLoading(false);
    }
  }

  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const checkoutStatus = urlParams?.get("checkout");

  useEffect(() => {
    const ids = TOC.map(t => t.id);
    function setActive(id: string) {
      ids.forEach(sid => {
        const el = tocRefs.current[sid];
        if (!el) return;
        const active = sid === id;
        el.style.color = active ? "var(--earth)" : "var(--ink-light)";
        el.style.borderLeftColor = active ? "var(--earth)" : "transparent";
      });
    }
    function getActive() {
      const scrollY = window.scrollY + 100;
      let activeId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= scrollY) activeId = id;
      }
      return activeId;
    }
    function onScroll() { setActive(getActive()); }
    window.addEventListener("scroll", onScroll, { passive: true });
    setActive(getActive());
    // Delegated click on nav — works regardless of when refs populate
    const nav = document.querySelector(".methodology-toc");
    function onNavClick(e: Event) {
      const a = (e.target as HTMLElement).closest("a[href^='#']");
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href")!.slice(1);
      const target = document.getElementById(id);
      if (target) {
        const top = target.offsetTop - 72;
        window.scrollTo({ top, behavior: "smooth" });
      }
      setActive(id);
    }
    nav?.addEventListener("click", onNavClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      nav?.removeEventListener("click", onNavClick);
    };
  }, []);

  async function handleCheckoutSubmit(email: string, org: string) {
    if (!modalTier) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: modalTier, email, org_name: org }),
      });
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data = await resp.json();
      window.location.href = data.checkout_url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed — try again or email ceres@northflow.no");
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Free tier sign-up modal */}
      {freeModal && (
        <div
          onClick={() => { if (!freeSuccess) { setFreeModal(false); setFreeEmail(""); setFreeError(null); } }}
          style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--parchment)", border: "1px solid var(--border)", maxWidth: 400, width: "100%", padding: 32, boxShadow: "6px 6px 0 rgba(0,0,0,0.15)" }}>
            {freeSuccess ? (
              <>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--watch)", marginBottom: 12 }}>✓ Subscribed</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>You&rsquo;re in.</div>
                <p style={{ fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7, marginBottom: 24 }}>
                  Check your inbox — a personal note from our founder Tom is on its way. You&rsquo;ll receive the monthly CERES Intelligence Letter on the first Monday of each month.
                </p>
                <button
                  onClick={() => { setFreeModal(false); setFreeSuccess(false); setFreeEmail(""); }}
                  style={{ width: "100%", padding: "11px 0", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", border: "none", cursor: "pointer" }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 8 }}>Open Research — Free</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Monthly Intelligence Letter</div>
                <p style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.6, marginBottom: 20 }}>
                  Free newsletter sent the first Monday of each month — top risk regions, system status, and a note from our founder Tom. No payment required.
                </p>
                <form onSubmit={handleFreeSubscribe} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: 6 }}>Email address *</label>
                    <input
                      type="email" required autoFocus
                      value={freeEmail}
                      onChange={(e) => setFreeEmail(e.target.value)}
                      placeholder="you@organisation.org"
                      style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", fontFamily: "var(--mono)", fontSize: 13, background: "var(--parchment)", border: "1px solid var(--border)", color: "var(--ink)", outline: "none" }}
                    />
                  </div>
                  {freeError && (
                    <div style={{ background: "var(--crisis-light)", border: "1px solid var(--crisis)", padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)" }}>{freeError}</div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="submit" disabled={freeLoading || !freeEmail.trim()}
                      style={{ flex: 1, padding: "11px 0", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: freeLoading || !freeEmail.trim() ? "var(--ink-light)" : "var(--ink)", color: "var(--parchment)", border: "none", cursor: freeLoading || !freeEmail.trim() ? "not-allowed" : "pointer" }}
                    >
                      {freeLoading ? "Subscribing…" : "Subscribe →"}
                    </button>
                    <button
                      type="button" onClick={() => { setFreeModal(false); setFreeEmail(""); setFreeError(null); }}
                      style={{ padding: "11px 18px", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "var(--ink-mid)", border: "1px solid var(--border)", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", lineHeight: 1.6 }}>
                    No spam. Unsubscribe anytime by replying UNSUBSCRIBE.
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {modalTier && (
        <CheckoutModal
          tier={modalTier}
          onClose={() => { setModalTier(null); setCheckoutLoading(false); setCheckoutError(null); }}
          onSubmit={handleCheckoutSubmit}
          loading={checkoutLoading}
          error={checkoutError}
        />
      )}
      <SiteNav ctaHref="mailto:ceres@northflow.no" ctaLabel="Request Access →" />

      {/* Page header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Developer &amp; Institutional Access
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>CERES API</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
          Programmatic access to CERES predictions, hypotheses, and Admin1 signal data. Free for academic and humanitarian use. Paid tiers unlock real-time alerts, weekly PDF intelligence briefs, webhook delivery, scenario modelling, and team accounts.
        </p>
      </div>

      {/* Content grid */}
      <div className="methodology-layout" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, boxSizing: "border-box" }}>

        {/* Sidebar TOC */}
        <nav className="methodology-toc" style={{ position: "sticky", top: 64, alignSelf: "start", padding: "48px 32px 48px 0", borderRight: "1px solid var(--border-light)" }}>
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
        <article className="methodology-article api-article" style={{ padding: "48px 0 48px 56px" }}>

          <section id="access" style={section}>
            <div style={sectionLabel}>§ 1 — Access</div>
            <h2 style={h2Style}>Access Tiers</h2>
            <p style={pStyle}>All tiers access the same endpoints and data quality. Free subscribers receive the monthly intelligence newsletter. Paid tiers unlock higher request volume, real-time Tier I/II email alerts, a weekly digest, weekly PDF intelligence briefs, and webhook delivery to any endpoint.</p>

            {/* Checkout success / cancelled banners */}
            {checkoutStatus === "success" && (
              <div style={{ background: "#F1F8E9", border: "1px solid var(--watch)", padding: "12px 16px", marginBottom: 20, fontFamily: "var(--mono)", fontSize: 12, color: "var(--watch)", display: "flex", gap: 10, alignItems: "center" }}>
                <span>✓</span>
                <span>Subscription confirmed. Your API key has been emailed to you. Check your inbox.</span>
              </div>
            )}
            {checkoutStatus === "cancelled" && (
              <div style={{ background: "var(--warning-light)", border: "1px solid var(--warning)", padding: "12px 16px", marginBottom: 20, fontFamily: "var(--mono)", fontSize: 12, color: "var(--warning)", display: "flex", gap: 10, alignItems: "center" }}>
                <span>⚠</span>
                <span>Checkout was cancelled. No charge was made.</span>
              </div>
            )}
            {checkoutError && (
              <div style={{ background: "var(--crisis-light)", border: "1px solid var(--crisis)", padding: "12px 16px", marginBottom: 20, fontFamily: "var(--mono)", fontSize: 12, color: "var(--crisis)", display: "flex", gap: 10, alignItems: "center" }}>
                <span>✗</span>
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="tiers-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "24px 0" }}>
              {TIERS.map(({ key, tier, name, price, priceNote, highlight, cta, ctaAction, features }) => (
                <div key={tier} style={{ background: highlight ? "var(--ink)" : "white", padding: 28, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: highlight ? "#A8A29E" : "var(--ink-light)", marginBottom: 8 }}>{tier}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 4, color: highlight ? "var(--parchment)" : "var(--ink)" }}>{name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                    <span style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, color: highlight ? "#F4A261" : "var(--earth)" }}>{price}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: highlight ? "#A8A29E" : "var(--ink-light)" }}>{priceNote}</span>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, flex: 1, marginBottom: 20 }}>
                    {features.map((f) => (
                      <li key={f} style={{ fontSize: 12, color: highlight ? "#D6D3D1" : "var(--ink-mid)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                        <span style={{ color: highlight ? "#F4A261" : "var(--watch)", fontFamily: "var(--mono)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {ctaAction === "checkout" ? (
                    <button
                      onClick={() => { setModalTier(key); setCheckoutError(null); }}
                      style={{
                        width: "100%", padding: "11px 0",
                        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                        background: highlight ? "var(--earth)" : "var(--ink)",
                        color: "var(--parchment)", border: "none", cursor: "pointer",
                      }}
                    >
                      {cta}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setFreeModal(true); setFreeSuccess(false); setFreeError(null); setFreeEmail(""); }}
                      style={{
                        width: "100%", padding: "11px 0",
                        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                        background: "transparent", color: "var(--earth)", border: "1px solid var(--earth)",
                        cursor: "pointer",
                      }}
                    >
                      {cta}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-light)" }}>
              All paid subscriptions are billed monthly via Stripe and can be cancelled at any time. Questions? Email <a href="mailto:ceres@northflow.no" style={{ color: "var(--earth)" }}>ceres@northflow.no</a>.
            </p>
          </section>

          <section id="auth" style={section}>
            <div style={sectionLabel}>&sect; 2 &mdash; Authentication</div>
            <h2 style={h2Style}>Authentication &amp; Account</h2>
            <p style={pStyle}>
              Tier A (Open Research) endpoints are unauthenticated — no key required.
              Tier B and C endpoints require an <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>X-API-Key</code> header.
              Your key is emailed immediately after a successful Stripe checkout.
            </p>
            <Code>
              <Cm># Tier A — no authentication needed{"\n"}</Cm>
              {"GET "}<Str>https://ceres-core-production.up.railway.app/v1/predictions</Str>{"\n\n"}
              <Cm># Tier B / C — include your API key{"\n"}</Cm>
              {"GET "}<Str>https://ceres-core-production.up.railway.app/v1/reports</Str>{"\n"}
              <Key>{"X-API-Key"}</Key>{": "}<Str>ceres_xxxxxxxxxxxxxxxxxxxxxxxx</Str>
            </Code>
            <h3 style={h3Style}>Account Portal</h3>
            <p style={pStyle}>
              Sign in to your account at{" "}
              <a href="/login" style={{ color: "var(--earth)" }}>ceres.northflow.no/login</a>{" "}
              using a one-time magic link sent to your registered email — no password needed.
              From the account portal you can view your API key prefix, current usage,
              manage your billing subscription, and register webhook endpoints.
            </p>
            <div style={{ display: "flex", gap: 12, margin: "16px 0 0" }}>
              <a href="/login" style={{ display: "inline-block", padding: "10px 20px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", textDecoration: "none" }}>
                Sign In &rarr;
              </a>
              <a href="/account" style={{ display: "inline-block", padding: "10px 20px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "var(--ink)", border: "1px solid var(--border)", textDecoration: "none" }}>
                Account Portal &rarr;
              </a>
            </div>
          </section>

          <section id="alerts" style={section}>
            <div style={sectionLabel}>&sect; 3 &mdash; Alerts</div>
            <h2 style={h2Style}>Alerts &amp; Intelligence Delivery</h2>
            <p style={pStyle}>
              CERES delivers intelligence through three channels depending on your tier:
            </p>
            <div className="alerts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "20px 0 24px" }}>
              {[
                {
                  label: "Monthly Newsletter",
                  tier: "Tier A — Free",
                  color: "var(--ink-light)",
                  desc: "Monthly intelligence letter summarising the top risk regions, system status, and a note from Tom. Sent the first Monday of each month to all free subscribers.",
                },
                {
                  label: "Weekly Digest",
                  tier: "Tier B/C — Paid",
                  color: "var(--earth)",
                  desc: "Every Monday morning: top-5 regions by risk score, trend arrows vs. the previous week, and a brief founder's analysis. Delivered to all active paid subscribers.",
                },
                {
                  label: "Real-time Alerts",
                  tier: "Tier B/C — Paid",
                  color: "var(--crisis)",
                  desc: "Immediate email and/or webhook notification when any monitored region escalates to Tier I (Critical) or Tier II (Warning). Register webhook endpoints from your account portal.",
                },
                {
                  label: "PDF Intelligence Briefs",
                  tier: "Tier B/C — Paid",
                  color: "var(--earth)",
                  desc: "Weekly multi-page PDF report: cover, executive summary, full predictions table, and methodology. Auto-emailed after each pipeline run. Downloadable from your account portal. Tier C receives a white-labelled version with your organisation's name on the cover.",
                },
              ].map(({ label, tier: t, color, desc }) => (
                <div key={label} style={{ background: "white", padding: "20px 24px", borderLeft: `3px solid ${color}` }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 6 }}>{t}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>{label}</div>
                  <p style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <h3 style={h3Style}>Webhook Payload</h3>
            <p style={pStyle}>Tier B/C subscribers can register webhook URLs from their account portal. On each escalation event, CERES POSTs the following JSON payload:</p>
            <Code>
              {"POST "}<Str>https://your-endpoint.example.com/ceres-webhook</Str>{"\n\n"}
              {"Content-Type: application/json\n\n"}
              {"{{\n"}
              {"  "}<Key>"event"</Key>{": "}<Str>"ceres_alert"</Str>{",\n"}
              {"  "}<Key>"run_id"</Key>{": "}<Str>"CERES-20260303-060012"</Str>{",\n"}
              {"  "}<Key>"timestamp"</Key>{": "}<Str>"2026-03-03T06:00:12Z"</Str>{",\n"}
              {"  "}<Key>"n_alerts"</Key>{": "}<Num>2</Num>{",\n"}
              {"  "}<Key>"alerts"</Key>{": [\n"}
              {"    {{ "}<Key>"region_id"</Key>{": "}<Str>"SDN"</Str>{", "}<Key>"alert_tier"</Key>{": "}<Str>"TIER-1"</Str>{", "}<Key>"p_ipc3plus_90d"</Key>{": "}<Num>0.966</Num>{" }}\n"}
              {"  ]\n}}"}
            </Code>
          </section>

          <section id="hdx" style={section}>
            <div style={sectionLabel}>&sect; 4 &mdash; Open Data</div>
            <h2 style={h2Style}>Open Data — HXL-Tagged CSV</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "#F0FDF4", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.3)", padding: "4px 10px", marginBottom: 16 }}>
              ● Live — No authentication required
            </div>
            <p style={pStyle}>
              CERES prediction archives are available as HXL-tagged CSV, free and unauthenticated, for direct use
              in humanitarian data workflows, HDX pipelines, and academic research. Licensed under{" "}
              <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>ODbL</a>.
              Submissions to the{" "}
              <a href="https://data.humdata.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>OCHA Humanitarian Data Exchange (HDX)</a>{" "}
              are in progress.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "20px 0 24px" }}>
              {[
                {
                  label: "Latest Snapshot",
                  desc: "One row per monitored region — most recent pipeline run only. Suitable for dashboards and current situational awareness.",
                  url: `${API_BASE}/v1/export/hdx?latest=true`,
                  badge: "43 regions",
                },
                {
                  label: "Full Archive",
                  desc: "All weekly runs since launch — one row per region per run. Suitable for time-series analysis and calibration research.",
                  url: `${API_BASE}/v1/export/hdx`,
                  badge: "All runs",
                },
              ].map(({ label, desc, url, badge }) => (
                <div key={label} style={{ background: "white", padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{label}</div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--earth)", border: "1px solid var(--earth)", padding: "2px 7px", opacity: 0.7 }}>{badge}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.65, margin: "0 0 14px" }}>{desc}</p>
                  <a
                    href={url}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", padding: "8px 14px", textDecoration: "none" }}
                  >
                    Download CSV ↓
                  </a>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-light)", margin: "0 0 8px" }}>
              Row 1: column headers · Row 2: HXL hashtags (per{" "}
              <a href="https://hxlstandard.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--earth)" }}>HXL Standard</a>
              ) · Row 3+: data
            </p>
            <p style={{ fontSize: 12, color: "var(--ink-light)", margin: 0 }}>
              Grading ledger (predictions + outcomes): <a href={`${API_BASE}/v1/export/grades/csv`} style={{ color: "var(--earth)", fontFamily: "var(--mono)", fontSize: 11 }}>/v1/export/grades/csv</a>
            </p>
          </section>

          <section id="base" style={section}>
            <div style={sectionLabel}>&sect; 5 &mdash; Base URL</div>
            <h2 style={h2Style}>Connection</h2>
            <Code>
              <Cm># Production base URL{"\n"}</Cm>
              {"Base URL: "}<Str>https://ceres-core-production.up.railway.app</Str>{"\n\n"}
              <Cm># All endpoints require the version prefix{"\n"}</Cm>
              {"GET "}<Str>https://ceres-core-production.up.railway.app/v1/predictions</Str>{"\n\n"}
              <Cm># Tier B/C authentication — header, not Bearer token{"\n"}</Cm>
              {"X-API-Key: "}<Str>ceres_xxxxxxxxxxxxxxxxxxxxxxxx</Str>{"\n\n"}
              <Cm># Tier A — no key required{"\n"}</Cm>
              {"GET "}<Str>https://ceres-core-production.up.railway.app/v1/predictions</Str>
            </Code>
          </section>

          <section id="predictions" style={section}>
            <div style={sectionLabel}>&sect; 6 &mdash; Endpoints</div>
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
            <div style={sectionLabel}>&sect; 7 &mdash; Response Format</div>
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
            <div style={sectionLabel}>&sect; 8 &mdash; Attribution</div>
            <h2 style={h2Style}>Attribution Requirements</h2>
            <p style={pStyle}>All use of CERES data — whether in publications, dashboards, or operational systems — requires attribution to Northflow Technologies and CERES.</p>
            <Code>
              <Cm># Required attribution string{"\n"}</Cm>
              <Str>"Source: CERES (Calibrated Early-warning and Risk Estimation System),{"\n"} Northflow Technologies, 2026. ceres.northflow.no"</Str>
              {"\n\n"}
              <Cm># For academic publications, cite the paper{"\n"}</Cm>
              <Str>"Pedersen, T.D.S. (2026). CERES: A Probabilistic Early Warning{"\n"} System for Acute Food Insecurity. arXiv:2603.09425 [stat.AP]"</Str>
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

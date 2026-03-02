"use client";

import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const API_BASE = "https://ceres-core-production.up.railway.app";

export default function LoginPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? `Error ${resp.status}`);
      if (!data.sent) {
        setError(data.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "block", width: 20, height: 1, background: "var(--earth)" }} />
              Account Access
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginBottom: 10 }}>
              Sign in to CERES
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.7 }}>
              Enter your email and we&rsquo;ll send you a one-time login link. No password needed.
            </p>
          </div>

          {sent ? (
            <div style={{ background: "white", border: "1px solid var(--border)", borderLeft: "4px solid var(--watch)", padding: "28px 28px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--watch)", marginBottom: 12 }}>
                ✓ Link sent
              </div>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.75, marginBottom: 8 }}>
                Check your inbox at <strong>{email}</strong>.
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7 }}>
                The link expires in 15 minutes. Click it to sign in — no password needed.
                If you don&rsquo;t see it, check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid var(--border)", padding: "32px 32px" }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.org"
                  style={{
                    width: "100%", padding: "12px 14px", boxSizing: "border-box",
                    fontFamily: "var(--mono)", fontSize: 13,
                    background: "var(--parchment)", border: "1px solid var(--border)",
                    color: "var(--ink)", outline: "none",
                  }}
                />
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.3)", padding: "12px 14px", marginBottom: 18, fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)", lineHeight: 1.6 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%", padding: "13px 0",
                  fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  background: loading || !email.trim() ? "var(--ink-light)" : "var(--ink)",
                  color: "var(--parchment)", border: "none",
                  cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending…" : "Send login link →"}
              </button>

              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", marginTop: 16, lineHeight: 1.7 }}>
                Only works if you have a CERES account or alert subscription.{" "}
                <a href="/api-access" style={{ color: "var(--earth)" }}>Get access →</a>
              </p>
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, GradeRecord } from "@/lib/api";

const IPC_LABELS: Record<number, string> = {
  1: "Minimal",
  2: "Stressed",
  3: "Crisis",
  4: "Emergency",
  5: "Famine",
};

function tierColor(tier: string) {
  if (tier === "TIER-1") return "var(--crisis)";
  if (tier === "TIER-2") return "var(--warning)";
  return "var(--watch)";
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return s; }
}

export default function TrackerPage() {
  const [grades, setGrades]   = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "correct" | "incorrect">("all");

  useEffect(() => {
    api.grades()
      .then(d => setGrades(d.grades))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verified = grades.filter(g => g.tier_correct);
  const missed   = grades.filter(g => !g.tier_correct);
  const filtered = filter === "correct" ? verified : filter === "incorrect" ? missed : grades;

  const avgBrier = grades.length > 0
    ? (grades.reduce((s, g) => s + g.brier_score, 0) / grades.length).toFixed(4)
    : null;

  const p = { fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.8 } as const;

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Forecast Verification Record
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>CERES Was Right</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          The public record of every CERES prediction that has been verified against actual IPC outcomes. Every hit. Every miss. No curation.
        </p>
      </div>

      <div className="content-wrap" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px" }}>

        {/* Stats row */}
        {!loading && grades.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "48px 0 40px" }}>
            {[
              { val: String(grades.length), label: "Total Graded",    note: "Predictions with IPC outcome" },
              { val: String(verified.length), label: "Correct Alerts", note: `${grades.length > 0 ? ((verified.length / grades.length) * 100).toFixed(0) : 0}% hit rate` },
              { val: String(missed.length),   label: "Missed Alerts",  note: "Tier direction incorrect" },
              { val: avgBrier ?? "—",         label: "Brier Score",    note: "Mean — lower is better" },
            ].map(({ val, label, note }) => (
              <div key={label} style={{ background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{note}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && grades.length > 0 && (
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--ink)", marginBottom: 24 }}>
            {(["all", "correct", "incorrect"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                borderBottom: filter === f ? "2px solid var(--earth)" : "2px solid transparent",
                marginBottom: -2,
                color: filter === f ? "var(--earth)" : "var(--ink-light)",
              }}>
                {f === "all" ? `All (${grades.length})` : f === "correct" ? `✓ Correct (${verified.length})` : `✗ Missed (${missed.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
            Loading verification record…
          </div>
        ) : grades.length === 0 ? (
          <>
            {/* Pending state — explain what this page will become */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "48px 0", borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>What this page will show</div>
                <h2 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>The permanent public record of what CERES predicted — and whether it was right</h2>
                <p style={p}>Starting in May–June 2026, when the first batch of CERES predictions reach their T+90 day horizon, this page will auto-populate with verified outcomes.</p>
                <p style={p}>Each card will show the original prediction (probability, tier, drivers), the actual IPC outcome published by OCHA/IPC, and whether CERES was directionally correct.</p>
                <p style={p}>We will not remove cards where CERES was wrong. Every miss is as visible as every hit. That is the point.</p>
              </div>
              <div style={{ border: "1px solid var(--border)", background: "white", padding: 32 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>First Predictions Pending Grading</div>
                {[
                  { region: "Sudan",       tier: "TIER-1", prob: "96.6%", issued: "28 Feb 2026", horizon: "29 May 2026" },
                  { region: "Somalia",     tier: "TIER-1", prob: "96.2%", issued: "28 Feb 2026", horizon: "29 May 2026" },
                  { region: "Yemen",       tier: "TIER-1", prob: "95.2%", issued: "28 Feb 2026", horizon: "29 May 2026" },
                  { region: "Ethiopia",    tier: "TIER-1", prob: "92.0%", issued: "28 Feb 2026", horizon: "29 May 2026" },
                  { region: "South Sudan", tier: "TIER-1", prob: "91.8%", issued: "28 Feb 2026", horizon: "29 May 2026" },
                ].map((r, i) => (
                  <div key={r.region} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--border-light)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: "var(--ink)" }}>{r.region}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 2 }}>{r.issued} → {r.horizon}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--crisis)", fontWeight: 600 }}>{r.prob}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--crisis)", marginTop: 2 }}>{r.tier}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warning)", padding: "3px 8px", border: "1px solid rgba(217,119,6,0.3)", background: "#FFFBEB" }}>⟳ PENDING</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why this matters */}
            <div style={{ padding: "48px 0", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>Why this matters</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, marginBottom: 24, lineHeight: 1.3 }}>Falsifiability is not a feature. It is the foundation.</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
                {[
                  { title: "Most EWS systems don't publish misses", body: "Early warning systems routinely publish retrospective accuracy statistics but rarely maintain a public record of every prediction that proved wrong. CERES does. Every miss is permanent and visible." },
                  { title: "Calibration requires exposure", body: "A probability estimate that is never tested against outcomes is not a calibrated forecast — it is an assertion. The only way to know if CERES's 96% means 96% is to check it against 96% of outcomes." },
                  { title: "Humanitarian trust requires track record", body: "A programme officer committing $10M in pre-positioning based on a CERES Tier I alert needs to know what the historical hit rate is. This page builds that record in public, in real time." },
                ].map(({ title, body }) => (
                  <div key={title}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink)", marginBottom: 8, fontWeight: 500 }}>{title}</div>
                    <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.7, margin: 0 }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Live verified predictions grid */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {filtered.map(g => (
              <div key={g.hypothesis_id} style={{
                border: `1px solid var(--border)`,
                borderLeft: `4px solid ${g.tier_correct ? "var(--watch)" : "var(--crisis)"}`,
                background: "white",
                padding: 24,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{g.region_name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.06em" }}>
                      {g.region_id} · Issued {fmtDate(g.reference_date)} · Horizon {fmtDate(g.horizon_date)}
                    </div>
                  </div>
                  {g.tier_correct
                    ? <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "4px 10px", background: "#F0FDF4", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.3)", whiteSpace: "nowrap" }}>✓ Verified</span>
                    : <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "4px 10px", background: "#FEF2F2", color: "var(--crisis)", border: "1px solid rgba(192,57,43,0.3)", whiteSpace: "nowrap" }}>✗ Missed</span>
                  }
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ border: "1px solid var(--border-light)", padding: "12px 14px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 6 }}>CERES Predicted</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, color: tierColor(g.predicted_tier), lineHeight: 1, marginBottom: 4 }}>
                      {fmtPct(g.p_ipc3plus_90d)}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: tierColor(g.predicted_tier) }}>{g.predicted_tier}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 4 }}>
                      CI [{fmtPct(g.ci_90_low)}–{fmtPct(g.ci_90_high)}]
                    </div>
                  </div>
                  <div style={{ border: "1px solid var(--border-light)", padding: "12px 14px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 6 }}>IPC Outcome</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, color: g.actual_ipc_phase >= 3 ? "var(--crisis)" : "var(--watch)", lineHeight: 1, marginBottom: 4 }}>
                      Phase {g.actual_ipc_phase}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                      {IPC_LABELS[Math.round(g.actual_ipc_phase)] ?? "—"}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: g.outcome_ipc3plus ? "var(--crisis)" : "var(--watch)", marginTop: 4 }}>
                      {g.outcome_ipc3plus ? "IPC 3+ confirmed" : "Below IPC 3"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                    Brier score: <strong style={{ color: "var(--ink)" }}>{g.brier_score.toFixed(4)}</strong>
                    {" "}·{" "}
                    CI covered: <strong style={{ color: g.ci_covered ? "var(--watch)" : "var(--crisis)" }}>{g.ci_covered ? "Yes" : "No"}</strong>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                    Graded {fmtDate(g.graded_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commitment block */}
        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "28px 32px", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>The public record is permanent</div>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", margin: 0, lineHeight: 1.75 }}>
            Every prediction on this page was issued publicly before the outcome was known. None have been removed. None have been edited post-hoc.
            Grading is automated — the system queries FEWS NET / IPC Phase data at T+90 days and records the result without human intervention.
            The Brier scores and calibration metrics on the <a href="/validation" style={{ color: "var(--earth)" }}>Validation page</a> are derived directly from this ledger.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

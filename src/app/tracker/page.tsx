"use client";

import { useEffect, useState, useMemo } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, GradeRecord, RegionSnapshot, ArchiveStats } from "@/lib/api";

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

function tierBg(tier: string) {
  if (tier === "TIER-1") return "#FEF2F2";
  if (tier === "TIER-2") return "#FFFBEB";
  return "#F0FDF4";
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return s; }
}

function fmtDateShort(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch { return s; }
}

// ── Mini sparkline SVG chart ───────────────────────────────────────────────
function Sparkline({ data, width = 320, height = 80 }: { data: RegionSnapshot[]; width?: number; height?: number }) {
  const pts = useMemo(() => {
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => a.run_date.localeCompare(b.run_date));
    const xs = sorted.map((_, i) => (i / (sorted.length - 1)) * width);
    const ys = sorted.map(s => height - s.p_ipc3plus_90d * (height - 8) - 4);
    const ciLow  = sorted.map(s => height - s.ci_90_low  * (height - 8) - 4);
    const ciHigh = sorted.map(s => height - s.ci_90_high * (height - 8) - 4);

    const linePath  = sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const ciPath = [
      ...sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ciHigh[i].toFixed(1)}`),
      ...sorted.map((_, i) => `L${xs[sorted.length - 1 - i].toFixed(1)},${ciLow[sorted.length - 1 - i].toFixed(1)}`),
      "Z",
    ].join(" ");

    return { linePath, ciPath, sorted, xs, ys };
  }, [data, width, height]);

  if (!pts) return null;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {/* 50% line */}
      <line x1={0} y1={height - 0.5 * (height - 8) - 4} x2={width} y2={height - 0.5 * (height - 8) - 4}
        stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
      {/* CI band */}
      <path d={pts.ciPath} fill="var(--earth)" fillOpacity={0.1} />
      {/* Main line */}
      <path d={pts.linePath} fill="none" stroke="var(--earth)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Latest dot */}
      <circle cx={pts.xs[pts.xs.length - 1]} cy={pts.ys[pts.ys.length - 1]} r={4} fill="var(--earth)" />
    </svg>
  );
}

export default function TrackerPage() {
  // ── Grades (verification record) ──────────────────────────────
  const [grades, setGrades]   = useState<GradeRecord[]>([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "correct" | "incorrect">("all");

  // ── Archive (historical timeline) ─────────────────────────────
  const [latest,        setLatest]        = useState<RegionSnapshot[]>([]);
  const [archiveStats,  setArchiveStats]  = useState<ArchiveStats | null>(null);
  const [selRegion,     setSelRegion]     = useState<string | null>(null);
  const [history,       setHistory]       = useState<RegionSnapshot[]>([]);
  const [histLoading,   setHistLoading]   = useState(false);
  const [archiveTab,    setArchiveTab]    = useState<"timeline" | "verification">("timeline");
  const [miniHistory,   setMiniHistory]   = useState<Record<string, RegionSnapshot[]>>({});

  useEffect(() => {
    api.grades()
      .then(d => setGrades(d.grades))
      .catch(() => {})
      .finally(() => setGradesLoading(false));

    Promise.all([api.archiveLatest(), api.archiveStats()])
      .then(([lat, stats]) => {
        setLatest(lat);
        setArchiveStats(stats);
        if (lat.length > 0 && !selRegion) setSelRegion(lat[0].region_id);
        // Pre-fetch mini history for all regions (last 8 runs each)
        lat.forEach(s => {
          api.archiveRegion(s.region_id, 8)
            .then(snaps => setMiniHistory(prev => ({ ...prev, [s.region_id]: snaps })))
            .catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selRegion) return;
    setHistLoading(true);
    api.archiveRegion(selRegion, 52)
      .then(d => setHistory(d))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, [selRegion]);

  const verified = grades.filter(g => g.tier_correct);
  const missed   = grades.filter(g => !g.tier_correct);
  const filtered = filter === "correct" ? verified : filter === "incorrect" ? missed : grades;
  const avgBrier = grades.length > 0
    ? (grades.reduce((s, g) => s + g.brier_score, 0) / grades.length).toFixed(4)
    : null;

  const selSnap = latest.find(s => s.region_id === selRegion);
  const sortedHistory = [...history].sort((a, b) => a.run_date.localeCompare(b.run_date));

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Forecast Track Record
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>CERES Track Record</h1>
        <p style={{ fontSize: 17, color: "var(--ink-mid)", maxWidth: 640, lineHeight: 1.7, fontWeight: 300 }}>
          The complete public history of CERES predictions — weekly snapshots per region, confidence trends, and verified outcomes. Every run archived since launch.
        </p>
      </div>

      <div className="content-wrap" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px" }}>

        {/* Archive stats */}
        {archiveStats && (
          <div className="tracker-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "48px 0 40px" }}>
            {[
              { val: String(archiveStats.total_runs),      label: "Weekly Runs",    note: archiveStats.earliest_run ? `Since ${fmtDate(archiveStats.earliest_run)}` : "Archiving active" },
              { val: String(archiveStats.total_regions),   label: "Regions Tracked", note: "Monitored globally"  },
              { val: String(archiveStats.total_snapshots), label: "Snapshots",       note: "Region × run records" },
              { val: grades.length > 0 ? `${((verified.length / grades.length) * 100).toFixed(0)}%` : "—", label: "Verified Hit Rate", note: grades.length > 0 ? `${grades.length} graded` : "Grading from May 2026" },
            ].map(({ val, label, note }) => (
              <div key={label} style={{ background: "white", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: "var(--earth)", lineHeight: 1, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 12, color: "var(--ink-light)" }}>{note}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid var(--ink)", marginBottom: 32 }}>
          {([["timeline", "Risk Timeline"], ["verification", "Verified Outcomes"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setArchiveTab(t)} style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
              borderBottom: archiveTab === t ? "2px solid var(--earth)" : "2px solid transparent",
              marginBottom: -2, color: archiveTab === t ? "var(--earth)" : "var(--ink-light)",
            }}>{label}</button>
          ))}
        </div>

        {/* ── TAB: Timeline ──────────────────────────────────────────── */}
        {archiveTab === "timeline" && (
          latest.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
              No archive data yet — run the weekly pipeline to begin building the history.
            </div>
          ) : (
            <div className="tracker-panel-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, border: "1px solid var(--border)" }}>
              {/* Region list */}
              <div className="tracker-region-list" style={{ borderRight: "1px solid var(--border)", maxHeight: 640, overflowY: "auto" }}>
                {latest.map(s => {
                  const mini = (miniHistory[s.region_id] ?? []).sort((a, b) => a.run_date.localeCompare(b.run_date));
                  const trend = mini.length >= 2 ? mini[mini.length - 1].p_ipc3plus_90d - mini[0].p_ipc3plus_90d : 0;
                  const trendArrow = trend > 0.03 ? "↑" : trend < -0.03 ? "↓" : "→";
                  const trendColor = trend > 0.03 ? "var(--crisis)" : trend < -0.03 ? "var(--watch)" : "var(--ink-light)";
                  return (
                  <button key={s.region_id} onClick={() => setSelRegion(s.region_id)} style={{
                    width: "100%", textAlign: "left", padding: "12px 18px 10px",
                    background: selRegion === s.region_id ? tierBg(s.alert_tier) : "white",
                    borderBottom: "1px solid var(--border-light)", border: "none",
                    borderLeft: selRegion === s.region_id ? `3px solid ${tierColor(s.alert_tier)}` : "3px solid transparent",
                    cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--ink)" }}>{s.region_name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", fontWeight: 700 }}>{fmtPct(s.p_ipc3plus_90d)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: tierColor(s.alert_tier) }}>{s.alert_tier}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: trendColor, fontWeight: 700 }} title={`${trend >= 0 ? "+" : ""}${(trend * 100).toFixed(1)}% over ${mini.length} runs`}>{trendArrow}</span>
                      {mini.length >= 3 && (
                        <svg width={60} height={18} style={{ display: "block", overflow: "visible" }}>
                          {(() => {
                            const pts = mini.map((m, i) => [i / (mini.length - 1) * 60, 18 - m.p_ipc3plus_90d * 14 - 2] as [number, number]);
                            const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
                            return <path d={d} fill="none" stroke={tierColor(s.alert_tier)} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />;
                          })()}
                        </svg>
                      )}
                    </div>
                  </button>
                  );
                })}
              </div>

              {/* Detail panel */}
              <div style={{ background: "white", padding: 32 }}>
                {!selSnap ? (
                  <div style={{ color: "var(--ink-light)", fontFamily: "var(--mono)", fontSize: 11 }}>Select a region</div>
                ) : (
                  <>
                    {/* Region header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                      <div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{selSnap.region_name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.06em" }}>
                          {selSnap.region_id} · Latest run {fmtDate(selSnap.run_date)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 700, color: tierColor(selSnap.alert_tier), lineHeight: 1 }}>
                          {fmtPct(selSnap.p_ipc3plus_90d)}
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: tierColor(selSnap.alert_tier), marginTop: 4 }}>
                          {selSnap.alert_tier} · CI [{fmtPct(selSnap.ci_90_low)}–{fmtPct(selSnap.ci_90_high)}]
                        </div>
                      </div>
                    </div>

                    {/* Sparkline */}
                    {histLoading ? (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", padding: "20px 0" }}>Loading history…</div>
                    ) : history.length >= 2 ? (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>
                          P(IPC3+ / 90d) — {history.length} weeks · 90% CI band
                        </div>
                        <div style={{ position: "relative" }}>
                          <div style={{ position: "absolute", right: 0, top: 0, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>100%</div>
                          <div style={{ position: "absolute", right: 0, top: "50%", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>50%</div>
                          <div style={{ position: "absolute", right: 0, bottom: 0, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>0%</div>
                          <Sparkline data={history} width={580} height={100} />
                        </div>
                        {/* X-axis dates */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{fmtDateShort(sortedHistory[0]?.run_date)}</span>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{fmtDateShort(sortedHistory[sortedHistory.length - 1]?.run_date)}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", padding: "12px 0 24px" }}>
                        Only {history.length} run recorded — chart requires ≥ 2 weekly runs.
                      </div>
                    )}

                    {/* History table */}
                    {sortedHistory.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-light)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "100px 80px 80px 80px 80px 1fr", gap: 0, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          {["Run date", "P(IPC3+)", "CI Low", "CI High", "Tier", "Drivers"].map(h => (
                            <div key={h} style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", padding: "0 6px" }}>{h}</div>
                          ))}
                        </div>
                        {[...sortedHistory].reverse().slice(0, 20).map(s => (
                          <div key={s.run_id} style={{ display: "grid", gridTemplateColumns: "100px 80px 80px 80px 80px 1fr", gap: 0, padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink)" }}>{fmtDateShort(s.run_date)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: tierColor(s.alert_tier), fontWeight: 600 }}>{fmtPct(s.p_ipc3plus_90d)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink-mid)" }}>{fmtPct(s.ci_90_low)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink-mid)" }}>{fmtPct(s.ci_90_high)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "0 6px", color: tierColor(s.alert_tier) }}>{s.alert_tier}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "0 6px", color: "var(--ink-light)" }}>{s.driver_types.slice(0, 3).join(", ")}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        )}

        {/* ── TAB: Verified Outcomes ─────────────────────────────────── */}
        {archiveTab === "verification" && (
          gradesLoading ? (
            <div style={{ padding: "60px 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>
              Loading verification record…
            </div>
          ) : grades.length === 0 ? (
            <div style={{ padding: "48px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 48 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 12 }}>What this section will show</div>
                  <h2 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>The permanent record of what CERES predicted — and whether it was right</h2>
                  <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.8 }}>Starting May–June 2026, when the first predictions reach their T+90 horizon, this section auto-populates with IPC-verified outcomes.</p>
                  <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.8 }}>Misses are as visible as hits. No curation, no removal.</p>
                </div>
                <div style={{ border: "1px solid var(--border)", background: "white", padding: 32 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>First predictions pending grading</div>
                  {[
                    { region: "Sudan",       tier: "TIER-1", prob: "96.6%", horizon: "29 May 2026" },
                    { region: "Somalia",     tier: "TIER-1", prob: "96.2%", horizon: "29 May 2026" },
                    { region: "Yemen",       tier: "TIER-1", prob: "95.2%", horizon: "29 May 2026" },
                    { region: "Ethiopia",    tier: "TIER-1", prob: "92.0%", horizon: "29 May 2026" },
                    { region: "South Sudan", tier: "TIER-1", prob: "91.8%", horizon: "29 May 2026" },
                  ].map((r, i) => (
                    <div key={r.region} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border-light)" : "none" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{r.region}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--crisis)", fontWeight: 600 }}>{r.prob}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warning)", padding: "2px 8px", border: "1px solid rgba(217,119,6,0.3)", background: "#FFFBEB" }}>⟳ {r.horizon}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border-light)", marginBottom: 24 }}>
                {(["all", "correct", "incorrect"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "8px 20px", background: "none", border: "none", cursor: "pointer",
                    borderBottom: filter === f ? "2px solid var(--earth)" : "2px solid transparent",
                    color: filter === f ? "var(--earth)" : "var(--ink-light)",
                  }}>
                    {f === "all" ? `All (${grades.length})` : f === "correct" ? `✓ Correct (${verified.length})` : `✗ Missed (${missed.length})`}
                  </button>
                ))}
                {avgBrier && (
                  <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", display: "flex", alignItems: "center" }}>
                    Mean Brier: <strong style={{ color: "var(--earth)", marginLeft: 6 }}>{avgBrier}</strong>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {filtered.map(g => (
                  <div key={g.hypothesis_id} style={{
                    border: "1px solid var(--border)",
                    borderLeft: `4px solid ${g.tier_correct ? "var(--watch)" : "var(--crisis)"}`,
                    background: "white", padding: 24,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{g.region_name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                          Issued {fmtDate(g.reference_date)} · Horizon {fmtDate(g.horizon_date)}
                        </div>
                      </div>
                      {g.tier_correct
                        ? <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "4px 10px", background: "#F0FDF4", color: "var(--watch)", border: "1px solid rgba(46,125,50,0.3)" }}>✓ Verified</span>
                        : <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "4px 10px", background: "#FEF2F2", color: "var(--crisis)", border: "1px solid rgba(192,57,43,0.3)" }}>✗ Missed</span>
                      }
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div style={{ border: "1px solid var(--border-light)", padding: "10px 12px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>CERES Predicted</div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: tierColor(g.predicted_tier) }}>{fmtPct(g.p_ipc3plus_90d)}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: tierColor(g.predicted_tier) }}>{g.predicted_tier}</div>
                      </div>
                      <div style={{ border: "1px solid var(--border-light)", padding: "10px 12px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>IPC Outcome</div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: g.actual_ipc_phase >= 3 ? "var(--crisis)" : "var(--watch)" }}>Phase {g.actual_ipc_phase}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{IPC_LABELS[Math.round(g.actual_ipc_phase)] ?? "—"}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                      Brier <strong style={{ color: "var(--ink)" }}>{g.brier_score.toFixed(4)}</strong>
                      {" · "}CI covered <strong style={{ color: g.ci_covered ? "var(--watch)" : "var(--crisis)" }}>{g.ci_covered ? "Yes" : "No"}</strong>
                      {" · "}Graded {fmtDate(g.graded_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* Commitment block */}
        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "28px 32px", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>The public record is permanent</div>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", margin: 0, lineHeight: 1.75 }}>
            Every prediction on this page was issued publicly before the outcome was known. None have been removed. None have been edited post-hoc.
            Grading is automated — the system queries FEWS NET / IPC Phase data at T+90 days and records the result without human intervention.
            Brier scores and calibration metrics on the <a href="/validation" style={{ color: "var(--earth)" }}>Validation page</a> are derived directly from this ledger.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

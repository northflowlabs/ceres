"use client";

import { useEffect, useState, useMemo } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import type { RegionSnapshot } from "@/lib/api";
import { useSiteData } from "@/lib/useSiteData";
import { fmtInt } from "@/lib/utils";
import { regionName } from "@/lib/regionNames";
import type { TrackerData } from "@/lib/serverData";

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

function fmtPct(n: number | null | undefined) {
  if (n == null) return "n/a";
  return `${(n * 100).toFixed(1)}%`;
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  } catch { return s; }
}

function fmtDateShort(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  } catch { return s; }
}

// ── Mini sparkline SVG chart ───────────────────────────────────────────────
function Sparkline({ data, width = 320, height = 80 }: { data: RegionSnapshot[]; width?: number; height?: number }) {
  const pts = useMemo(() => {
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => a.run_date.localeCompare(b.run_date));
    const xs = sorted.map((_, i) => (i / (sorted.length - 1)) * width);
    const ys = sorted.map(s => height - s.p_ipc3plus_90d * (height - 8) - 4);
    const hasCi = sorted.every(s => s.sensitivity_interval_low != null && s.sensitivity_interval_high != null);
    const ciLow  = hasCi ? sorted.map(s => height - s.sensitivity_interval_low!  * (height - 8) - 4) : [];
    const ciHigh = hasCi ? sorted.map(s => height - s.sensitivity_interval_high! * (height - 8) - 4) : [];

    const linePath  = sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const ciPath = hasCi ? [
      ...sorted.map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ciHigh[i].toFixed(1)}`),
      ...sorted.map((_, i) => `L${xs[sorted.length - 1 - i].toFixed(1)},${ciLow[sorted.length - 1 - i].toFixed(1)}`),
      "Z",
    ].join(" ") : null;

    return { linePath, ciPath, sorted, xs, ys };
  }, [data, width, height]);

  if (!pts) return null;

  return (
    <svg role="img" aria-label="Probability of IPC Phase 3+ by run" width={width} height={height} style={{ overflow: "visible" }}>
      {/* 50% line */}
      <line x1={0} y1={height - 0.5 * (height - 8) - 4} x2={width} y2={height - 0.5 * (height - 8) - 4}
        stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
      {/* SI band */}
      {pts.ciPath && <path d={pts.ciPath} fill="var(--earth)" fillOpacity={0.1} />}
      {/* Main line */}
      <path d={pts.linePath} fill="none" stroke="var(--earth)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Latest dot */}
      <circle cx={pts.xs[pts.xs.length - 1]} cy={pts.ys[pts.ys.length - 1]} r={4} fill="var(--earth)" />
    </svg>
  );
}

export default function TrackerPage({ initial }: { initial: TrackerData | null }) {
  const { data, failed } = useSiteData<TrackerData>("tracker", initial);
  const grades = useMemo(() => data?.grades ?? [], [data]);
  const latest = useMemo(() => data?.latest ?? [], [data]);
  const archiveStats = data?.archive ?? null;
  const runs = data?.runs ?? null;
  const nPending = data?.metrics.pending ?? null;
  const gradesLoading = !data && !failed;

  const [selRegion,     setSelRegion]     = useState<string | null>(initial?.latest[0]?.region_id ?? null);
  const [archiveTab,    setArchiveTab]    = useState<"timeline" | "verification" | "pending">("timeline");

  const histories = data?.history;
  const history = useMemo(() => (selRegion && histories?.[selRegion]) || [], [selRegion, histories]);

  useEffect(() => {
    if (latest.length > 0) setSelRegion(r => r ?? latest[0].region_id);
  }, [latest]);

  const verified = grades.filter(g => g.tier_correct);
  const avgBrier = data?.meanBrier != null ? data.meanBrier.toFixed(4) : null;

  // The next predictions in the ledger to reach their grading date.
  const today = new Date();
  const pendingPredictions = (data?.next ?? []).map(r => {
    const horizonDate = new Date(r.grading_date);
    const daysUntil = Math.ceil((horizonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      prediction_id: r.prediction_id,
      region_id: r.region_id,
      region_name: regionName(r.region_id),
      run_date: r.reference_date,
      alert_tier: r.alert_tier,
      p_ipc3plus_90d: r.p_ipc3plus,
      horizonDate,
      daysUntil,
    };
  });

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
          The public archive of CERES predictions: run snapshots per region, probability trends with sensitivity intervals, and graded outcomes.
        </p>
      </div>

      <div className="content-wrap" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 40px 80px" }}>

        {/* Archive stats */}
        {archiveStats && (
          <div className="tracker-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", margin: "48px 0 40px" }}>
            {[
              { val: runs ? String(runs.length) : "…",      label: "Published Runs",      note: runs?.length ? `Since ${fmtDate([...runs].sort()[0])}` : "" },
              { val: String(archiveStats.total_regions),   label: "Regions Tracked",   note: "Monitored globally"  },
              { val: fmtInt(nPending), label: "Pending Grading", note: "Before their T+90 date" },
              { val: grades.length > 0 ? `${((verified.length / grades.length) * 100).toFixed(0)}%` : "…", label: "Directional Agreement", note: grades.length > 0 ? `P(IPC 3+) on the side of 50% the outcome took, ${grades.length} graded` : "" },
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
          {([ ["timeline", "Risk Timeline"], ["pending", `Next to Grade (${pendingPredictions.length})`], ["verification", "Verified Outcomes"] ] as const).map(([t, label]) => (
            <button key={t} aria-pressed={archiveTab === t} onClick={() => setArchiveTab(t)} style={{
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
              The archive is unavailable right now.
            </div>
          ) : (
            <div className="tracker-panel-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, border: "1px solid var(--border)" }}>
              {/* Region list */}
              <div className="tracker-region-list" style={{ borderRight: "1px solid var(--border)", maxHeight: 640, overflowY: "auto" }}>
                {latest.map(s => {
                  const mini = ((histories?.[s.region_id] ?? []).slice(0, 8) ?? []).sort((a, b) => a.run_date.localeCompare(b.run_date));
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
                        <svg role="img" aria-label="Recent probability trend" width={60} height={18} style={{ display: "block", overflow: "visible" }}>
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
                          {selSnap.alert_tier}{selSnap.sensitivity_interval_low != null && selSnap.sensitivity_interval_high != null ? ` · SI [${fmtPct(selSnap.sensitivity_interval_low)}-${fmtPct(selSnap.sensitivity_interval_high)}]` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Sparkline */}
                    {history.length >= 2 ? (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>
                          P(IPC3+ / 90d), {history.length} published runs · 90% sensitivity interval (SI)
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
                        A trend chart needs at least two published runs.
                      </div>
                    )}

                    {/* History table */}
                    {sortedHistory.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-light)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "100px 80px 80px 80px 80px 1fr", gap: 0, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          {["Run date", "P(IPC3+)", "SI Low", "SI High", "Tier", "Drivers"].map(h => (
                            <div key={h} style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", padding: "0 6px" }}>{h}</div>
                          ))}
                        </div>
                        {[...sortedHistory].reverse().slice(0, 20).map(s => (
                          <div key={s.run_date} style={{ display: "grid", gridTemplateColumns: "100px 80px 80px 80px 80px 1fr", gap: 0, padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink)" }}>{fmtDateShort(s.run_date)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: tierColor(s.alert_tier), fontWeight: 600 }}>{fmtPct(s.p_ipc3plus_90d)}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink-mid)" }}>{s.sensitivity_interval_low != null ? fmtPct(s.sensitivity_interval_low) : "n/a"}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "0 6px", color: "var(--ink-mid)" }}>{s.sensitivity_interval_high != null ? fmtPct(s.sensitivity_interval_high) : "n/a"}</div>
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
                  <h2 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>The permanent record of what CERES predicted, and whether it was right</h2>
                  <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.8 }}>The first T+90 horizons were reached in June 2026. This section fills as the FEWS NET data for each grading window is published.</p>
                  <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 14, lineHeight: 1.8 }}>Outcomes are graded against the FEWS NET proxy, never against forecasts.</p>
                </div>
                <div style={{ border: "1px solid var(--border)", background: "white", padding: 32 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 20 }}>Next predictions to grade</div>
                  {pendingPredictions.slice(0, 5).map((r, i) => {
                    const h = r.horizonDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
                    return (
                      <div key={r.prediction_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border-light)" : "none" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{r.region_name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: tierColor(r.alert_tier), fontWeight: 600 }}>{fmtPct(r.p_ipc3plus_90d)}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warning)", padding: "2px 8px", border: "1px solid rgba(217,119,6,0.3)", background: "#FFFBEB" }}>Grading: {h}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border-light)", marginBottom: 24, paddingBottom: 8, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
                {grades.length} graded against the FEWS NET proxy
                {avgBrier && (
                  <div style={{ marginLeft: "auto" }}>
                    Mean Brier: <strong style={{ color: "var(--earth)", marginLeft: 6 }}>{avgBrier}</strong>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {grades.map(g => (
                  <div key={`${g.region_id}-${g.reference_date}`} style={{
                    border: "1px solid var(--border)",
                    background: "white", padding: 24,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{g.region_name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                          Issued {fmtDate(g.reference_date)} · Horizon {fmtDate(g.horizon_date)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div style={{ border: "1px solid var(--border-light)", padding: "10px 12px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>CERES Predicted</div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: tierColor(g.predicted_tier) }}>{fmtPct(g.p_ipc3plus_90d)}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: tierColor(g.predicted_tier) }}>{g.predicted_tier}</div>
                      </div>
                      <div style={{ border: "1px solid var(--border-light)", padding: "10px 12px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>FEWS NET Proxy</div>
                        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Phase {g.actual_ipc_phase}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{IPC_LABELS[Math.round(g.actual_ipc_phase)] ?? "n/a"}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                      Brier <strong style={{ color: "var(--ink)" }}>{g.brier_score.toFixed(4)}</strong>
                      {" · "}SI covered <strong style={{ color: "var(--ink)" }}>{g.ci_covered ? "Yes" : "No"}</strong>
                      {" · "}Graded {fmtDate(g.graded_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── TAB: Pending ────────────────────────────────────────── */}
        {archiveTab === "pending" && (
          <div>
            <p style={{ fontSize: 14, color: "var(--ink-mid)", marginBottom: 28, lineHeight: 1.7, maxWidth: 680 }}>
              Every prediction below was issued publicly before the outcome is known. Each carries a hard 90-day horizon date: the date after which the grading module queries FEWS NET data for the proxy and records the outcome automatically.
            </p>
            <div style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Region", "Issued", "P(IPC3+)", "Tier", "Horizon date", "Days remaining"].map(h => (
                      <th scope="col" key={h} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--ink)", color: "var(--parchment)", padding: "10px 14px", textAlign: h === "Region" ? "left" : "right", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingPredictions.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: "32px 14px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)" }}>No pending predictions to show.</td></tr>
                  ) : pendingPredictions.map(r => {
                    const urgency = r.daysUntil <= 14 ? "var(--crisis)" : r.daysUntil <= 30 ? "var(--warning)" : "var(--ink-light)";
                    return (
                      <tr key={r.prediction_id} style={{ borderBottom: "1px solid var(--border-light)", background: r.alert_tier === "TIER-1" ? "rgba(192,57,43,0.02)" : "white" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ fontWeight: 600, color: "var(--ink)" }}>{r.region_name}</span>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginLeft: 6 }}>{r.region_id}</span>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-mid)" }}>{fmtDate(r.run_date)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: tierColor(r.alert_tier) }}>{fmtPct(r.p_ipc3plus_90d)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: tierColor(r.alert_tier), background: tierBg(r.alert_tier), padding: "2px 8px" }}>{r.alert_tier}</span>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-mid)" }}>
                          {r.horizonDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: urgency }}>
                          {r.daysUntil}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 16 }}>
              Grading is automated. Once a prediction passes T+90, the system queries FEWS NET for the proxy phase of its grading window, then records the Brier score.
            </p>
          </div>
        )}

        {/* Commitment block */}
        <div style={{ background: "var(--parchment-dark)", border: "1px solid var(--border)", borderLeft: "3px solid var(--earth)", padding: "28px 32px", margin: "48px 0 0" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>The public record is permanent</div>
          <p style={{ fontSize: 14, color: "var(--ink-mid)", margin: 0, lineHeight: 1.75 }}>
            Every prediction on this page was issued before its outcome was known.
            Grading is automated: the system queries FEWS NET data after T+90 days and records the result.
            Brier scores and calibration metrics on the <a href="/validation" style={{ color: "var(--earth)" }}>Validation page</a> are derived directly from this ledger.
          </p>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  X, Shield, AlertCircle, MapPin,
  Activity, CheckCircle2, XCircle, ChevronRight,
  Info, BarChart3, Loader2,
} from "lucide-react";
import { Hypothesis, api } from "@/lib/api";
import { pct, ciStr, tierLabel, stressColor, ipcPhaseLabel, formatDate } from "@/lib/utils";
import DriverRadar from "./DriverRadar";
import Admin1DrillDown from "./Admin1DrillDown";

interface HypothesisPanelProps {
  hypothesis: Hypothesis;
  onClose: () => void;
}

type PanelTab = "overview" | "drivers" | "evidence" | "subnational";

const TAB_ITEMS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",     icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "drivers",     label: "Drivers",      icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "evidence",    label: "Evidence",     icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "subnational", label: "Sub-national", icon: <MapPin className="w-3.5 h-3.5" /> },
];

export default function HypothesisPanel({ hypothesis: initial, onClose }: HypothesisPanelProps) {
  const [tab, setTab]   = useState<PanelTab>("overview");
  // Start with the summary row; attempt to fetch the full detail record
  const [h, setH]       = useState<Hypothesis>(initial);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setH(initial);
    setTab("overview");
    setFetching(true);
    api.hypothesis(initial.hypothesis_id)
      .then((full) => setH(full))
      .catch(() => { /* keep summary row */ })
      .finally(() => setFetching(false));
  }, [initial.hypothesis_id]);

  // Safe accessors — flat fields always present; nested arrays may be absent in summary
  const p3   = h.p_ipc3plus_90d ?? 0;
  const p4   = h.p_ipc4plus_90d ?? 0;
  const pFam = h.p_famine_90d   ?? 0;
  const ciLo = h.famine_probability?.confidence_interval_low  ?? h.ci_90_low  ?? 0;
  const ciHi = h.famine_probability?.confidence_interval_high ?? h.ci_90_high ?? 0;
  const ciMethod = h.famine_probability?.method ?? h.ci_method ?? "";
  const drivers  = h.driver_clusters ?? [];
  const evidence = h.evidence        ?? [];

  const tierCol =
    h.alert_tier === "TIER-1" ? "#ef4444" :
    h.alert_tier === "TIER-2" ? "#f97316" : "#eab308";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-3xl max-h-screen sm:max-h-[92vh] flex flex-col bg-[#0d1520] sm:rounded-2xl border border-[#1f2d40] shadow-2xl overflow-hidden">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div
          className="px-5 pt-5 pb-4 border-b border-[#1f2d40] flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${tierCol}10 0%, #0d1520 60%)` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {/* Tier badge + ID */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${tierCol}20`,
                    borderColor: `${tierCol}50`,
                    color: tierCol,
                  }}
                >
                  {tierLabel(h.alert_tier)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-[#0a1628] px-2 py-0.5 rounded">
                  {h.hypothesis_id}
                </span>
                {h.forecast_horizon_days && (
                  <span className="text-[10px] text-slate-500">
                    {h.forecast_horizon_days}-day horizon
                  </span>
                )}
              </div>

              {/* Region name */}
              <h2 className="text-xl font-bold text-white leading-tight">{h.region_name}</h2>

              {/* Description */}
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {h.description}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Key probability strip */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "P(IPC 3+)", value: p3,   primary: true },
              { label: "P(IPC 4+)", value: p4,   primary: false },
              { label: "P(Famine)", value: pFam, primary: false },
            ].map(({ label, value, primary }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5 text-center border"
                style={{
                  backgroundColor: `${stressColor(value)}10`,
                  borderColor: `${stressColor(value)}25`,
                }}
              >
                <div className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">{label}</div>
                <div
                  className="text-2xl font-bold leading-none"
                  style={{ color: stressColor(value) }}
                >
                  {pct(value)}
                </div>
                {primary && (
                  <div className="text-[10px] text-slate-600 mt-1 font-mono">
                    CI {ciStr(ciLo, ciHi)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="flex border-b border-[#1f2d40] flex-shrink-0 px-2 pt-1">
          {TAB_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all mr-1 ${
                tab === id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content (scrollable) ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* OVERVIEW ──────────────────────────────────────────────── */}
          {tab === "overview" && (
            <div className="p-5 space-y-5">
              {/* IPC phase forecast */}
              <div className="flex items-center gap-3 bg-[#0a1628] rounded-xl p-4 border border-[#1f2d40]">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">IPC Phase Forecast</div>
                  <div className="text-2xl font-bold text-white">
                    {ipcPhaseLabel(h.ipc_phase_forecast)}
                    <span className="text-lg text-slate-500 ml-2 font-normal">
                      (Phase {h.ipc_phase_forecast})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Composite Stress</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: stressColor(h.composite_stress_score) }}
                  >
                    {(h.composite_stress_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* CI bar */}
              <div className="bg-[#0a1628] rounded-xl p-4 border border-[#1f2d40]">
                <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                  <span>90% Confidence Interval — P(IPC 3+)</span>
                  <span className="font-mono">{ciMethod}</span>
                </div>
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  {/* CI band */}
                  <div
                    className="absolute h-full bg-blue-500/20 rounded-full"
                    style={{
                      left:  `${ciLo * 100}%`,
                      width: `${(ciHi - ciLo) * 100}%`,
                    }}
                  />
                  {/* Point estimate */}
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      width: `${p3 * 100}%`,
                      backgroundColor: stressColor(p3),
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-600 font-mono">
                  <span>{pct(ciLo)}</span>
                  <span className="text-white">{pct(p3)}</span>
                  <span>{pct(ciHi)}</span>
                </div>
              </div>

              {/* Top driver summary */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Top Drivers
                </h3>
                <div className="space-y-2">
                  {[...drivers]
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 4)
                    .map((d) => (
                      <div key={d.driver_type} className="flex items-center gap-3 bg-[#0a1628] rounded-lg px-3 py-2.5 border border-[#1f2d40]">
                        <div className="w-24 text-xs font-medium text-slate-300 flex-shrink-0">
                          {d.driver_type}
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${d.intensity * 100}%`, backgroundColor: stressColor(d.intensity) }}
                          />
                        </div>
                        <div
                          className="text-xs font-mono w-8 text-right flex-shrink-0"
                          style={{ color: stressColor(d.intensity) }}
                        >
                          {(d.intensity * 100).toFixed(0)}%
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      </div>
                    ))}
                </div>
                {drivers.length > 4 && (
                  <button
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => setTab("drivers")}
                  >
                    View all {drivers.length} drivers →
                  </button>
                )}
              </div>

              {/* Metadata grid */}
              <div className="pt-3 border-t border-[#1f2d40] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Forecast Date", value: formatDate(h.reference_date) },
                  { label: "Horizon",       value: `${h.forecast_horizon_days} days` },
                  { label: "Sources",       value: `${h.n_sources_agreeing} agreeing` },
                  { label: "IPC Forecast",  value: ipcPhaseLabel(h.ipc_phase_forecast) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#0a1628] rounded-lg p-2.5 border border-[#1f2d40]">
                    <div className="text-slate-600 mb-0.5">{label}</div>
                    <div className="text-slate-300 font-medium">{value}</div>
                  </div>
                ))}
              </div>

              {h.notes && (
                <div className="text-xs text-slate-500 font-mono bg-[#0a1628] rounded-xl p-3 border border-[#1f2d40] flex gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span>{h.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* DRIVERS ───────────────────────────────────────────────── */}
          {tab === "drivers" && (
            <div className="p-5 space-y-5">
              <DriverRadar hypothesis={h} />

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Full Driver Detail
                </h3>
                <div className="space-y-3">
                  {[...drivers]
                    .sort((a, b) => b.intensity - a.intensity)
                    .map((d) => (
                      <div key={d.driver_type} className="bg-[#0a1628] rounded-xl p-4 border border-[#1f2d40]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{d.driver_type}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">confidence</span>
                            <span className="text-slate-300 font-mono">
                              {(d.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${d.intensity * 100}%`, backgroundColor: stressColor(d.intensity) }}
                          />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {d.key_signals.map((s: string) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* EVIDENCE ──────────────────────────────────────────────── */}
          {tab === "evidence" && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Evidence Record</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {h.n_sources_agreeing} sources support · {evidence.filter(e => !e.supports_hypothesis).length} contradict
                  </p>
                </div>
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500/70 rounded-full"
                    style={{ width: `${(h.n_sources_agreeing / Math.max(1, evidence.length)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-green-400 font-mono">
                  {h.n_sources_agreeing}/{evidence.length}
                </span>
              </div>

              <div className="rounded-xl border border-[#1f2d40] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0a1628] border-b border-[#1f2d40]">
                      <th className="text-left py-2.5 px-3 text-slate-500 font-medium w-6"></th>
                      <th className="text-left py-2.5 px-3 text-slate-500 font-medium">Source</th>
                      <th className="text-left py-2.5 px-3 text-slate-500 font-medium">Variable</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-medium">Observed</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-medium">Threshold</th>
                      <th className="text-left py-2.5 px-3 text-slate-500 font-medium hidden md:table-cell">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.map((e, i) => (
                      <tr
                        key={i}
                        className={`border-b border-[#1a2535] ${i % 2 === 0 ? "bg-[#0d1520]" : "bg-[#0a1628]"}`}
                      >
                        <td className="py-2.5 px-3">
                          {e.supports_hypothesis ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-400">{e.source_id}</td>
                        <td className="py-2.5 px-3 text-slate-300">{e.variable}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-white">
                          {e.observed_value.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {e.threshold.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 italic hidden md:table-cell">
                          {e.note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-[10px] text-slate-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Evidence is generated by the CERES HGE Adapter #5. All observations are falsifiable
                and graded at T+{h.forecast_horizon_days} days.
              </div>
            </div>
          )}

          {/* SUB-NATIONAL ──────────────────────────────────────────── */}
          {tab === "subnational" && (
            <div className="p-5">
              <Admin1DrillDown countryId={h.region_id} countryName={h.region_name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

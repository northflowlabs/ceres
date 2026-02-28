"use client";

import { AlertTriangle, Zap, ChevronRight } from "lucide-react";
import { Prediction } from "@/lib/api";
import { pct, ciStr, tierLabel, tierColor, stressColor, ipcPhaseLabel, convColor } from "@/lib/utils";

interface PredictionCardProps {
  prediction: Prediction;
  rank: number;
  onClick?: () => void;
}

export default function PredictionCard({ prediction: p, rank, onClick }: PredictionCardProps) {
  const css   = p.composite_stress_score;
  const tc    = tierColor(p.alert_tier);

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0d1520] border border-[#1f2d40] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#2d3f55] hover:bg-[#101e30]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
    >
      {/* Tier accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${tc}80 0%, transparent 100%)` }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${tc}08 0%, transparent 55%)` }}
      />

      <div className="relative p-5">
        {/* ── Header row ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-slate-700 text-xs font-mono flex-shrink-0">#{rank}</span>
            <div className="min-w-0">
              <div className="font-bold text-white text-base leading-tight truncate">
                {p.region_name}
              </div>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">{p.region_id}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {p.is_compound && (
              <div className="flex items-center gap-1 text-[10px] bg-purple-500/10 border border-purple-500/25 rounded-full px-2 py-0.5 text-purple-400">
                <Zap className="w-2.5 h-2.5" />
                <span>Compound</span>
              </div>
            )}
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
              style={{
                color: tc,
                backgroundColor: `${tc}18`,
                borderColor: `${tc}45`,
              }}
            >
              {tierLabel(p.alert_tier)}
            </span>
          </div>
        </div>

        {/* ── Primary probability ──────────────────────────────────── */}
        <div className="mb-3.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider">P(IPC 3+ · 90d)</span>
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold leading-none"
                style={{ color: stressColor(p.p_ipc3plus_90d) }}
              >
                {pct(p.p_ipc3plus_90d)}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {ciStr(p.ci_90_low, p.ci_90_high)}
              </span>
            </div>
          </div>

          {/* Bar: CI band + point estimate */}
          <div className="relative h-2 bg-[#0a1628] rounded-full overflow-hidden border border-[#1f2d40]">
            <div
              className="absolute h-full rounded-full opacity-30"
              style={{
                left:  `${p.ci_90_low * 100}%`,
                width: `${(p.ci_90_high - p.ci_90_low) * 100}%`,
                backgroundColor: stressColor(p.p_ipc3plus_90d),
              }}
            />
            <div
              className="absolute h-full rounded-full"
              style={{
                width: `${p.p_ipc3plus_90d * 100}%`,
                backgroundColor: stressColor(p.p_ipc3plus_90d),
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        {/* ── Secondary metrics ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "P(IPC 4+)", value: pct(p.p_ipc4plus_90d), color: stressColor(p.p_ipc4plus_90d) },
            { label: "Forecast",  value: ipcPhaseLabel(p.ipc_phase_forecast), color: "#e2e8f0" },
            { label: "Stress",    value: `${(css * 100).toFixed(0)}%`, color: stressColor(css) },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#0a1628] border border-[#1a2535] rounded-xl px-2.5 py-2 text-center"
            >
              <div className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider">{label}</div>
              <div className="text-sm font-bold leading-tight" style={{ color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Drivers + convergence ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 flex-wrap min-w-0">
            {p.driver_types.map((d) => (
              <span
                key={d}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a1628] text-slate-500 border border-[#1a2535]"
              >
                {d}
              </span>
            ))}
          </div>

          <div className={`flex items-center gap-1 text-[11px] font-medium flex-shrink-0 ${convColor(p.convergence_tier)}`}>
            {p.convergence_tier !== "NONE" && <AlertTriangle className="w-3 h-3" />}
            {p.convergence_tier !== "NONE" && <span className="hidden sm:inline">{p.convergence_tier}</span>}
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

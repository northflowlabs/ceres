"use client";

import { useEffect, useState } from "react";
import { Satellite, Globe, ShieldAlert, TrendingUp, Activity } from "lucide-react";

interface HeroSectionProps {
  nRegions: number;
  nCritical: number;
  nWarning: number;
  lastUpdated?: string;
  loading?: boolean;
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{value}</>;
}

export default function HeroSection({ nRegions, nCritical, nWarning, lastUpdated, loading }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Deep background with radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary blue nebula */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
        {/* Red glow top-right for critical alerts */}
        {nCritical > 0 && (
          <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] animate-pulse-slow"
            style={{ background: "radial-gradient(circle, #ef4444 0%, transparent 70%)" }} />
        )}
        {/* Grid texture */}
        <div className="absolute inset-0 grid-texture opacity-100" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, #060d18)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* ── Left: title block ──────────────────────────────────── */}
          <div className="flex-1">
            {/* System tag */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5">
              <span className="status-live" />
              <span className="text-[11px] text-slate-400 font-mono tracking-widest uppercase">
                CERES · Famine Intelligence System
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4">
              <span className="text-gradient-hero">Predictive</span>
              <br />
              <span className="text-white">Famine</span>{" "}
              <span className="text-gradient-blue">Intelligence</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed mb-6">
              90-day probabilistic crisis forecasting across{" "}
              <span className="text-white font-semibold">{nRegions || "15"} active regions</span> using
              multi-source signal convergence, IPC-calibrated logistic models, and
              falsifiable hypothesis generation.
            </p>

            {/* Credential strip */}
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              {["CHIRPS · Rainfall", "MODIS · Vegetation", "FEWS NET · IPC", "ACLED · Conflict", "WFP · Food Access"].map((s) => (
                <span key={s} className="glass-light rounded-full px-2.5 py-1 text-slate-500">{s}</span>
              ))}
            </div>
          </div>

          {/* ── Right: live KPI tiles ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[340px]">
            {/* Regions */}
            <div className="card-premium p-4 col-span-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, #3b82f630, transparent)" }} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Regions Monitored</div>
                  <div className="text-5xl font-black text-white leading-none animate-counter">
                    {mounted && !loading ? <AnimatedCounter target={nRegions} /> : "—"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">active crisis zones</div>
                </div>
                <Globe className="w-10 h-10 text-blue-500/30" />
              </div>
            </div>

            {/* Critical */}
            <div className={`card-premium p-4 relative overflow-hidden ${nCritical > 0 ? "card-critical" : ""}`}>
              <div className="absolute top-0 left-0 right-0 h-px tier-bar-1" style={{ height: "2px" }} />
              <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Critical</div>
              <div className="text-3xl font-black leading-none animate-counter"
                style={{ color: nCritical > 0 ? "#ef4444" : "#475569" }}>
                {mounted && !loading ? <AnimatedCounter target={nCritical} /> : "—"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3 h-3 text-red-500/60" />
                <span className="text-[10px] text-slate-600">TIER-1 alerts</span>
              </div>
            </div>

            {/* Warning */}
            <div className="card-premium p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px tier-bar-2" style={{ height: "2px" }} />
              <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Warning</div>
              <div className="text-3xl font-black leading-none animate-counter"
                style={{ color: nWarning > 0 ? "#f97316" : "#475569" }}>
                {mounted && !loading ? <AnimatedCounter target={nWarning} /> : "—"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-orange-500/60" />
                <span className="text-[10px] text-slate-600">TIER-2 alerts</span>
              </div>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="card-premium p-3 col-span-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">
                  Pipeline last run:
                  <span className="text-slate-300 ml-1.5 font-mono">
                    {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </span>
                <span className="ml-auto text-[10px] font-mono text-green-400/70">HGE·5 · LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

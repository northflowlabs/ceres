"use client";

import { AlertTriangle, RefreshCw, Satellite } from "lucide-react";
import { relativeTime } from "@/lib/utils";

interface HeaderProps {
  lastUpdated?: string;
  n_tier1?: number;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function Header({ lastUpdated, n_tier1, onRefresh, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50">
      {/* Thin top accent line */}
      <div className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, #3b82f640 30%, #818cf640 70%, transparent 100%)" }} />

      <div className="bg-[#060d18]/90 backdrop-blur-xl border-b border-[#1a2f48]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          {/* ── Logo ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/20 border border-blue-400/30 flex items-center justify-center">
                <Satellite className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="leading-none">
              <div className="text-base font-black tracking-[0.2em] text-white">CERES</div>
              <div className="hidden sm:block text-[9px] text-slate-500 tracking-[0.15em] uppercase mt-0.5">
                Famine Intelligence
              </div>
            </div>
          </div>

          {/* ── Centre: critical pill ─────────────────────────────── */}
          <div className="flex-1 flex justify-center">
            {n_tier1 !== undefined && n_tier1 > 0 ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold animate-pulse-slow"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  boxShadow: "0 0 20px rgba(239,68,68,0.1)",
                }}>
                <AlertTriangle className="w-3 h-3" />
                {n_tier1} CRITICAL ALERT{n_tier1 > 1 ? "S" : ""} ACTIVE
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                  style={{ boxShadow: "0 0 6px #22c55e" }} />
                {lastUpdated ? `Updated ${relativeTime(lastUpdated)}` : "All systems nominal"}
              </div>
            )}
          </div>

          {/* ── Right ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg"
              style={{ background: "#0a1628", border: "1px solid #1a2f48", color: "#475569" }}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${loading ? "bg-amber-400" : "bg-green-400"}`}
                style={{ boxShadow: loading ? "0 0 6px #f59e0b" : "0 0 6px #22c55e" }} />
              HGE·5
            </div>

            {onRefresh && (
              <button onClick={onRefresh} disabled={loading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{
                  background: "#0a1628", border: "1px solid #1a2f48",
                  color: "#64748b",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; (e.currentTarget as HTMLElement).style.borderColor = "#2a4060"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.borderColor = "#1a2f48"; }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

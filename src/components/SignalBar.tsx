"use client";

import { stressColor } from "@/lib/utils";

interface SignalBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function SignalBar({ label, value, max = 1 }: SignalBarProps) {
  const pct = Math.min(1, value / max) * 100;
  const color = stressColor(value / max);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

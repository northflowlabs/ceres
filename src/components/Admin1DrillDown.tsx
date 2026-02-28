"use client";

import { useEffect, useState } from "react";
import { api, Admin1Signal } from "@/lib/api";
import { stressColor, ipcPhaseLabel } from "@/lib/utils";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface Admin1DrillDownProps {
  countryId: string;
  countryName: string;
}

type SortKey = "composite_stress_score" | "conflict_stress" | "drought_stress" | "food_access_stress";

const COLS: { key: SortKey; label: string; short: string }[] = [
  { key: "composite_stress_score", label: "Composite Stress", short: "Stress" },
  { key: "conflict_stress",        label: "Conflict",          short: "Conflict" },
  { key: "drought_stress",         label: "Drought",           short: "Drought" },
  { key: "food_access_stress",     label: "Food Access",       short: "Food" },
];

function StressCell({ value }: { value: number }) {
  const color = stressColor(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-[40px]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, value * 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-9 text-right shrink-0" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export default function Admin1DrillDown({ countryId, countryName }: Admin1DrillDownProps) {
  const [signals, setSignals]   = useState<Admin1Signal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sortBy, setSortBy]     = useState<SortKey>("composite_stress_score");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin1(countryId)
      .then(setSignals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [countryId]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDesc((d) => !d);
    else { setSortBy(key); setSortDesc(true); }
  }

  const sorted = [...signals].sort((a, b) =>
    sortDesc ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading sub-national data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-400 py-6 text-center">
        Could not load admin1 data: {error}
      </div>
    );
  }

  if (!signals.length) {
    return (
      <div className="text-xs text-slate-500 py-6 text-center">
        No sub-national signals available for {countryName}.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Sub-national Stress — {countryName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{signals.length} admin-1 units · click column to sort</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1f2d40]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1f2d40] bg-[#0d1520]">
              <th className="text-left py-2.5 px-3 text-slate-500 font-medium w-32">Region</th>
              <th className="text-left py-2.5 px-3 text-slate-500 font-medium w-16">IPC</th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="py-2.5 px-3 text-slate-500 font-medium cursor-pointer hover:text-slate-300 transition-colors select-none"
                  onClick={() => toggleSort(c.key)}
                >
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline">{c.label}</span>
                    <span className="sm:hidden">{c.short}</span>
                    {sortBy === c.key ? (
                      sortDesc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3 opacity-20" />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3 text-slate-500 font-medium text-center hidden md:table-cell">Signals</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.admin1_id}
                className={`border-b border-[#1a2535] transition-colors hover:bg-[#0f1e30] ${
                  i % 2 === 0 ? "bg-[#0d1520]" : "bg-[#0a1628]"
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-200 truncate max-w-[120px]">{s.admin1_name}</div>
                  {s.from_country_fallback && (
                    <div className="text-[10px] text-slate-600">↳ country estimate</div>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  {s.current_ipc_phase != null ? (
                    <span
                      className="font-mono font-bold text-xs px-1.5 py-0.5 rounded"
                      style={{
                        color: stressColor(s.current_ipc_phase / 5),
                        backgroundColor: `${stressColor(s.current_ipc_phase / 5)}18`,
                      }}
                    >
                      {ipcPhaseLabel(s.current_ipc_phase)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 min-w-[100px]">
                  <StressCell value={s.composite_stress_score} />
                </td>
                <td className="py-2.5 px-3 min-w-[100px]">
                  <StressCell value={s.conflict_stress} />
                </td>
                <td className="py-2.5 px-3 min-w-[100px]">
                  <StressCell value={s.drought_stress} />
                </td>
                <td className="py-2.5 px-3 min-w-[100px]">
                  <StressCell value={s.food_access_stress} />
                </td>
                <td className="py-2.5 px-3 text-center hidden md:table-cell">
                  <span className="text-slate-400 font-mono">{s.n_signals_elevated}</span>
                  <span className="text-slate-600">/{s.n_signals_available}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

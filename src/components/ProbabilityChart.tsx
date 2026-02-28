"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, ErrorBar,
} from "recharts";
import { Prediction } from "@/lib/api";
import { tierColor, pct } from "@/lib/utils";

interface ProbabilityChartProps {
  predictions: Prediction[];
  onSelect?: (p: Prediction) => void;
  selected?: Prediction | null;
}

interface ChartRow {
  name: string;
  region_id: string;
  ipc3: number;
  ipc4: number;
  ci_lo: number;
  ci_hi: number;
  err: [number, number];
  tier: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: ChartRow = payload[0].payload;
  return (
    <div className="bg-[#111827] border border-[#2d3f55] rounded-xl px-3 py-2.5 text-xs shadow-2xl">
      <div className="font-bold text-white mb-2">{d.name}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">P(IPC 3+)</span>
          <span className="font-mono text-white">{pct(d.ipc3)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">P(IPC 4+)</span>
          <span className="font-mono text-orange-400">{pct(d.ipc4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">90% CI</span>
          <span className="font-mono text-slate-300">
            [{pct(d.ci_lo)}–{pct(d.ci_hi)}]
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ProbabilityChart({ predictions, onSelect, selected }: ProbabilityChartProps) {
  const data: ChartRow[] = [...predictions]
    .sort((a, b) => b.p_ipc3plus_90d - a.p_ipc3plus_90d)
    .map((p) => ({
      name: p.region_name,
      region_id: p.region_id,
      ipc3: p.p_ipc3plus_90d,
      ipc4: p.p_ipc4plus_90d,
      ci_lo: p.ci_90_low,
      ci_hi: p.ci_90_high,
      err: [p.p_ipc3plus_90d - p.ci_90_low, p.ci_90_high - p.p_ipc3plus_90d] as [number, number],
      tier: p.alert_tier,
    }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">90-Day Famine Probability</h3>
          <p className="text-xs text-slate-500 mt-0.5">P(IPC 3+) with 90% bootstrap CI · sorted by severity</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500/70" />
            <span>IPC 3+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-orange-500/50" />
            <span>IPC 4+</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
          barGap={2}
          onClick={(e: any) => {
            if (e?.activePayload?.[0]) {
              const row = e.activePayload[0].payload as ChartRow;
              const pred = predictions.find((p) => p.region_id === row.region_id);
              if (pred) onSelect?.(pred);
            }
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2d40"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-28}
            textAnchor="end"
            height={52}
          />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />

          {/* 75% danger threshold */}
          <ReferenceLine
            y={0.75}
            stroke="#ef444440"
            strokeDasharray="4 4"
            label={{ value: "75%", position: "right", fill: "#ef4444", fontSize: 10 }}
          />

          {/* IPC 3+ bar */}
          <Bar dataKey="ipc3" radius={[4, 4, 0, 0]} maxBarSize={40} cursor="pointer">
            {data.map((d) => (
              <Cell
                key={d.region_id}
                fill={tierColor(d.tier)}
                fillOpacity={selected?.region_id === d.region_id ? 0.95 : 0.65}
                stroke={selected?.region_id === d.region_id ? tierColor(d.tier) : "transparent"}
                strokeWidth={2}
              />
            ))}
            <ErrorBar
              dataKey="err"
              width={4}
              strokeWidth={1.5}
              stroke="#94a3b8"
              direction="y"
            />
          </Bar>

          {/* IPC 4+ overlay bar */}
          <Bar dataKey="ipc4" radius={[3, 3, 0, 0]} maxBarSize={40} cursor="pointer">
            {data.map((d) => (
              <Cell
                key={d.region_id}
                fill="#f97316"
                fillOpacity={0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

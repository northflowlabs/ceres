"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { Hypothesis } from "@/lib/api";
import { stressColor } from "@/lib/utils";

interface DriverRadarProps {
  hypothesis: Hypothesis;
}

const DRIVER_LABELS: Record<string, string> = {
  CONFLICT:     "Conflict",
  DROUGHT:      "Drought",
  DISPLACEMENT: "Displacement",
  FOOD_ACCESS:  "Food Access",
  MARKET:       "Market",
  NUTRITION:    "Nutrition",
  RAINFALL:     "Rainfall",
  VEGETATION:   "Vegetation",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#111827] border border-[#2d3f55] rounded-lg px-2.5 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white">{d.subject}</div>
      <div className="text-slate-400 mt-0.5">
        Intensity: <span className="text-white font-mono">{(d.value * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default function DriverRadar({ hypothesis: h }: DriverRadarProps) {
  const clusters = h.driver_clusters ?? [];
  // Build 6-point radar from driver_clusters
  const clusterMap = Object.fromEntries(
    clusters.map((d) => [d.driver_type, d.intensity])
  );

  // Normalise to always show 6 axes; fill missing with low baseline
  const AXES = ["CONFLICT", "DROUGHT", "FOOD_ACCESS", "DISPLACEMENT", "MARKET", "RAINFALL"];
  const data = AXES.map((key) => ({
    subject: DRIVER_LABELS[key] ?? key,
    value: clusterMap[key] ?? 0.05,
    fullMark: 1,
  }));

  const maxIntensity = Math.max(...data.map((d) => d.value));
  const radarColor = stressColor(maxIntensity);

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">Driver Intensity Radar</h3>
        <p className="text-xs text-slate-500 mt-0.5">Multi-axis stress profile · hover to inspect</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
          <PolarGrid stroke="#1f2d40" strokeWidth={0.8} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke={radarColor}
            fill={radarColor}
            fillOpacity={0.18}
            strokeWidth={1.5}
            dot={{ r: 3, fill: radarColor, strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Driver legend rows */}
      <div className="space-y-1.5 mt-1">
        {clusters
          .sort((a, b) => b.intensity - a.intensity)
          .map((d) => (
            <div key={d.driver_type} className="flex items-center gap-2">
              <div className="w-20 text-[10px] text-slate-500 shrink-0 text-right">
                {DRIVER_LABELS[d.driver_type] ?? d.driver_type}
              </div>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${d.intensity * 100}%`,
                    backgroundColor: stressColor(d.intensity),
                  }}
                />
              </div>
              <div
                className="text-[10px] font-mono w-8 text-right"
                style={{ color: stressColor(d.intensity) }}
              >
                {(d.intensity * 100).toFixed(0)}%
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

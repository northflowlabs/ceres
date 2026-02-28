"use client";

import { useState, useRef } from "react";
import { Prediction } from "@/lib/api";
import { project, CRISIS_COUNTRIES } from "@/lib/geo";
import { tierColor, pct } from "@/lib/utils";

interface WorldRiskMapProps {
  predictions: Prediction[];
  onSelect?: (p: Prediction) => void;
  selected?: Prediction | null;
}

const W = 960;
const H = 500;

export default function WorldRiskMap({ predictions, onSelect, selected }: WorldRiskMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; p: Prediction;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const byId = Object.fromEntries(predictions.map((p) => [p.region_id, p]));

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (tooltip) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
    }
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a1628] border border-[#1f2d40]">
      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 bg-[#0d1520]/90 border border-[#1f2d40] rounded-xl px-3 py-2.5 text-xs space-y-1.5 backdrop-blur-sm">
        <div className="text-slate-500 font-medium mb-1 text-[10px] uppercase tracking-wider">Risk Level</div>
        {[
          { label: "CRITICAL (IPC 4+)", color: "#ef4444" },
          { label: "WARNING (IPC 3+)",  color: "#f97316" },
          { label: "WATCH",             color: "#eab308" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-[#111827] border border-[#2d3f55] rounded-xl shadow-2xl px-3 py-2 text-xs min-w-[160px]"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top:  `${(tooltip.y / H) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <div className="font-semibold text-white mb-1">{tooltip.p.region_name}</div>
          <div className="text-slate-400">
            P(IPC 3+): <span className="text-white font-mono">{pct(tooltip.p.p_ipc3plus_90d)}</span>
          </div>
          <div className="text-slate-400">
            P(IPC 4+): <span className="text-white font-mono">{pct(tooltip.p.p_ipc4plus_90d)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${tierColor(tooltip.p.alert_tier)}25`,
                color: tierColor(tooltip.p.alert_tier),
                border: `1px solid ${tierColor(tooltip.p.alert_tier)}50`,
              }}
            >
              {tooltip.p.alert_tier}
            </span>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Ocean background */}
        <rect width={W} height={H} fill="#0a1628" />

        {/* Graticule grid lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const [, y] = project(lat, 0, W, H);
          return (
            <line
              key={`lat-${lat}`}
              x1={0} y1={y} x2={W} y2={y}
              stroke="#1a2540" strokeWidth="0.5"
            />
          );
        })}
        {[-120, -60, 0, 60, 120].map((lon) => {
          const [x] = project(0, lon, W, H);
          return (
            <line
              key={`lon-${lon}`}
              x1={x} y1={0} x2={x} y2={H}
              stroke="#1a2540" strokeWidth="0.5"
            />
          );
        })}

        {/* Equator */}
        {(() => {
          const [, y] = project(0, 0, W, H);
          return <line x1={0} y1={y} x2={W} y2={y} stroke="#1f3060" strokeWidth="1" />;
        })()}

        {/* Simplified continent outlines — lightweight inline paths */}
        <g fill="#12213a" stroke="#1e3055" strokeWidth="0.8">
          {/* Africa */}
          <path d="M480,195 L510,190 L530,200 L545,225 L548,255 L540,285 L530,310 L515,335 L500,355 L490,375 L478,388 L465,370 L450,345 L445,315 L438,285 L440,255 L445,230 L455,210 Z" />
          {/* Arabian Peninsula */}
          <path d="M548,200 L575,195 L600,205 L610,225 L600,245 L585,255 L568,250 L555,235 L548,220 Z" />
          {/* Horn of Africa */}
          <path d="M545,225 L570,218 L585,230 L575,248 L560,252 L548,245 Z" />
          {/* South Asia */}
          <path d="M620,175 L660,170 L685,180 L695,200 L685,220 L668,230 L648,225 L630,210 L618,195 Z" />
          {/* Central Asia / Afghanistan */}
          <path d="M610,155 L660,148 L690,155 L700,170 L685,180 L660,170 L630,165 Z" />
          {/* Europe */}
          <path d="M455,120 L510,110 L535,118 L545,130 L530,145 L505,150 L480,145 L460,138 Z" />
          {/* West Africa Sahel */}
          <path d="M420,200 L480,195 L455,210 L445,230 L430,225 L415,215 Z" />
          {/* Haiti / Caribbean (small) */}
          <path d="M246,215 L258,213 L263,219 L255,226 L244,222 Z" />
          {/* Central America / Mexico */}
          <path d="M185,180 L230,175 L248,188 L240,205 L220,210 L198,205 Z" />
          {/* South America */}
          <path d="M248,230 L285,220 L315,225 L330,255 L325,300 L310,340 L290,370 L265,375 L245,350 L235,315 L238,275 L245,250 Z" />
          {/* DR Congo basin */}
          <path d="M482,270 L510,265 L525,280 L518,300 L500,308 L482,298 L474,283 Z" />
        </g>

        {/* Risk circles for known locations */}
        {CRISIS_COUNTRIES.map(({ iso3, name }) => {
          const pred = byId[iso3];
          if (!pred) return null;
          const [cx, cy] = project(pred.lat, pred.lon, W, H);
          const color = tierColor(pred.alert_tier);
          const r = 6 + pred.p_ipc3plus_90d * 16;
          const isSelected = selected?.region_id === iso3;

          return (
            <g
              key={iso3}
              onClick={() => onSelect?.(pred)}
              onMouseEnter={() => setTooltip({ x: cx, y: cy, p: pred })}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            >
              {/* Pulse ring */}
              <circle
                cx={cx} cy={cy} r={r + 6}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.2"
              >
                <animate attributeName="r" from={r + 4} to={r + 14} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.25" to="0" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={cx} cy={cy} r={r + 8}
                  fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"
                />
              )}

              {/* Main circle */}
              <circle
                cx={cx} cy={cy} r={r}
                fill={color}
                fillOpacity="0.25"
                stroke={color}
                strokeWidth={isSelected ? "2" : "1.5"}
              />

              {/* ISO label */}
              <text
                x={cx} y={cy + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontWeight="700"
                fill={color}
                className="pointer-events-none select-none"
              >
                {iso3}
              </text>
            </g>
          );
        })}

        {/* Predictions that don't have a CRISIS_COUNTRIES entry */}
        {predictions.filter(p => !CRISIS_COUNTRIES.find(c => c.iso3 === p.region_id)).map((pred) => {
          const [cx, cy] = project(pred.lat, pred.lon, W, H);
          const color = tierColor(pred.alert_tier);
          const r = 5 + pred.p_ipc3plus_90d * 12;
          return (
            <g key={pred.region_id} onClick={() => onSelect?.(pred)} className="cursor-pointer"
               onMouseEnter={() => setTooltip({ x: cx, y: cy, p: pred })}
               onMouseLeave={() => setTooltip(null)}>
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontWeight="700" fill={color} className="pointer-events-none select-none">
                {pred.region_id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

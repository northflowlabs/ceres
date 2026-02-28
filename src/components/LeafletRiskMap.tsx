"use client";

import { useEffect, useRef } from "react";
import { Prediction } from "@/lib/api";
import { pct, tierLabel } from "@/lib/utils";

interface LeafletRiskMapProps {
  predictions: Prediction[];
  selected?: Prediction | null;
  onSelect?: (p: Prediction) => void;
}

function editorialColor(tier: string) {
  if (tier === "TIER-1") return "#C0392B";
  if (tier === "TIER-2") return "#D97706";
  return "#2E7D32";
}

export default function LeafletRiskMap({
  predictions,
  selected,
  onSelect,
}: LeafletRiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      // Guard against StrictMode double-init
      if ((containerRef.current as any)._leaflet_id) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, {
        center: [10, 38],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 10,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        opacity: 0.75,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Draw/redraw markers
  useEffect(() => {
    if (!mapRef.current) {
      // Retry after map initialises
      const t = setTimeout(() => {
        if (!mapRef.current) return;
        drawMarkers();
      }, 600);
      return () => clearTimeout(t);
    }
    drawMarkers();

    function drawMarkers() {
      import("leaflet").then((L) => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        predictions.forEach((p) => {
          const color      = editorialColor(p.alert_tier);
          const isSelected = selected?.region_id === p.region_id;

          // Outer ring (280 km) + inner dot (80 km) — matches the reference design
          const outer = L.circle([p.lat, p.lon], {
            radius: 280000,
            color,
            fillColor: color,
            fillOpacity: isSelected ? 0.30 : 0.18,
            weight: isSelected ? 2.5 : 1.8,
            opacity: isSelected ? 0.9 : 0.65,
          }).addTo(mapRef.current);

          const inner = L.circle([p.lat, p.lon], {
            radius: 80000,
            color,
            fillColor: color,
            fillOpacity: 0.55,
            weight: 0,
          }).addTo(mapRef.current);

          const popupHtml = `
            <div style="
              padding:16px 18px;
              min-width:220px;
              font-family:'Source Serif 4',Georgia,serif;
              background:#F5F0E8;
            ">
              <div style="
                font-family:'Playfair Display',Georgia,serif;
                font-size:16px;font-weight:600;
                color:#1C1917;margin-bottom:4px;
              ">${p.region_name}</div>
              <div style="
                font-family:'JetBrains Mono',monospace;
                font-size:9px;color:#78716C;
                letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2px;
              ">${p.region_id} · 90-Day IPC Phase 3+ Probability</div>
              <div style="
                font-family:'Playfair Display',Georgia,serif;
                font-size:32px;font-weight:700;
                line-height:1;margin:8px 0;
                color:${color};
              ">${pct(p.p_ipc3plus_90d)}</div>
              <hr style="border:none;border-top:1px solid #D6CFC4;margin:8px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;">
                <span style="color:#78716C;">Confidence interval</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${color};">
                  [${pct(p.ci_90_low)} – ${pct(p.ci_90_high)}]
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;">
                <span style="color:#78716C;">P(IPC Phase 4+)</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${color};">${pct(p.p_ipc4plus_90d)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;">
                <span style="color:#78716C;">Alert tier</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${color};">${tierLabel(p.alert_tier)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;">
                <span style="color:#78716C;">Composite stress</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#44403C;">${Math.round(p.composite_stress_score * 100)}%</span>
              </div>
              <hr style="border:none;border-top:1px solid #D6CFC4;margin:8px 0;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#78716C;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;">Primary Drivers</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${p.driver_types.map((d) => `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;border:1px solid #D6CFC4;padding:2px 6px;color:#44403C;">${d}</span>`).join("")}
              </div>
            </div>`;

          outer.bindPopup(popupHtml, { maxWidth: 300 });
          inner.bindPopup(popupHtml, { maxWidth: 300 });

          const handleClick = () => {
            onSelect?.(p);
            outer.openPopup();
          };
          outer.on("click", handleClick);
          inner.on("click", handleClick);

          markersRef.current.push(outer, inner);
        });
      });
    }
  }, [predictions, selected, onSelect]);

  // Fly to selected
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    mapRef.current.flyTo([selected.lat, selected.lon], 6, { duration: 1.2, easeLinearity: 0.4 });
  }, [selected]);

  return (
    <div className="relative w-full h-full" style={{ background: "#E8DFD0" }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Prediction } from "@/lib/api";
import { pct, tierLabel } from "@/lib/utils";
import { CRISIS_COUNTRIES } from "@/lib/geo";
import { basemapTileUrl, BASEMAP_ATTRIBUTION } from "@/lib/basemap";

interface LeafletRiskMapProps {
  predictions: Prediction[];
  selected?: Prediction | null;
  onSelect?: (p: Prediction) => void;
}

// South-west and north-east corners of the area holding most forecast regions.
const FORECAST_BOUNDS: [[number, number], [number, number]] = [[-30, -20], [40, 95]];

function editorialColor(tier: string) {
  if (tier === "TIER-1") return "#C0392B";
  if (tier === "TIER-2") return "#D97706";
  return "#2E7D32";
}

function ringStyle(isSelected: boolean) {
  return {
    fillOpacity: isSelected ? 0.30 : 0.18,
    weight: isSelected ? 2.5 : 1.8,
    opacity: isSelected ? 0.9 : 0.65,
  };
}

export default function LeafletRiskMap({
  predictions,
  selected,
  onSelect,
}: LeafletRiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const ringsRef     = useRef<Map<string, any>>(new Map());
  const selectedRef  = useRef(selected);
  const onSelectRef  = useRef(onSelect);
  selectedRef.current = selected;
  onSelectRef.current = onSelect;
  const [mapReady, setMapReady] = useState(false);

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
        zoomControl: false,
        minZoom: 2,
        maxZoom: 10,
      });

      // Open on the forecast regions (Africa, the Middle East and South Asia)
      // instead of a fixed zoom that can land on the Arctic before layout settles.
      const showForecastRegions = () =>
        map.fitBounds(FORECAST_BOUNDS, { animate: false, padding: [12, 12] });
      showForecastRegions();

      // The container can still be resizing when Leaflet measures it. Re-measure
      // and re-centre until the first user interaction.
      let userMoved = false;
      map.once("dragstart zoomstart", () => { userMoved = true; });
      const ro = new ResizeObserver(() => {
        map.invalidateSize({ animate: false });
        if (!userMoved) showForecastRegions();
      });
      ro.observe(containerRef.current);
      (map as any)._ceresResizeObserver = ro;

      L.tileLayer(basemapTileUrl("World_Street_Map"), {
        attribution: BASEMAP_ATTRIBUTION,
        maxZoom: 19,
        opacity: 0.75,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current._ceresResizeObserver?.disconnect();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Draw markers once the map and the predictions are ready. Selecting a region only
  // restyles them, because a redraw would close the popup it has just opened.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    drawMarkers();

    function drawMarkers() {
      import("leaflet").then((L) => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        ringsRef.current.clear();

        const crisisGeo = new Map(CRISIS_COUNTRIES.map(c => [c.iso3, c]));

        predictions.forEach((p) => {
          // Use hardcoded centroid if available, otherwise API coords
          const geo = crisisGeo.get(p.region_id);
          const lat = geo?.lat ?? p.lat;
          const lon = geo?.lon ?? p.lon;
          // Skip null-island and missing coords
          if ((lat === 0 && lon === 0) || lat == null || lon == null) return;

          const color      = editorialColor(p.alert_tier);
          const isSelected = selectedRef.current?.region_id === p.region_id;

          // Outer ring (280 km) + inner dot (80 km), matches the reference design
          const outer = L.circle([lat, lon], {
            radius: 280000,
            color,
            fillColor: color,
            ...ringStyle(isSelected),
          }).addTo(mapRef.current);
          ringsRef.current.set(p.region_id, outer);

          const inner = L.circle([lat, lon], {
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
                <span style="color:#78716C;">Sensitivity interval</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${color};">
                  ${p.sensitivity_interval_low != null && p.sensitivity_interval_high != null ? `[${pct(p.sensitivity_interval_low)} to ${pct(p.sensitivity_interval_high)}]` : 'Pending'}
                </span>
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

          const handleClick = () => onSelectRef.current?.(p);
          outer.on("click", handleClick);
          inner.on("click", handleClick);

          markersRef.current.push(outer, inner);
        });
      });
    }
  }, [mapReady, predictions]);

  useEffect(() => {
    ringsRef.current.forEach((ring, id) => ring.setStyle(ringStyle(selected?.region_id === id)));
  }, [selected]);

  // Fly to selected
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selected) return;
    const geo = CRISIS_COUNTRIES.find(c => c.iso3 === selected.region_id);
    const lat = geo?.lat ?? selected.lat;
    const lon = geo?.lon ?? selected.lon;
    if ((lat === 0 && lon === 0) || lat == null || lon == null) return;
    mapRef.current.flyTo([lat, lon], 6, { duration: 1.2, easeLinearity: 0.4 });
  }, [mapReady, selected]);

  return (
    <div className="relative w-full h-full" style={{ background: "#E8DFD0" }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

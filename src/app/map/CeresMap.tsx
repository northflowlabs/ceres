"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://ceres-core-production.up.railway.app";

// ── Natural Earth country GeoJSON (via CDN) ────────────────────────────────
const COUNTRY_GEOJSON_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// ── Tier colours ──────────────────────────────────────────────────────────
const TIER_FILL: Record<string, string> = {
  "TIER-1": "#C0392B",
  "TIER-2": "#D97706",
  "TIER-3": "#78716C",
};
const TIER_FILL_OPACITY: Record<string, number> = {
  "TIER-1": 0.55,
  "TIER-2": 0.40,
  "TIER-3": 0.12,
};
const TIER_LABEL: Record<string, string> = {
  "TIER-1": "Critical",
  "TIER-2": "Warning",
  "TIER-3": "Watch",
};

type Layer = "country" | "admin1" | "admin2";

interface Prediction {
  region_id?: string;
  admin1_id?: string;
  admin2_id?: string;
  country_id: string;
  region_name?: string;
  admin1_name?: string;
  admin2_name?: string;
  alert_tier: string;
  p_ipc3plus_90d: number;
  p_ipc4plus_90d: number;
  composite_stress_score: number;
  conflict_stress: number;
  drought_stress: number;
  food_access_stress: number;
  ipc_stress: number;
  price_stress: number;
  ci_90_low?: number | null;
  ci_90_high?: number | null;
  reference_date?: string;
  centroid_lat?: number;
  centroid_lon?: number;
}

interface SelectedFeature {
  name: string;
  countryId: string;
  tier: string;
  p3: number;
  p4: number;
  ciLow: number | null;
  ciHigh: number | null;
  css: number;
  conflict: number;
  drought: number;
  food: number;
  ipc: number;
  price: number;
  refDate: string;
  layer: Layer;
}

const COUNTRY_NAMES: Record<string, string> = {
  ETH: "Ethiopia", SOM: "Somalia", SDN: "Sudan", SSD: "South Sudan",
  KEN: "Kenya", YEM: "Yemen", NIG: "Niger", MLI: "Mali", BFA: "Burkina Faso",
  HTI: "Haiti", AFG: "Afghanistan", SYR: "Syria", COD: "DR Congo",
  TCD: "Chad", NGA: "Nigeria", CAF: "Central African Rep.", CMR: "Cameroon",
  UGA: "Uganda", MOZ: "Mozambique", ZWE: "Zimbabwe", MDG: "Madagascar",
};

function fmtPct(v: number) { return `${(v * 100).toFixed(1)}%`; }
function fmtScore(v: number) { return (v * 100).toFixed(0); }

function stressBar(v: number) {
  const col = v >= 0.65 ? "#C0392B" : v >= 0.45 ? "#D97706" : v >= 0.25 ? "#2E7D32" : "#A8A29E";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: "#E7E5E4", borderRadius: 2 }}>
        <div style={{ height: "100%", borderRadius: 2, background: col, width: `${Math.min(100, v * 100)}%` }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: col, width: 32, textAlign: "right", fontWeight: 600 }}>
        {fmtPct(v)}
      </span>
    </div>
  );
}

export default function CeresMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);

  const [layer, setLayer] = useState<Layer>("country");
  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [a1preds, setA1preds] = useState<Prediction[]>([]);
  const [a2preds, setA2preds] = useState<Prediction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // ── Fetch all prediction layers ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/v1/predictions`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/v1/admin1/predictions?limit=700`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/v1/admin2/predictions?limit=500`).then(r => r.json()).catch(() => []),
    ]).then(([c, a1, a2]) => {
      setPredictions(Array.isArray(c) ? c : []);
      setA1preds(Array.isArray(a1) ? a1 : []);
      setA2preds(Array.isArray(a2) ? a2 : []);
      setLoadingData(false);
    });
  }, []);

  // ── Init Leaflet map ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then(L => {
      // Fix default marker icons for webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [10, 25],
        zoom: 3,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // ── Re-render choropleth when layer or data changes ─────────────────────
  const renderLayer = useCallback(async () => {
    if (!mapInstance.current || !layerGroupRef.current || loadingData) return;

    const L = await import("leaflet");
    layerGroupRef.current.clearLayers();

    if (layer === "country") {
      // Build lookup synchronously from current predictions state — avoids ref timing issues
      const cMap = new Map(predictions.map(p => [p.region_id ?? p.country_id, p]));

      // Fetch country GeoJSON
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let geoData: any = null;
      try {
        const r = await fetch(COUNTRY_GEOJSON_URL);
        geoData = await r.json();
      } catch { return; }

      L.geoJSON(geoData, {
        style: (feature) => {
          const p = feature?.properties ?? {};
          const iso = p.ISO_A3 ?? p.iso_a3 ?? p.ADM0_A3 ?? p.ISO_A3_EH ?? "";
          const pred = cMap.get(iso);
          const tier = pred?.alert_tier ?? "TIER-3";
          return {
            fillColor: TIER_FILL[tier] ?? "#78716C",
            fillOpacity: pred ? (TIER_FILL_OPACITY[tier] ?? 0.10) : 0.04,
            color: pred ? (TIER_FILL[tier] ?? "#78716C") : "#D6D3D1",
            weight: pred ? 1.2 : 0.5,
            opacity: 0.7,
          };
        },
        onEachFeature: (feature, leafletLayer) => {
          const p = feature?.properties ?? {};
          const iso = p.ISO_A3 ?? p.iso_a3 ?? p.ADM0_A3 ?? p.ISO_A3_EH ?? "";
          const pred = cMap.get(iso);
          if (!pred) return;
          // Set pointer cursor on monitored countries
          const el = (leafletLayer as any).getElement?.();
          if (el) el.style.cursor = "pointer";
          leafletLayer.on({
            add: () => {
              const el2 = (leafletLayer as any).getElement?.();
              if (el2) el2.style.cursor = "pointer";
            },
            mouseover: (e) => {
              e.target.setStyle({ weight: 2.5, fillOpacity: Math.min(1, (TIER_FILL_OPACITY[pred.alert_tier] ?? 0.12) + 0.2) });
              const el3 = e.target.getElement?.();
              if (el3) el3.style.cursor = "pointer";
            },
            mouseout: (e) => {
              e.target.setStyle({ weight: 1.2, fillOpacity: TIER_FILL_OPACITY[pred.alert_tier] ?? 0.12 });
            },
            click: () => {
              setSelected({
                name: pred.region_name ?? COUNTRY_NAMES[iso] ?? iso,
                countryId: iso,
                tier: pred.alert_tier,
                p3: pred.p_ipc3plus_90d,
                p4: pred.p_ipc4plus_90d,
                ciLow: pred.ci_90_low ?? null,
                ciHigh: pred.ci_90_high ?? null,
                css: pred.composite_stress_score,
                conflict: pred.conflict_stress,
                drought: pred.drought_stress,
                food: pred.food_access_stress,
                ipc: pred.ipc_stress,
                price: pred.price_stress,
                refDate: pred.reference_date ?? "",
                layer: "country",
              });
            },
          });
        },
      }).addTo(layerGroupRef.current!);

    } else if (layer === "admin1") {
      // Plot Admin1 as circles at centroids
      a1preds.forEach(p => {
        if (p.centroid_lat == null || p.centroid_lon == null) return;
        const tier = p.alert_tier;
        const radius = 18000 + p.p_ipc3plus_90d * 60000;
        L.circle([p.centroid_lat, p.centroid_lon], {
          radius,
          fillColor: TIER_FILL[tier] ?? "#78716C",
          fillOpacity: TIER_FILL_OPACITY[tier] ?? 0.12,
          color: TIER_FILL[tier] ?? "#78716C",
          weight: 1,
          opacity: 0.7,
        }).on("click", () => {
          setSelected({
            name: p.admin1_name ?? p.admin1_id ?? "",
            countryId: p.country_id,
            tier,
            p3: p.p_ipc3plus_90d,
            p4: p.p_ipc4plus_90d,
            ciLow: p.ci_90_low ?? null,
            ciHigh: p.ci_90_high ?? null,
            css: p.composite_stress_score,
            conflict: p.conflict_stress,
            drought: p.drought_stress,
            food: p.food_access_stress,
            ipc: p.ipc_stress,
            price: p.price_stress,
            refDate: p.reference_date ?? "",
            layer: "admin1",
          });
        }).addTo(layerGroupRef.current!);
      });

    } else {
      // Admin2 — smaller circles
      a2preds.forEach(p => {
        if (p.centroid_lat == null || p.centroid_lon == null) return;
        const tier = p.alert_tier;
        const radius = 10000 + p.p_ipc3plus_90d * 30000;
        L.circle([p.centroid_lat, p.centroid_lon], {
          radius,
          fillColor: TIER_FILL[tier] ?? "#78716C",
          fillOpacity: (TIER_FILL_OPACITY[tier] ?? 0.12) + 0.1,
          color: TIER_FILL[tier] ?? "#78716C",
          weight: 0.8,
          opacity: 0.8,
        }).on("click", () => {
          setSelected({
            name: `${p.admin2_name ?? ""} (${p.admin1_id ?? ""})`,
            countryId: p.country_id,
            tier,
            p3: p.p_ipc3plus_90d,
            p4: p.p_ipc4plus_90d,
            ciLow: p.ci_90_low ?? null,
            ciHigh: p.ci_90_high ?? null,
            css: p.composite_stress_score,
            conflict: p.conflict_stress,
            drought: p.drought_stress,
            food: p.food_access_stress,
            ipc: p.ipc_stress,
            price: p.price_stress,
            refDate: p.reference_date ?? "",
            layer: "admin2",
          });
        }).addTo(layerGroupRef.current!);
      });
    }
  }, [layer, loadingData, predictions, a1preds, a2preds]);

  useEffect(() => {
    if (mapReady) renderLayer();
  }, [mapReady, renderLayer]);

  // ── Legend counts ───────────────────────────────────────────────────────
  const activePreds = layer === "country" ? predictions : layer === "admin1" ? a1preds : a2preds;
  const t1 = activePreds.filter(p => p.alert_tier === "TIER-1").length;
  const t2 = activePreds.filter(p => p.alert_tier === "TIER-2").length;
  const t3 = activePreds.filter(p => p.alert_tier === "TIER-3").length;

  return (
    <div style={{ display: "flex", gap: 0, marginTop: 24, height: 620 }}>

      {/* Map container */}
      <div style={{ flex: 1, position: "relative", border: "1px solid var(--border)", overflow: "hidden" }}>

        {/* Zoom controls — bottom-left inside container (avoids overflow:hidden clipping) */}
        <div style={{
          position: "absolute", bottom: 16, left: 12, zIndex: 1000,
          display: "flex", flexDirection: "column", gap: 1,
        }}>
          {([["+", 1], ["-", -1]] as const).map(([label, delta]) => (
            <button key={label} onClick={() => {
              if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() + delta);
            }} style={{
              width: 28, height: 28,
              background: "white", border: "1px solid var(--border)",
              fontFamily: "var(--mono)", fontSize: 16, fontWeight: 400,
              color: "var(--ink)", cursor: "pointer", lineHeight: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{label}</button>
          ))}
        </div>

        {/* Layer switcher — top-right */}
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 1000,
          background: "white", border: "1px solid var(--border)", display: "flex", gap: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {(["country", "admin1", "admin2"] as Layer[]).map((l, i) => (
            <button key={l} onClick={() => { setLayer(l); setSelected(null); }} style={{
              fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "7px 14px", background: layer === l ? "var(--ink)" : "white",
              color: layer === l ? "var(--parchment)" : "var(--ink-light)",
              border: "none", borderRight: i < 2 ? "1px solid var(--border)" : "none",
              cursor: "pointer",
            }}>
              {l === "country" ? "Country" : l === "admin1" ? "Admin1" : "Admin2"}
            </button>
          ))}
        </div>

        {/* Loading overlay */}
        {loadingData && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 999, background: "rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.12em",
          }}>
            Loading predictions…
          </div>
        )}

        {/* Leaflet map div */}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Side panel */}
      <div style={{
        width: 280, flexShrink: 0, borderTop: "1px solid var(--border)",
        borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        background: "white", display: "flex", flexDirection: "column",
      }}>
        {/* Legend */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>
            {layer === "country" ? "Country" : layer === "admin1" ? "Admin1 · Province" : "Admin2 · District"} layer
          </div>
          {(["TIER-1", "TIER-2", "TIER-3"] as const).map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: TIER_FILL[t], opacity: 0.8, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: TIER_FILL[t], fontWeight: 700, width: 54 }}>{t}</span>
              <span style={{ fontSize: 11, color: "var(--ink-light)" }}>{TIER_LABEL[t]}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "#C0392B", lineHeight: 1 }}>{loadingData ? "—" : t1}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>TIER-1</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "#D97706", lineHeight: 1 }}>{loadingData ? "—" : t2}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>TIER-2</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "#78716C", lineHeight: 1 }}>{loadingData ? "—" : t3}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>TIER-3</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color: "var(--ink-light)", lineHeight: 1 }}>{loadingData ? "—" : activePreds.length}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Total</div>
            </div>
          </div>
        </div>

        {/* Selected feature detail */}
        {selected ? (
          <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
            <button onClick={() => setSelected(null)} style={{
              fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "none", border: "1px solid var(--border)", padding: "3px 8px",
              color: "var(--ink-light)", cursor: "pointer", marginBottom: 14,
            }}>← Back</button>

            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {COUNTRY_NAMES[selected.countryId] ?? selected.countryId}
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 10, color: "var(--ink)" }}>
              {selected.name}
            </div>

            <span style={{
              fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              color: TIER_FILL[selected.tier], background: `${TIER_FILL[selected.tier]}18`,
              padding: "3px 9px", display: "inline-block", marginBottom: 18,
            }}>{selected.tier} · {TIER_LABEL[selected.tier]}</span>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { label: "P(IPC 3+)", val: fmtPct(selected.p3), color: TIER_FILL[selected.tier] },
                { label: "P(IPC 4+)", val: fmtPct(selected.p4), color: "#78716C" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: "var(--parchment)", padding: "10px 12px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Sensitivity interval row */}
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginBottom: 20 }}>
              {selected.ciLow != null && selected.ciHigh != null
                ? `SI [${fmtPct(selected.ciLow)} – ${fmtPct(selected.ciHigh)}] · Input-perturbation`
                : "SI Pending · Populating May 2026"}
            </div>

            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>Stress Drivers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { label: "IPC Stress",     v: selected.ipc      },
                { label: "Conflict",       v: selected.conflict  },
                { label: "Drought",        v: selected.drought   },
                { label: "Food Access",    v: selected.food      },
                { label: "Price",          v: selected.price     },
                { label: "Composite CSS",  v: selected.css       },
              ].map(({ label, v }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginBottom: 2 }}>{label}</div>
                  {stressBar(v)}
                </div>
              ))}
            </div>

            {selected.refDate && (
              <div style={{ marginTop: 16, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>
                Reference: {selected.refDate.slice(0, 10)}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", letterSpacing: "0.08em" }}>
              Click any region on the map
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.6, maxWidth: 200 }}>
              to see probability estimates and stress driver breakdown
            </div>
          </div>
        )}

        {/* Instructions footer */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border-light)", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", lineHeight: 1.6 }}>
          Country layer: choropleth fill · Admin1/2: proportional circles · Circle size ∝ P(IPC 3+)
        </div>
      </div>
    </div>
  );
}

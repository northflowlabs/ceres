"use client";

import { useEffect, useState, useMemo } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://ceres-core-production.up.railway.app";

const COUNTRY_NAMES: Record<string, string> = {
  ETH: "Ethiopia",       SOM: "Somalia",          SDN: "Sudan",
  SSD: "South Sudan",    KEN: "Kenya",             YEM: "Yemen",
  NIG: "Niger",          MLI: "Mali",              BFA: "Burkina Faso",
  HTI: "Haiti",          AFG: "Afghanistan",       SYR: "Syria",
  COD: "DR Congo",       ZWE: "Zimbabwe",          MOZ: "Mozambique",
  TCD: "Chad",           CAF: "Cent. African Rep.",NGA: "Nigeria",
  CMR: "Cameroon",       MRT: "Mauritania",        SEN: "Senegal",
  GIN: "Guinea",         SLE: "Sierra Leone",      LBR: "Liberia",
  CIV: "Ivory Coast",    UGA: "Uganda",            RWA: "Rwanda",
  BDI: "Burundi",        TZA: "Tanzania",          MWI: "Malawi",
  ZMB: "Zambia",         MDG: "Madagascar",        IRQ: "Iraq",
  LBN: "Lebanon",        PAK: "Pakistan",          BGD: "Bangladesh",
  MMR: "Myanmar",        COL: "Colombia",          VEN: "Venezuela",
  PSE: "Palestine",      LSO: "Lesotho",           SWZ: "Eswatini",
  ERI: "Eritrea",        DJI: "Djibouti",
};

interface Admin1Prediction {
  admin1_id: string;
  country_id: string;
  admin1_name: string;
  centroid_lat: number;
  centroid_lon: number;
  ipc_weight: number;
  alert_tier: string;
  p_ipc3plus_90d: number;
  p_ipc4plus_90d: number;
  composite_stress_score: number;
  drought_stress: number;
  vegetation_stress: number;
  conflict_stress: number;
  food_access_stress: number;
  ipc_stress: number;
  price_stress: number;
  current_ipc_phase: number | null;
  n_signals_available: number;
  from_country_fallback: boolean;
  reference_date: string;
}

type SortKey = "p_ipc3plus_90d" | "composite_stress_score" | "conflict_stress" | "drought_stress" | "food_access_stress" | "ipc_stress";

const TIER_COLORS: Record<string, string> = {
  "TIER-1": "#C0392B",
  "TIER-2": "#D97706",
  "TIER-3": "#78716C",
};

function tierBg(tier: string) {
  if (tier === "TIER-1") return "rgba(192,57,43,0.08)";
  if (tier === "TIER-2") return "rgba(217,119,6,0.07)";
  return "transparent";
}

function stressColor(v: number) {
  if (v >= 0.70) return "#C0392B";
  if (v >= 0.50) return "#D97706";
  if (v >= 0.30) return "#2E7D32";
  return "#78716C";
}

function ProbBar({ value }: { value: number }) {
  const col = stressColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: "var(--border-light)", borderRadius: 3, minWidth: 60 }}>
        <div style={{ height: "100%", borderRadius: 3, background: col, width: `${Math.min(100, value * 100)}%` }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: col, width: 38, textAlign: "right", fontWeight: 700 }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  const col = stressColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 48, height: 4, background: "var(--border-light)", borderRadius: 2 }}>
        <div style={{ height: "100%", borderRadius: 2, background: col, width: `${Math.min(100, value * 100)}%` }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: col, width: 26, textAlign: "right" }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export default function SubnationalPage() {
  const [rows, setRows] = useState<Admin1Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("p_ipc3plus_90d");
  const [sortDesc, setSortDesc] = useState(true);
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [filterTier, setFilterTier] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/v1/admin1/predictions?limit=700`)
      .then(r => r.json())
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(() =>
    Array.from(new Set(rows.map(r => r.country_id))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    let r = rows;
    if (filterCountry !== "ALL") r = r.filter(x => x.country_id === filterCountry);
    if (filterTier !== "ALL") r = r.filter(x => x.alert_tier === filterTier);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x => x.admin1_name.toLowerCase().includes(q) || x.country_id.toLowerCase().includes(q) || (COUNTRY_NAMES[x.country_id] ?? "").toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => sortDesc ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
  }, [rows, filterCountry, filterTier, search, sortBy, sortDesc]);

  const tier1Count = rows.filter(r => r.alert_tier === "TIER-1").length;
  const tier2Count = rows.filter(r => r.alert_tier === "TIER-2").length;
  const nCountries = new Set(rows.map(r => r.country_id)).size;

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDesc(d => !d);
    else { setSortBy(key); setSortDesc(true); }
  }

  const thStyle = (key: SortKey | null, align: "left" | "right" = "right") => ({
    fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const,
    color: key && sortBy === key ? "var(--earth)" : "var(--parchment)",
    background: "var(--ink)", padding: "10px 14px", textAlign: align,
    fontWeight: 500, cursor: key ? "pointer" : "default",
    userSelect: "none" as const, whiteSpace: "nowrap" as const,
  });

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Header */}
      <div className="page-header subnational-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1300, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Admin1 Sub-national Resolution · 43 Countries
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
          Sub-national Risk Intelligence
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-mid)", maxWidth: 720, lineHeight: 1.7, fontWeight: 300 }}>
          Probabilistic 90-day IPC Phase 3+ forecasts disaggregated to Admin1 (province / state / region) level across {loading ? "—" : rows.length} administrative units in {loading ? "—" : nCountries} countries. Same logistic scoring model as country-level predictions.
        </p>
        <div style={{ display: "flex", gap: 40, marginTop: 32, flexWrap: "wrap" }}>
          {[
            { num: loading ? "—" : rows.length,    label: "Admin1 Units",          color: "var(--ink)"     },
            { num: loading ? "—" : nCountries,      label: "Countries",             color: "var(--earth)"   },
            { num: loading ? "—" : tier1Count,      label: "TIER-1 · Critical",     color: "var(--crisis)"  },
            { num: loading ? "—" : tier2Count,      label: "TIER-2 · Warning",      color: "var(--warning)" },
          ].map(({ num, label, color }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="subnational-wrap" style={{ maxWidth: 1300, margin: "0 auto", width: "100%", padding: "32px 40px 80px", boxSizing: "border-box" }}>

        {/* Filters */}
        <div className="subnational-filter-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search region or country…"
            style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "8px 14px", border: "1px solid var(--border)", background: "white", color: "var(--ink)", outline: "none", width: 220 }}
          />
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "8px 14px", border: "1px solid var(--border)", background: "white", color: "var(--ink)" }}>
            <option value="ALL">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{COUNTRY_NAMES[c] ?? c} ({c})</option>)}
          </select>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
            style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "8px 14px", border: "1px solid var(--border)", background: "white", color: "var(--ink)" }}>
            <option value="ALL">All Tiers</option>
            <option value="TIER-1">TIER-1 · Critical</option>
            <option value="TIER-2">TIER-2 · Warning</option>
            <option value="TIER-3">TIER-3 · Watch</option>
          </select>
          <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
            {loading ? "Loading…" : `${filtered.length} units`}
          </div>
        </div>

        {error && (
          <div style={{ padding: "16px 20px", background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.2)", color: "var(--crisis)", fontFamily: "var(--mono)", fontSize: 11, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={thStyle(null, "left")}>Country</th>
                <th style={thStyle(null, "left")}>Region</th>
                <th style={thStyle(null, "right")}>Tier</th>
                <th onClick={() => toggleSort("p_ipc3plus_90d")} style={thStyle("p_ipc3plus_90d")}>
                  P(IPC3+) 90d{sortBy === "p_ipc3plus_90d" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th onClick={() => toggleSort("composite_stress_score")} style={thStyle("composite_stress_score")}>
                  Composite{sortBy === "composite_stress_score" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th onClick={() => toggleSort("conflict_stress")} style={thStyle("conflict_stress")}>
                  Conflict{sortBy === "conflict_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th onClick={() => toggleSort("drought_stress")} style={thStyle("drought_stress")}>
                  Drought{sortBy === "drought_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th onClick={() => toggleSort("food_access_stress")} style={thStyle("food_access_stress")}>
                  Food Access{sortBy === "food_access_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th style={thStyle(null, "right")}>IPC Phase</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 14 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)" }}>
                        <div className="skeleton" style={{ height: 12, width: j < 2 ? 100 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((a) => {
                const tier = a.alert_tier;
                const borderLeft = tier === "TIER-1" ? "3px solid var(--crisis)" : tier === "TIER-2" ? "3px solid var(--warning)" : "3px solid transparent";
                return (
                  <tr key={a.admin1_id} style={{ background: tierBg(tier), borderBottom: "1px solid var(--border-light)", borderLeft }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>{a.country_id}</span>
                      <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{COUNTRY_NAMES[a.country_id] ?? a.country_id}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{a.admin1_name}</span>
                      {a.from_country_fallback && (
                        <span title="Estimated from country-level fallback" style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", marginLeft: 6, border: "1px solid var(--border-light)", padding: "1px 4px" }}>est.</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                        color: TIER_COLORS[tier] ?? "var(--ink-light)",
                        background: `${TIER_COLORS[tier] ?? "#78716C"}15`,
                        padding: "3px 8px",
                      }}>
                        {tier}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 150 }}>
                      <ProbBar value={a.p_ipc3plus_90d} />
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 110 }}>
                      <MiniBar value={a.composite_stress_score} />
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 100 }}>
                      <MiniBar value={a.conflict_stress} />
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 100 }}>
                      <MiniBar value={a.drought_stress} />
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 100 }}>
                      <MiniBar value={a.food_access_stress} />
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {a.current_ipc_phase != null ? (
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                          color: stressColor(a.current_ipc_phase / 5),
                          background: `${stressColor(a.current_ipc_phase / 5)}15`,
                          padding: "2px 8px",
                        }}>
                          Ph {a.current_ipc_phase.toFixed(1)}
                        </span>
                      ) : <span style={{ color: "var(--border)" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 16 }}>
          Probability forecasts computed using the same logistic scoring model as country-level predictions, disaggregated via grid-cell intersection (~50–200 km accuracy). Rows marked "est." use country-level signals scaled by population weight where sub-national grid data is sparse. Updated weekly.
        </p>

      </div>
      <SiteFooter />
    </div>
  );
}

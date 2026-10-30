"use client";

import { useState, useMemo } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

import { useSiteData } from "@/lib/useSiteData";
import type { SubnationalData } from "@/lib/serverData";

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

interface Admin2Prediction {
  admin2_id: string;
  admin1_id: string;
  country_id: string;
  admin2_name: string;
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
  from_admin1_fallback: boolean;
  from_country_fallback: boolean;
  reference_date: string;
}

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
        {value.toFixed(3)}
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

export default function SubnationalPage({ initial }: { initial: SubnationalData | null }) {
  const [resolution, setResolution] = useState<"admin1" | "admin2">("admin1");

  const { data, failed } = useSiteData<SubnationalData>("subnational", initial);
  const rows = useMemo(() => (data?.admin1 ?? []) as unknown as Admin1Prediction[], [data]);
  const a2rows = useMemo(() => (data?.admin2 ?? []) as unknown as Admin2Prediction[], [data]);
  const loading = !data && !failed;
  const a2loading = loading;
  const error = failed ? "The forecasts are unavailable right now." : null;
  const a2error = error;

  const [sortBy, setSortBy] = useState<SortKey>("p_ipc3plus_90d");
  const [sortDesc, setSortDesc] = useState(true);
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [search, setSearch] = useState("");

  const activeRows = resolution === "admin1" ? rows : a2rows;
  const activeLoading = resolution === "admin1" ? loading : a2loading;
  const activeError = resolution === "admin1" ? error : a2error;
  const noFigures = activeLoading || activeRows.length === 0 || !!activeError;
  const a2FromAdmin1 = a2rows.filter(a => a.from_admin1_fallback).length;
  const a2FromCountry = a2rows.filter(a => a.from_country_fallback).length;

  const countries = useMemo(() =>
    Array.from(new Set(activeRows.map(r => r.country_id))).sort(),
    [activeRows]
  );

  const filtered = useMemo(() => {
    let r = activeRows as (Admin1Prediction | Admin2Prediction)[];
    if (filterCountry !== "ALL") r = r.filter(x => x.country_id === filterCountry);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x => {
        const name = resolution === "admin1" ? (x as Admin1Prediction).admin1_name : (x as Admin2Prediction).admin2_name;
        return name.toLowerCase().includes(q) || x.country_id.toLowerCase().includes(q) || (COUNTRY_NAMES[x.country_id] ?? "").toLowerCase().includes(q);
      });
    }
    const getVal = (x: Admin1Prediction | Admin2Prediction): number => {
      if (sortBy === "p_ipc3plus_90d")         return x.p_ipc3plus_90d;
      if (sortBy === "composite_stress_score") return x.composite_stress_score;
      if (sortBy === "conflict_stress")        return x.conflict_stress;
      if (sortBy === "drought_stress")         return x.drought_stress;
      if (sortBy === "food_access_stress")     return x.food_access_stress;
      if (sortBy === "ipc_stress")             return x.ipc_stress;
      return 0;
    };
    return [...r].sort((a, b) => sortDesc ? getVal(b) - getVal(a) : getVal(a) - getVal(b));
  }, [activeRows, filterCountry, search, sortBy, sortDesc, resolution]);

  const nCountries = new Set(activeRows.map(r => r.country_id)).size;

  const sortAria = (key: SortKey) => (sortBy !== key ? "none" : sortDesc ? "descending" : "ascending");
  const sortKey = (key: SortKey) => (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    toggleSort(key);
  };

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
          Sub-national Resolution · {resolution === "admin1" ? "Admin1 · Province / State" : "Admin2 · District / County"}
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
          Sub-national Screening
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-mid)", maxWidth: 720, lineHeight: 1.7, fontWeight: 300 }}>
          A separate sub-national screening score, computed from sub-national conflict and vegetation signals. It is not an IPC Phase 3+ forecast and cannot be compared with country figures.{" "}
          {resolution === "admin1"
            ? <>This view covers {noFigures ? "…" : activeRows.length} Admin1 regions in {noFigures ? "…" : nCountries} countries.</>
            : <>This view covers {noFigures ? "…" : activeRows.length} Admin2 units in {noFigures ? "…" : nCountries} countries. All of them draw on a parent-level signal: {noFigures ? "…" : a2FromAdmin1} from Admin1 and {noFigures ? "…" : a2FromCountry} from country level.</>
          }
        </p>
        {/* Resolution tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 28, borderBottom: "2px solid var(--ink)" }}>
          {["admin1", "Admin2"].map((res, i) => (
              <button key={res} aria-pressed={resolution === res} onClick={() => { setResolution(res as "admin1" | "admin2"); setFilterCountry("ALL"); setSearch(""); }} style={{
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
                borderBottom: resolution === res ? "2px solid var(--earth)" : "2px solid transparent",
                marginBottom: -2, color: resolution === res ? "var(--earth)" : "var(--ink-light)",
              }}>
                {i === 0 ? `Admin1 · Province (${loading || !rows.length ? "…" : rows.length})` : `Admin2 · District (${a2loading ? "…" : a2rows.length || "10 countries"})`}
              </button>
            ))}
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 32, flexWrap: "wrap" }}>
          {[
            { num: noFigures ? "…" : activeRows.length, label: resolution === "admin1" ? "Admin1 Regions" : "Admin2 Units", color: "var(--ink)"     },
            { num: noFigures ? "…" : nCountries,        label: "Countries",             color: "var(--earth)"   },
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
          <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
            {noFigures ? "…" : `${filtered.length} units`}
          </div>
        </div>

        {activeError && (
          <div style={{ padding: "16px 20px", background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.2)", color: "var(--crisis)", fontFamily: "var(--mono)", fontSize: 11, marginBottom: 24 }}>
            {activeError}
          </div>
        )}

        {/* Table */}
        <div style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th scope="col" style={thStyle(null, "left")}>Country</th>
                <th scope="col" style={thStyle(null, "left")}>Region</th>
                <th scope="col" tabIndex={0} aria-sort={sortAria("p_ipc3plus_90d")} onKeyDown={sortKey("p_ipc3plus_90d")} onClick={() => toggleSort("p_ipc3plus_90d")} style={thStyle("p_ipc3plus_90d")}>
                  Screening Score{sortBy === "p_ipc3plus_90d" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th scope="col" tabIndex={0} aria-sort={sortAria("composite_stress_score")} onKeyDown={sortKey("composite_stress_score")} onClick={() => toggleSort("composite_stress_score")} style={thStyle("composite_stress_score")}>
                  Composite{sortBy === "composite_stress_score" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th scope="col" tabIndex={0} aria-sort={sortAria("conflict_stress")} onKeyDown={sortKey("conflict_stress")} onClick={() => toggleSort("conflict_stress")} style={thStyle("conflict_stress")}>
                  Conflict{sortBy === "conflict_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th scope="col" tabIndex={0} aria-sort={sortAria("drought_stress")} onKeyDown={sortKey("drought_stress")} onClick={() => toggleSort("drought_stress")} style={thStyle("drought_stress")}>
                  Drought{sortBy === "drought_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th scope="col" tabIndex={0} aria-sort={sortAria("food_access_stress")} onKeyDown={sortKey("food_access_stress")} onClick={() => toggleSort("food_access_stress")} style={thStyle("food_access_stress")}>
                  Food Access{sortBy === "food_access_stress" ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
                <th scope="col" style={thStyle(null, "right")}>IPC Phase</th>
              </tr>
            </thead>
            <tbody>
              {activeLoading ? (
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
                const a1 = a as Admin1Prediction;
                const a2 = a as Admin2Prediction;
                const unitName = resolution === "admin1" ? a1.admin1_name : a2.admin2_name;
                const unitKey  = resolution === "admin1" ? a1.admin1_id  : a2.admin2_id;
                const isFallback = resolution === "admin1" ? a1.from_country_fallback : (a2.from_admin1_fallback || a2.from_country_fallback);
                return (
                  <tr key={unitKey} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>{a.country_id}</span>
                      <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{COUNTRY_NAMES[a.country_id] ?? a.country_id}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{unitName}</span>
                      {resolution === "admin2" && (
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginTop: 1 }}>{a2.admin1_id}</div>
                      )}
                      {isFallback && (
                        <span title="Uses a parent-level signal" style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-light)", marginLeft: 6, border: "1px solid var(--border-light)", padding: "1px 4px" }}>est.</span>
                      )}
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
                      ) : <span style={{ color: "var(--border)" }}>n/a</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 16 }}>
          A separate sub-national screening score, computed from sub-national conflict and vegetation signals. It is not an IPC Phase 3+ forecast and cannot be compared with country figures. Located by grid-cell intersection (~50-200 km accuracy). Rows marked "est." use a parent-level signal.
        </p>

      </div>
      <SiteFooter />
    </div>
  );
}

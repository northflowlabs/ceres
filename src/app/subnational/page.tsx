"use client";

import { useEffect, useState, useMemo } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api, Admin1Signal } from "@/lib/api";

const COUNTRY_NAMES: Record<string, string> = {
  ETH: "Ethiopia", SOM: "Somalia", SDN: "Sudan", SSD: "South Sudan",
  KEN: "Kenya",    YEM: "Yemen",   NIG: "Niger",  MLI: "Mali",
  BFA: "Burkina Faso", HTI: "Haiti", AFG: "Afghanistan",
  SYR: "Syria",    COD: "DR Congo", ZWE: "Zimbabwe", MOZ: "Mozambique",
};

const MONITORED = Object.keys(COUNTRY_NAMES);

type SortKey = "composite_stress_score" | "conflict_stress" | "drought_stress" | "food_access_stress" | "ipc_stress";

function stressColor(v: number) {
  if (v >= 0.70) return "#C0392B";
  if (v >= 0.50) return "#D97706";
  if (v >= 0.30) return "#2E7D32";
  return "#78716C";
}

function Bar({ value }: { value: number }) {
  const col = stressColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: "var(--border-light)", borderRadius: 3, minWidth: 48 }}>
        <div style={{ height: "100%", borderRadius: 3, background: col, width: `${Math.min(100, value * 100)}%` }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: col, width: 34, textAlign: "right", fontWeight: 600 }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export default function SubnationalPage() {
  const [allSignals, setAllSignals] = useState<Admin1Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("composite_stress_score");
  const [sortDesc, setSortDesc] = useState(true);
  const [filterCountry, setFilterCountry] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all(
      MONITORED.map(c => api.admin1(c).catch(() => [] as Admin1Signal[]))
    ).then(results => {
      setAllSignals(results.flat());
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let rows = allSignals;
    if (filterCountry !== "ALL") rows = rows.filter(r => r.country_id === filterCountry);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.admin1_name.toLowerCase().includes(q) || r.country_id.toLowerCase().includes(q));
    }
    return [...rows].sort((a, b) =>
      sortDesc ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
    );
  }, [allSignals, filterCountry, search, sortBy, sortDesc]);

  const tier1 = filtered.filter(r => r.composite_stress_score >= 0.70).length;
  const tier2 = filtered.filter(r => r.composite_stress_score >= 0.50 && r.composite_stress_score < 0.70).length;

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDesc(d => !d);
    else { setSortBy(key); setSortDesc(true); }
  }

  const th = (key: SortKey | null, label: string, align: "left" | "right" = "right") => (
    <th
      key={label}
      onClick={key ? () => toggleSort(key) : undefined}
      style={{
        fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
        color: key && sortBy === key ? "var(--earth)" : "var(--parchment)",
        background: "var(--ink)", padding: "10px 14px", textAlign: align,
        fontWeight: 500, cursor: key ? "pointer" : "default",
        userSelect: "none", whiteSpace: "nowrap",
      }}
    >
      {label}{key && sortBy === key ? (sortDesc ? " ▼" : " ▲") : ""}
    </th>
  );

  return (
    <div className="topo-texture" style={{ background: "var(--parchment)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      {/* Page header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", padding: "60px 40px 48px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--earth)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--earth)" }} />
          Admin1 Sub-national Resolution
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
          Sub-national Risk Intelligence
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-mid)", maxWidth: 680, lineHeight: 1.7, fontWeight: 300 }}>
          CERES disaggregates crisis signals to Admin1 (province / state / region) level across {allSignals.length || "—"} administrative units in {MONITORED.length} countries. Click any column header to sort. Crisis-level thresholds: stress ≥ 70% (critical), 50–70% (warning).
        </p>

        {/* Summary strip */}
        <div style={{ display: "flex", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
          {[
            { num: allSignals.length, label: "Admin1 Units Monitored", color: "var(--ink)" },
            { num: tier1, label: "Critical Stress (≥70%)", color: "var(--crisis)" },
            { num: tier2, label: "Warning Stress (50–70%)", color: "var(--warning)" },
            { num: MONITORED.length, label: "Countries", color: "var(--earth)" },
          ].map(({ num, label, color }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
                {loading ? "—" : num}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "32px 40px 80px" }}>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search region or country…"
            style={{
              fontFamily: "var(--mono)", fontSize: 12, padding: "8px 14px",
              border: "1px solid var(--border)", background: "white",
              color: "var(--ink)", outline: "none", width: 220,
            }}
          />
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            style={{
              fontFamily: "var(--mono)", fontSize: 11, padding: "8px 14px",
              border: "1px solid var(--border)", background: "white", color: "var(--ink)",
              letterSpacing: "0.06em",
            }}
          >
            <option value="ALL">All Countries</option>
            {MONITORED.map(c => (
              <option key={c} value={c}>{COUNTRY_NAMES[c]} ({c})</option>
            ))}
          </select>
          <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
            {loading ? "Loading…" : `${filtered.length} units shown`}
          </div>
        </div>

        {error && (
          <div style={{ padding: "16px 20px", background: "#FEF2F2", border: "1px solid rgba(192,57,43,0.2)", color: "var(--crisis)", fontFamily: "var(--mono)", fontSize: 11, marginBottom: 24 }}>
            Failed to load admin1 data: {error}
          </div>
        )}

        {/* Main table */}
        <div style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {th(null, "Country", "left")}
                {th(null, "Region", "left")}
                {th(null, "IPC Phase", "right")}
                {th("composite_stress_score", "Composite Stress")}
                {th("conflict_stress", "Conflict")}
                {th("drought_stress", "Drought")}
                {th("food_access_stress", "Food Access")}
                {th("ipc_stress", "IPC Stress")}
                {th(null, "Signals", "right")}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-light)" }}>
                        <div className="skeleton" style={{ height: 12, width: j === 0 ? 80 : j === 1 ? 120 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((a, i) => {
                const stress = a.composite_stress_score;
                const rowBg = stress >= 0.70 ? "rgba(192,57,43,0.03)" : stress >= 0.50 ? "rgba(217,119,6,0.03)" : i % 2 === 1 ? "white" : "transparent";
                const borderLeft = stress >= 0.70 ? "3px solid var(--crisis)" : stress >= 0.50 ? "3px solid var(--warning)" : "3px solid transparent";
                return (
                  <tr key={a.admin1_id} style={{ background: rowBg, borderBottom: "1px solid var(--border-light)", borderLeft }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--earth)", letterSpacing: "0.06em" }}>{a.country_id}</span>
                      <div style={{ fontSize: 11, color: "var(--ink-light)" }}>{COUNTRY_NAMES[a.country_id] ?? a.country_id}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{a.admin1_name}</span>
                      {a.from_country_fallback && (
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)", marginLeft: 6 }}>est.</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {a.current_ipc_phase != null ? (
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                          color: stressColor(a.current_ipc_phase / 5),
                          background: `${stressColor(a.current_ipc_phase / 5)}15`,
                          padding: "2px 8px", borderRadius: 2,
                        }}>
                          Ph {a.current_ipc_phase.toFixed(1)}
                        </span>
                      ) : <span style={{ color: "var(--ink-light)" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 14px", minWidth: 140 }}><Bar value={a.composite_stress_score} /></td>
                    <td style={{ padding: "10px 14px", minWidth: 120 }}><Bar value={a.conflict_stress} /></td>
                    <td style={{ padding: "10px 14px", minWidth: 120 }}><Bar value={a.drought_stress} /></td>
                    <td style={{ padding: "10px 14px", minWidth: 120 }}><Bar value={a.food_access_stress} /></td>
                    <td style={{ padding: "10px 14px", minWidth: 120 }}><Bar value={a.ipc_stress} /></td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)" }}>
                      {a.n_signals_elevated}<span style={{ color: "var(--border)" }}>/{a.n_signals_available}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <p style={{ fontSize: 12, color: "var(--ink-light)", fontStyle: "italic", marginTop: 16 }}>
          Admin1 signals are extracted from the same CHIRPS, MODIS NDVI, ACLED, IPC, WFP VAM, and FAO data streams as country-level predictions, disaggregated via grid-cell intersection against the embedded boundary table (~50–200km accuracy). Rows marked "est." use country-level fallback where sub-national grid data is sparse. Updated weekly.
        </p>

      </div>
      <SiteFooter />
    </div>
  );
}

"use client";

import Link from "next/link";
import { tier1Rates } from "@/lib/protocol";
import type { LedgerFigures } from "@/lib/serverData";
import { useSiteData } from "@/lib/useSiteData";

/**
 * Compact accuracy ledger for the dashboard side panel, read live from the
 * ledger on every load.
 *
 * Precision is never shown without recall, Brier and skill against
 * climatology next to it, so the panel cannot be read as a selected subset.
 * Nothing here is hard-coded: without the API the panel links to the full ledger
 * instead of showing a number.
 */

const fmtInt = (n: number) => n.toLocaleString("en-GB");

function fmtPct(n: number | null | undefined) {
  return n == null ? null : `${(n * 100).toFixed(1)}%`;
}

function fmtNum(n: number | null | undefined, decimals: number) {
  if (n == null) return null;
  // A real minus sign keeps negative skill legible in the mono font.
  return n < 0 ? `−${Math.abs(n).toFixed(decimals)}` : n.toFixed(decimals);
}

function gradingSourceLabel(breakdown: Record<string, number> | undefined) {
  const sources = Object.keys(breakdown ?? {});
  return sources.length === 1 && sources[0] === "fews_net_proxy"
    ? "FEWS NET proxy"
    : "IPC and FEWS NET proxy";
}

type Row = { label: string; val: string; note?: string };

export default function LedgerSummary({ initial = null }: { initial?: LedgerFigures | null }) {
  const { data, failed } = useSiteData<LedgerFigures>("figures", initial);
  const v = data?.metrics ?? null;
  const t1 = data?.tier1 ?? null;
  const { precision, recall } = tier1Rates(t1);
  const state = v ? "ready" : failed ? "failed" : "loading";

  const muted = { fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", lineHeight: 1.6 } as const;

  if (state !== "ready" || !v) {
    return (
      <p style={{ ...muted, margin: "4px 0 0" }}>
        {state === "loading" ? "Loading the verification ledger…" : "The live figures are in the "}
        {state === "failed" && (
          <Link href="/validation" style={{ color: "var(--earth)" }}>
            verification ledger
          </Link>
        )}
      </p>
    );
  }

  const graded = v.n_graded_for_metrics ?? 0;

  const rows: Row[] = [
    { label: "Predictions issued", val: fmtInt(v.total_predictions) },
    { label: "Graded", val: `${fmtInt(graded)} of ${fmtInt(v.total_predictions)}` },
    { label: "Brier score", val: fmtNum(v.brier_score, 3) ?? "n/a", note: "lower is better" },
    {
      label: "Skill vs climatology",
      val: fmtNum(v.skill_score, 2) ?? "n/a",
      note: "above 0 beats the base rate",
    },
    {
      label: "Tier-1 precision",
      val: fmtPct(precision) ?? "n/a",
      note: t1 ? `${t1.confirmed} of ${t1.alerts} alerts` : undefined,
    },
    {
      label: "Tier-1 recall",
      val: fmtPct(recall) ?? "n/a",
      note: t1 && t1.phase4Events > 0 ? `${t1.phase4Alerted} of ${t1.phase4Events} Phase 4+ outcomes` : undefined,
    },
    { label: "SI coverage (90%)", val: fmtPct(v.si_coverage) ?? "n/a" },
  ];

  return (
    <div>
      {rows.map(({ label, val, note }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            padding: "5px 0",
            borderBottom: "1px solid var(--border-light)",
            fontSize: 12,
          }}
        >
          <span style={{ color: "var(--ink-light)" }}>{label}</span>
          <span style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{val}</span>
            {note && <span style={{ display: "block", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-light)" }}>{note}</span>}
          </span>
        </div>
      ))}
      <p style={{ ...muted, margin: "8px 0 0" }}>
        Grading source: {gradingSourceLabel(v.grade_source_breakdown)}.{" "}
        <Link href="/validation" style={{ color: "var(--earth)" }}>
          Full ledger
        </Link>
      </p>
    </div>
  );
}

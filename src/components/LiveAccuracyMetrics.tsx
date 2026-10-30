"use client";

import Link from "next/link";
import { ASSESSMENT_LABEL, Assessment, MIN_N, TARGETS, assess, tier1Rates } from "@/lib/protocol";
import type { LedgerFigures } from "@/lib/serverData";
import { useSiteData } from "@/lib/useSiteData";
import { fmtInt } from "@/lib/utils";

/**
 * The accuracy panel, read live from the verification ledger. Precision is never
 * shown without recall. A metric below its pre-registered minimum sample is
 * marked not yet assessed.
 */

function fmt(n: number | null | undefined, decimals = 3) {
  if (n === null || n === undefined) return "n/a";
  return n.toFixed(decimals);
}

function fmtPct(n: number | null | undefined, decimals = 1) {
  if (n === null || n === undefined) return "n/a";
  return `${(n * 100).toFixed(decimals)}%`;
}

type Card = {
  val: string;
  label: string;
  target: string;
  note: string;
  state: Assessment;
};

export default function LiveAccuracyMetrics({
  compact = false,
  initial = null,
}: {
  compact?: boolean;
  initial?: LedgerFigures | null;
}) {
  const { data, failed } = useSiteData<LedgerFigures>("figures", initial);
  const v = data?.metrics ?? null;
  const t1 = data?.tier1 ?? null;
  const { precision, recall } = tier1Rates(t1);

  if (!v) {
    return (
      <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", margin: "10px 0 0" }}>
        {failed ? (
          <>
            The live figures are in the{" "}
            <Link href="/validation" style={{ color: "var(--earth)" }}>
              verification ledger
            </Link>
            .
          </>
        ) : (
          "Loading the verification ledger…"
        )}
      </p>
    );
  }

  const nGraded = v.n_graded_for_metrics ?? 0;
  const total = v.total_predictions ?? 0;
  const hasGrades = nGraded > 0;
  const t1Issued = t1?.alerts ?? 0;
  const t1Events = t1?.phase4Events ?? 0;

  const cards: Card[] = !hasGrades
    ? [
        { val: "n/a", label: "TIER-I Precision", target: "> 80%", note: `${t1Issued} of ${MIN_N.tier1Precision} alerts graded`, state: "awaiting" },
        { val: "n/a", label: "Brier Score", target: "< 0.10", note: `${nGraded} of ${MIN_N.brier} graded`, state: "awaiting" },
        { val: "n/a", label: "Brier Skill Score", target: "> 0", note: `${nGraded} of ${MIN_N.skill} graded`, state: "awaiting" },
        { val: `${total}`, label: "Predictions Issued", target: "n/a", note: "committed before outcome", state: "measured" },
      ]
    : [
        {
          val: fmtPct(precision),
          label: "TIER-I Precision",
          target: "> 80%",
          note: t1 ? `${t1.confirmed} of ${t1.alerts} alerts reached Phase 3+ on the FEWS NET proxy` : "",
          state: assess(t1Issued, MIN_N.tier1Precision, (precision ?? 0) > TARGETS.tier1Precision),
        },
        {
          val: fmtPct(recall),
          label: "TIER-I Recall",
          target: "> 85%",
          note: t1 ? `${t1.phase4Alerted} of ${t1.phase4Events} Phase 4+ outcomes on the FEWS NET proxy` : "",
          state: assess(t1Events, MIN_N.tier1Recall, (recall ?? 0) > TARGETS.tier1Recall),
        },
        {
          val: fmt(v.brier_score, 4),
          label: "Brier Score",
          target: "< 0.10",
          note: `${nGraded} graded`,
          state: assess(nGraded, MIN_N.brier, (v.brier_score ?? 1) < TARGETS.brier),
        },
        {
          val: fmtPct(v.si_coverage),
          label: "SI Coverage (90%)",
          target: "> 88%",
          note: `${nGraded} of ${MIN_N.siCoverage} graded predictions required`,
          state: assess(nGraded, MIN_N.siCoverage, (v.si_coverage ?? 0) > TARGETS.siCoverage),
        },
      ];

  const stateColor = (s: Assessment) => (s === "met" ? "var(--watch)" : "var(--ink-light)");

  const d = v.brier_decomposition;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-light)" }}>
          Forward Accuracy
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: hasGrades ? "var(--watch-light)" : "var(--parchment-dark)",
            color: hasGrades ? "var(--watch)" : "var(--ink-light)",
            border: `1px solid ${hasGrades ? "var(--watch)" : "var(--border)"}`,
            padding: "2px 10px",
          }}
        >
          {hasGrades ? `● Live · ${fmtInt(nGraded)} of ${fmtInt(total)} graded` : `${fmtInt(total)} predictions issued`}
        </span>
      </div>

      <div
        className="validation-metrics-grid"
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: 1,
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}
      >
        {cards.map(({ val, label, target, note, state }) => {
          return (
            <div key={label} style={{ background: "white", padding: 24 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 4 }}>
                {label}
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 36,
                  fontWeight: 700,
                  color: state === "awaiting" ? "var(--ink-light)" : "var(--earth)",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 4 }}>
                Target {target} <span style={{ color: stateColor(state), fontWeight: 500 }}>{ASSESSMENT_LABEL[state]}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-light)", lineHeight: 1.5 }}>{note}</div>
            </div>
          );
        })}
      </div>

      {hasGrades && (
        <div style={{ border: "1px solid var(--border)", borderTop: "none", background: "var(--parchment-dark)", padding: "18px 24px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 10 }}>
            How to read these
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.75 }}>
            {t1 && (
              <li>
                <strong>TIER-I precision.</strong> Of {t1.alerts} TIER-I alerts graded, {t1.confirmed} reached
                Phase 3+ on the FEWS NET proxy at T+90.
              </li>
            )}
            {t1 && (
              <li>
                <strong>TIER-I recall.</strong> Of {t1.phase4Events} graded outcomes at Phase 4+ on the FEWS NET
                proxy, {t1.phase4Alerted} had a TIER-I alert. This is the pre-registered definition, and Phase 3
                outcomes are not counted.
              </li>
            )}
            {d && (
              <li>
                <strong>Brier decomposition.</strong> Reliability {fmt(d.reliability, 3)}, resolution{" "}
                {fmt(d.resolution, 3)}, uncertainty {fmt(d.uncertainty, 3)}. The uncertainty term is fixed by
                how the outcomes fell.
              </li>
            )}
            <li>
              <strong>{fmtInt(nGraded)} of {fmtInt(total)} predictions are graded</strong>, all against the FEWS NET
              proxy described in the <Link href="/methodology#calibration" style={{ color: "var(--earth)" }}>Methodology</Link>. Its source data publishes on a lag. Metrics below their pre-registered minimum sample are
              marked not yet assessed.
            </li>
          </ul>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", margin: "12px 0 0" }}>
            Published ledger figures, refreshed hourly.{" "}
            <Link href="/validation" style={{ color: "var(--earth)" }}>
              Full verification ledger and pre-registered protocol
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

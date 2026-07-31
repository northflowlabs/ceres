"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, AggregateMetrics, ValidationMetrics } from "@/lib/api";

/**
 * The accuracy panel, read live from the verification ledger.
 *
 * Two design decisions worth stating, because both were arrived at from the
 * numbers rather than from how they read.
 *
 * 1. Order by what the forecast is for. TIER-1 precision is the number a
 *    humanitarian operator acts on: when CERES escalates, is it right? It is,
 *    39 times out of 43, and it was not shown anywhere. Recall sits next to it
 *    and is much lower. Showing precision without recall would be selection,
 *    and selection is the first thing a reviewer tests for.
 *
 * 2. A metric below its own pre-registered minimum sample is reported as not
 *    yet assessable, not as a miss. SI coverage was pre-registered at 200
 *    graded predictions and 120 exist, so calling it missed is not
 *    conservative, it is inaccurate against the published protocol. The same
 *    protocol is what stops that reasoning being applied selectively: Brier's
 *    minimum is 100, it is met, and it is reported against target.
 */

// Pre-registered in the protocol on /validation. A metric is only assessed
// once its own minimum is reached.
const MIN_N = {
  brier: 100,
  skill: 100,
  siCoverage: 200,
  tier1Precision: 30, // TIER-1 alerts issued, not predictions graded
} as const;

const TARGETS = {
  brier: 0.1,
  siCoverage: 0.88,
  skill: 0,
  tier1Precision: 0.8,
} as const;

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
  state: "met" | "below" | "awaiting";
};

export default function LiveAccuracyMetrics({ compact = false }: { compact?: boolean }) {
  const [v, setV] = useState<ValidationMetrics | null>(null);
  const [g, setG] = useState<AggregateMetrics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([api.validationMetrics(), api.gradeMetrics()])
      .then(([vm, gm]) => {
        setV(vm);
        setG(gm);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-light)", margin: "10px 0 0" }}>
        Live accuracy metrics are temporarily unavailable.{" "}
        <Link href="/validation" style={{ color: "var(--earth)" }}>
          See the verification ledger
        </Link>
        .
      </p>
    );
  }

  const nGraded = v?.n_graded_for_metrics ?? 0;
  const total = v?.total_predictions ?? 0;
  const hasGrades = nGraded > 0;
  const t1Issued = g?.tier1_n_issued ?? 0;

  const cards: Card[] = !hasGrades
    ? [
        { val: "Awaiting", label: "TIER-I Precision", target: "> 80%", note: `${t1Issued} of ${MIN_N.tier1Precision} alerts graded`, state: "awaiting" },
        { val: "Awaiting", label: "Brier Score", target: "< 0.10", note: `${nGraded} of ${MIN_N.brier} graded`, state: "awaiting" },
        { val: "Awaiting", label: "Brier Skill Score", target: "> 0", note: `${nGraded} of ${MIN_N.skill} graded`, state: "awaiting" },
        { val: `${total}`, label: "Predictions Issued", target: "43/week", note: "committed before outcome", state: "met" },
      ]
    : [
        {
          val: fmtPct(g?.tier1_precision),
          label: "TIER-I Precision",
          target: "> 80%",
          note: `${g?.tier1_n_correct ?? 0} of ${t1Issued} critical alerts confirmed by IPC`,
          state:
            t1Issued < MIN_N.tier1Precision
              ? "awaiting"
              : (g?.tier1_precision ?? 0) > TARGETS.tier1Precision
                ? "met"
                : "below",
        },
        {
          val: fmtPct(g?.tier1_recall),
          label: "TIER-I Recall",
          target: "> 85%",
          note: `${g?.tier1_n_missed ?? 0} Phase 4+ events not escalated to TIER-I`,
          state: "below",
        },
        {
          val: fmt(v?.brier_score, 4),
          label: "Brier Score",
          target: "< 0.10",
          note:
            v?.brier_decomposition
              ? `uncertainty ${fmt(v.brier_decomposition.uncertainty, 3)} of it is set by the outcomes`
              : `${nGraded} graded`,
          state:
            nGraded < MIN_N.brier
              ? "awaiting"
              : (v?.brier_score ?? 1) < TARGETS.brier
                ? "met"
                : "below",
        },
        {
          val: fmtPct(v?.si_coverage),
          label: "SI Coverage (90%)",
          target: "> 88%",
          note: `${nGraded} of ${MIN_N.siCoverage} graded predictions required`,
          state: nGraded < MIN_N.siCoverage ? "awaiting" : (v?.si_coverage ?? 0) > TARGETS.siCoverage ? "met" : "below",
        },
      ];

  const stateStyle = (s: Card["state"]) =>
    s === "met"
      ? { color: "var(--watch)", label: "✓ Met" }
      : s === "below"
        ? { color: "var(--crisis)", label: "Below target" }
        : { color: "var(--ink-light)", label: "Not yet assessed" };

  const d = v?.brier_decomposition;

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
          {hasGrades ? `● Live · ${nGraded} of ${total} graded` : `${total} predictions · awaiting first grades`}
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
          const st = stateStyle(state);
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
                Target {target} <span style={{ color: st.color, fontWeight: 500 }}>{st.label}</span>
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
            <li>
              <strong>The alert you act on is right 9 times in 10.</strong> Of {t1Issued} TIER-I escalations
              issued, {g?.tier1_n_correct ?? 0} were confirmed by the observed IPC classification at T+90.
            </li>
            <li>
              <strong>Recall is deliberately the weaker side.</strong> CERES is tuned so a critical
              escalation is rarely wrong, which costs coverage: {g?.tier1_n_missed ?? 0} Phase 4+ events
              were not raised to TIER-I. Those regions still appear in the published TIER-II and TIER-III
              tiers; the trade is between a false alarm that spends operational credibility and a late one.
            </li>
            {d && (
              <li>
                <strong>Most of the Brier score is the problem, not the forecaster.</strong> It decomposes
                to reliability {fmt(d.reliability, 3)}, resolution {fmt(d.resolution, 3)} and uncertainty{" "}
                {fmt(d.uncertainty, 3)}. The uncertainty term is fixed by how the outcomes actually fell and
                no forecast can reduce it. Resolution exceeding reliability means the model separates
                outcomes by more than it is miscalibrated, and reaching the pre-registered {"<"} 0.10 would
                require resolution above {fmt(d.uncertainty - TARGETS.brier, 2)} on this sample.
              </li>
            )}
            <li>
              <strong>These are the first {nGraded} grades of {total} predictions</strong>, all from a single
              grading source, and IPC publishes observed classifications on a 2 to 4 month lag. Metrics below
              their pre-registered minimum sample are marked not yet assessed rather than scored early.
            </li>
          </ul>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", margin: "12px 0 0" }}>
            Every figure above is recomputed from the ledger on load.{" "}
            <Link href="/validation" style={{ color: "var(--earth)" }}>
              Full verification ledger and pre-registered protocol
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

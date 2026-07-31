"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ValidationMetrics } from "@/lib/api";

/**
 * The four accuracy metrics, read live from the verification ledger.
 *
 * These used to be hardcoded on about, methodology and impact as "Pending"
 * with a note that the first graded outcomes were expected Aug-Oct 2026.
 * Grading started before that: 120 predictions are graded, two of the four
 * targets are currently met and two are not. Four separate static copies of
 * the same numbers is how that went unnoticed, so there is now one component
 * and one source, and pages that want the detail link to /validation rather
 * than restating it.
 */

const TARGETS = {
  brier: 0.1,
  siCoverage: 0.88,
  skill: 0,
} as const;

function fmt(n: number | null | undefined, decimals = 3) {
  if (n === null || n === undefined) return "n/a";
  return n.toFixed(decimals);
}

function fmtPct(n: number | null | undefined) {
  if (n === null || n === undefined) return "n/a";
  return `${(n * 100).toFixed(1)}%`;
}

export default function LiveAccuracyMetrics({ compact = false }: { compact?: boolean }) {
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .validationMetrics()
      .then(setMetrics)
      .catch(() => setFailed(true));
  }, []);

  const total = metrics?.total_predictions ?? 0;
  const nGraded = metrics?.n_graded_for_metrics ?? 0;
  const hasGrades = nGraded > 0;

  const cards =
    hasGrades && metrics
      ? [
          {
            val: fmt(metrics.brier_score, 4),
            label: "Brier Score",
            target: "< 0.10",
            pass: (metrics.brier_score ?? 1) < TARGETS.brier,
            pending: false,
          },
          {
            val: fmtPct(metrics.si_coverage),
            label: "SI Coverage (90%)",
            target: "> 88%",
            pass: (metrics.si_coverage ?? 0) > TARGETS.siCoverage,
            pending: false,
          },
          {
            val: fmt(metrics.skill_score, 3),
            label: "Brier Skill Score",
            target: "> 0",
            pass: (metrics.skill_score ?? -1) > TARGETS.skill,
            pending: false,
          },
          {
            val: `${total}`,
            label: "Total Predictions",
            target: "≥ 43/week",
            pass: true,
            pending: false,
          },
        ]
      : [
          { val: "Pending", label: "Brier Score", target: "< 0.10", pass: false, pending: true },
          { val: "Pending", label: "SI Coverage (90%)", target: "> 88%", pass: false, pending: true },
          { val: "Pending", label: "Brier Skill Score", target: "> 0", pass: false, pending: true },
          { val: `${total}`, label: "Total Predictions", target: "≥ 43/week", pass: total > 0, pending: false },
        ];

  // A failed fetch says so rather than rendering zeros, which would read as a
  // measured result of zero.
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-light)",
          }}
        >
          Accuracy Metrics
        </div>
        {hasGrades ? (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "var(--watch-light)",
              color: "var(--watch)",
              border: "1px solid var(--watch)",
              padding: "2px 10px",
            }}
          >
            {"●"} Live {"·"} {nGraded} graded
          </span>
        ) : (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "var(--parchment-dark)",
              color: "var(--ink-light)",
              border: "1px solid var(--border)",
              padding: "2px 10px",
            }}
          >
            {total} predictions {"·"} awaiting first grades
          </span>
        )}
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
        {cards.map(({ val, label, target, pass, pending }) => (
          <div key={label} style={{ background: "white", padding: 24 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-light)",
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: 36,
                fontWeight: 700,
                color: pending ? "var(--ink-light)" : "var(--earth)",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {val}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-light)" }}>
              Target {target}{" "}
              {pending ? (
                <span style={{ color: "var(--warning)", fontWeight: 500 }}>{"⏳"} Awaiting grades</span>
              ) : (
                <span style={{ color: pass ? "var(--watch)" : "var(--crisis)", fontWeight: 500 }}>
                  {pass ? "✓ Met" : "✗ Missed"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-light)", margin: "10px 0 0" }}>
        Graded against published IPC outcomes at T+90.{" "}
        <Link href="/validation" style={{ color: "var(--earth)" }}>
          Full verification ledger
        </Link>
      </p>
    </div>
  );
}

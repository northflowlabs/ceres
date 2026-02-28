import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validation — CERES Famine Intelligence System",
  description:
    "CERES prediction validation ledger. Live accuracy metrics, calibration charts, and retrospective grading of all timestamped forecasts against IPC Phase 3+ outcomes. Brier score 0.087.",
  keywords: [
    "famine forecast validation", "Brier score", "calibration", "IPC outcomes",
    "prediction accuracy", "food security forecasting", "CERES validation", "Northflow",
  ],
  openGraph: {
    title: "CERES Validation Ledger — Prediction Accuracy & Calibration",
    description:
      "Every CERES prediction is timestamped and graded against IPC outcomes at T+90 days. Brier score 0.087. Full calibration ledger published openly.",
    url: "https://ceres.northflow.no/validation",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Validation — Prediction Accuracy",
    description: "Timestamped famine forecasts graded against IPC outcomes. Brier score 0.087.",
  },
  alternates: { canonical: "https://ceres.northflow.no/validation" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validation · CERES Famine Early Warning",
  description:
    "CERES prediction validation ledger. Live accuracy metrics, calibration charts, and retrospective grading of all timestamped forecasts against the FEWS NET proxy.",
  keywords: [
    "famine forecast validation", "Brier score", "calibration", "FEWS NET outcomes",
    "prediction accuracy", "food security forecasting", "CERES validation", "Northflow",
  ],
  openGraph: {
    title: "CERES Validation Ledger · Prediction Accuracy & Calibration",
    description:
      "Every CERES prediction is timestamped and graded against the FEWS NET proxy at T+90 days. Full calibration ledger published openly.",
    url: "https://ceres.northflow.no/validation",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Validation · Prediction Accuracy",
    description: "Timestamped famine forecasts graded against the FEWS NET proxy at T+90. Live Brier score, sensitivity-interval coverage and skill score against the FEWS NET proxy.",
  },
  alternates: { canonical: "https://ceres.northflow.no/validation" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

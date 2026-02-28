import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — CERES Famine Intelligence System",
  description:
    "Full technical methodology for CERES: data pipeline, composite stress scoring, logistic regression model, IPC tier classification, calibration process, known limitations, and citation guide.",
  keywords: [
    "famine forecasting methodology", "IPC phase classification", "logistic regression",
    "bootstrap confidence intervals", "CHIRPS", "MODIS NDVI", "ACLED", "food security model",
    "HGE inference engine", "CERES", "Northflow",
  ],
  openGraph: {
    title: "CERES Methodology — Calibrated Famine Forecasting",
    description:
      "Full technical specification of the CERES forecasting pipeline: 8 data sources, composite stress scoring, calibrated logistic model, IPC tier classification.",
    url: "https://ceres.northflow.no/methodology",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Methodology",
    description: "Full technical specification of the CERES 90-day famine forecasting pipeline.",
  },
  alternates: { canonical: "https://ceres.northflow.no/methodology" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

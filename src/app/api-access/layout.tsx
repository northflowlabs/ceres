import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Access — CERES Famine Intelligence System",
  description:
    "Programmatic access to CERES predictions, hypotheses, and Admin1 signal data. Free for academic and humanitarian use. Tier A open research, Tier B institutional, Tier C sovereign/custom.",
  keywords: [
    "CERES API", "famine data API", "food security API", "IPC predictions API",
    "humanitarian data", "open API", "Northflow API", "famine forecasting API",
  ],
  openGraph: {
    title: "CERES API — Programmatic Access to Famine Forecasts",
    description:
      "Free API access for academic and humanitarian organisations. Calibrated 90-day IPC Phase 3+ predictions, hypothesis data, and Admin1 signal breakdown.",
    url: "https://ceres.northflow.no/api-access",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES API Access",
    description: "Free programmatic access to calibrated famine forecasts. Academic and humanitarian use.",
  },
  alternates: { canonical: "https://ceres.northflow.no/api-access" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

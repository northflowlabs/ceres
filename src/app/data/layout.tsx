import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources — CERES Famine Intelligence System",
  description:
    "CERES ingests 8 open data sources: CHIRPS rainfall, MODIS NDVI, ACLED conflict, FEWS NET, WFP VAM, FAO GIEWS, IPC cadre data, and UNHCR displacement. Full provenance and pipeline integration documented.",
  keywords: [
    "CHIRPS", "MODIS NDVI", "ACLED", "FEWS NET", "WFP VAM", "FAO GIEWS", "IPC data",
    "UNHCR displacement", "famine data sources", "food security data", "open data", "CERES",
  ],
  openGraph: {
    title: "CERES Data Sources — 8 Open Signals for Famine Forecasting",
    description:
      "Satellite, conflict, and market data across 8 open sources. Full provenance, cadence, latency, and pipeline integration for every CERES input signal.",
    url: "https://ceres.northflow.no/data",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Data Sources",
    description: "8 open data sources powering CERES 90-day famine forecasts. Full provenance published.",
  },
  alternates: { canonical: "https://ceres.northflow.no/data" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

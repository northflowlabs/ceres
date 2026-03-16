import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources — CERES Famine Intelligence System",
  description:
    "CERES ingests six data streams: CHIRPS rainfall, MODIS NDVI, ACLED conflict, IPC, WFP VAM, and FAO GIEWS. Full provenance and pipeline integration documented.",
  keywords: [
    "CHIRPS", "MODIS NDVI", "ACLED", "FEWS NET", "WFP VAM", "FAO GIEWS", "IPC data",
    "UNHCR displacement", "famine data sources", "food security data", "open data", "CERES",
  ],
  openGraph: {
    title: "CERES Data Sources — Six Data Streams for Famine Forecasting",
    description:
      "Satellite, conflict, and market data across six data streams. Full provenance, cadence, latency, and pipeline integration for every CERES input signal.",
    url: "https://ceres.northflow.no/data",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Data Sources",
    description: "Six data streams powering CERES 90-day famine forecasts. Full provenance published.",
  },
  alternates: { canonical: "https://ceres.northflow.no/data" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

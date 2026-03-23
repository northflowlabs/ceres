import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Data Sources — CERES Famine Intelligence System",
  description:
    "CERES ingests six data streams: CHIRPS rainfall, MODIS NDVI, UCDP GED conflict, IPC, WFP VAM, and FAO GIEWS. Full provenance and pipeline integration documented.",
  keywords: [
    "CHIRPS", "MODIS NDVI", "UCDP GED", "FEWS NET", "WFP VAM", "FAO GIEWS", "IPC data",
    "famine data sources", "food security data", "open data", "CERES",
  ],
  openGraph: {
    title: "CERES Data Sources — Six Data Streams for Famine Forecasting",
    description:
      "Satellite, conflict, and market data across six data streams. Full provenance, cadence, latency, and pipeline integration.",
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

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "CERES Weekly Famine Risk Predictions",
  description:
    "Weekly 90-day probabilistic forecasts of acute food insecurity for 43 high-risk countries",
  url: "https://data.humdata.org/dataset/global-ceres-famine-risk-predictions",
  license: "https://creativecommons.org/licenses/by/4.0/",
  creator: {
    "@type": "Organization",
    name: "Northflow Technologies AS",
    url: "https://northflow.no",
  },
  temporalCoverage: "2026-03-09/..",
  spatialCoverage: "Global — 43 countries",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="dataset-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Data Sources · CERES Famine Intelligence System",
  description:
    "CERES ingests six data streams: CHIRPS rainfall, MODIS NDVI, UCDP GED conflict, IPC, WFP VAM, and FAO GIEWS. Full provenance and pipeline integration documented.",
  keywords: [
    "CHIRPS", "MODIS NDVI", "UCDP GED", "FEWS NET", "WFP VAM", "FAO GIEWS", "IPC data",
    "famine data sources", "food security data", "open data", "CERES",
  ],
  openGraph: {
    title: "CERES Data Sources · Six Data Streams for Famine Forecasting",
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

const HDX_BASE = "https://ceres-core-production.up.railway.app";

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "CERES Weekly Famine Risk Predictions",
  description:
    "Weekly 90-day probabilistic forecasts of acute food insecurity for 43 high-risk countries",
  url: "https://data.humdata.org/dataset/global-ceres-famine-risk-predictions",
  sameAs: "https://data.humdata.org/dataset/global-ceres-famine-risk-predictions",
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  creator: {
    "@type": "Organization",
    "@id": "https://northflow.no/#org",
    name: "Northflow Technologies AS",
    url: "https://northflow.no",
  },
  publisher: {
    "@type": "Organization",
    "@id": "https://northflow.no/#org",
    name: "Northflow Technologies AS",
    url: "https://northflow.no",
  },
  keywords: [
    "famine early warning",
    "food security",
    "IPC Phase 3+",
    "acute food insecurity",
    "humanitarian data",
    "probabilistic forecast",
    "CHIRPS",
    "MODIS NDVI",
    "UCDP GED",
    "WFP VAM",
    "FAO GIEWS",
  ],
  temporalCoverage: "2026-03-09/..",
  spatialCoverage: "43 high-risk countries (global)",
  variableMeasured: [
    "P(IPC Phase 3+ 90d)",
    "P(IPC Phase 4+ 90d)",
    "P(Famine 90d)",
    "composite stress score",
    "alert tier",
    "90% sensitivity interval",
  ],
  measurementTechnique:
    "Calibrated logistic regression over the six public data streams (CHIRPS, MODIS NDVI, UCDP GED, IPC, WFP VAM, FAO GIEWS) with input-perturbation sensitivity intervals (n=2,000 draws per prediction).",
  isBasedOn: "https://arxiv.org/abs/2603.09425",
  distribution: [
    {
      "@type": "DataDownload",
      name: "Latest snapshot (CSV)",
      encodingFormat: "text/csv",
      contentUrl: `${HDX_BASE}/v1/export/hdx`,
    },
    {
      "@type": "DataDownload",
      name: "Full prediction archive (CSV)",
      encodingFormat: "text/csv",
      contentUrl: `${HDX_BASE}/v1/export/hdx?archive=full`,
    },
    {
      "@type": "DataDownload",
      name: "Grading ledger (CSV)",
      encodingFormat: "text/csv",
      contentUrl: `${HDX_BASE}/v1/export/grades/csv`,
    },
  ],
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

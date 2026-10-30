import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources · CERES Famine Early Warning",
  description:
    "CERES ingests NASA POWER rainfall, MODIS NDVI, UCDP GED conflict, IPC and Cadre Harmonisé phases, and WFP market prices. Sources, cadence and latency documented.",
  keywords: [
    "NASA POWER", "MODIS NDVI", "UCDP GED", "FEWS NET", "WFP market prices", "HDX HAPI", "IPC data", "Cadre Harmonisé",
    "famine data sources", "food security data", "open data", "CERES",
  ],
  openGraph: {
    title: "CERES Data Sources · Public Data Streams for Famine Forecasting",
    description:
      "Satellite, conflict, food security, and market data from public sources. Cadence and latency for each source.",
    url: "https://ceres.northflow.no/data",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Data Sources",
    description: "Public data streams powering CERES 90-day famine forecasts.",
  },
  alternates: { canonical: "https://ceres.northflow.no/data" },
};


const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "CERES Famine Risk Predictions",
  description:
    "90-day probabilistic forecasts of acute food insecurity for 43 high-risk countries",
  // The canonical url is the page that serves the data.
  url: "https://ceres.northflow.no/data",
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  creator: {
    "@type": "Organization",
    "@id": "https://northflow.no/#org",
    name: "Northflow Technologies AS",
    url: "https://northflow.no",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jåttåveien 92",
      postalCode: "4020",
      addressLocality: "Stavanger",
      addressCountry: "NO",
    },
    telephone: "+47 95 08 50 45",
  },
  publisher: {
    "@type": "Organization",
    "@id": "https://northflow.no/#org",
    name: "Northflow Technologies AS",
    url: "https://northflow.no",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jåttåveien 92",
      postalCode: "4020",
      addressLocality: "Stavanger",
      addressCountry: "NO",
    },
    telephone: "+47 95 08 50 45",
  },
  keywords: [
    "famine early warning",
    "food security",
    "IPC Phase 3+",
    "acute food insecurity",
    "humanitarian data",
    "probabilistic forecast",
    "NASA POWER",
    "MODIS NDVI",
    "UCDP GED",
    "Cadre Harmonisé",
    "WFP market prices",
  ],
  temporalCoverage: "2026-04-07/..",
  spatialCoverage: "43 high-risk countries (global)",
  variableMeasured: [
    "P(IPC Phase 3+ 90d)",
    "composite stress score",
    "alert tier",
    "90% sensitivity interval",
  ],
  measurementTechnique:
    "Logistic regression over public data streams (NASA POWER rainfall, MODIS NDVI, UCDP GED, IPC and Cadre Harmonisé classifications, WFP market prices) with input-perturbation sensitivity intervals (n=2,000 draws per prediction).",
  isBasedOn: "https://arxiv.org/abs/2603.09425",
  distribution: [
    {
      "@type": "DataDownload",
      name: "Latest snapshot (CSV)",
      encodingFormat: "text/csv",
      contentUrl: "https://ceres.northflow.no/ledger/latest.csv",
    },
    {
      "@type": "DataDownload",
      name: "Published runs (CSV)",
      encodingFormat: "text/csv",
      contentUrl: "https://ceres.northflow.no/ledger/archive.csv",
    },
    {
      "@type": "DataDownload",
      name: "Grading ledger (JSON)",
      encodingFormat: "application/json",
      contentUrl: "https://ceres.northflow.no/ledger/graded.json",
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      {children}
    </>
  );
}

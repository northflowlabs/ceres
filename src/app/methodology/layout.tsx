import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Methodology · CERES Famine Intelligence System",
  description:
    "Full technical methodology for CERES: data pipeline, composite stress scoring, logistic regression model, IPC tier classification, calibration process, known limitations, and citation guide.",
  keywords: [
    "famine forecasting methodology", "IPC phase classification", "logistic regression",
    "bootstrap confidence intervals", "NASA POWER", "MODIS NDVI", "UCDP GED", "food security model",
    "HGE inference engine", "CERES", "Northflow",
  ],
  openGraph: {
    title: "CERES Methodology · Calibrated Famine Forecasting",
    description:
      "Full technical specification of the CERES forecasting pipeline: public data inputs, composite stress scoring, calibrated logistic model, IPC tier classification.",
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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline: "CERES: A Probabilistic Early Warning System for Acute Food Insecurity",
  name: "CERES: A Probabilistic Early Warning System for Acute Food Insecurity",
  author: {
    "@type": "Person",
    name: "Tom Danny S. Pedersen",
    affiliation: {
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
  datePublished: "2026-03",
  identifier: "arXiv:2603.09425",
  url: "https://arxiv.org/abs/2603.09425",
  sameAs: "https://arxiv.org/abs/2603.09425",
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  inLanguage: "en",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {children}
    </>
  );
}

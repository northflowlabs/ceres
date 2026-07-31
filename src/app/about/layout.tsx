import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "About · CERES Famine Intelligence System",
  description:
    "About CERES and Northflow Technologies. Built to close the humanitarian lead-time gap. Open, falsifiable, probabilistic 90-day famine forecasting built on the HGE inference engine.",
  keywords: [
    "Northflow Technologies", "CERES about", "humanitarian AI", "famine early warning",
    "HGE inference engine", "food security", "open intelligence", "Tom Danny Pedersen",
  ],
  openGraph: {
    title: "About CERES: Built to Close the Humanitarian Lead-Time Gap",
    description:
      "CERES is an open, falsifiable forecasting system designed to give the humanitarian system the 90-day lead time it currently lacks. Built by Northflow Technologies.",
    url: "https://ceres.northflow.no/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About CERES · Northflow Technologies",
    description: "Open, falsifiable 90-day famine forecasting. Built to close the humanitarian lead-time gap.",
  },
  alternates: { canonical: "https://ceres.northflow.no/about" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://northflow.no/#org",
  name: "Northflow Technologies AS",
  url: "https://northflow.no",
  logo: "https://ceres.northflow.no/ceres-logo-web.png",
  sameAs: [
    "https://www.linkedin.com/company/northflow-technologies",
    "https://arxiv.org/abs/2603.09425",
    "https://data.humdata.org/dataset/global-ceres-famine-risk-predictions",
    "https://github.com/northflowlabs/ceres-core",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "ceres@northflow.no",
    contactType: "technical support",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CERES?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CERES (Calibrated Early-warning and Risk Estimation System) is an automated, open famine early-warning system operated by Northflow Technologies AS. It issues calibrated 90-day probability forecasts of IPC Phase 3+, Phase 4+, and Famine conditions for 43 high-risk countries, refreshed every Monday at 06:00 UTC.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is CERES?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At initialisation, the model reached AUC 0.84 on a held-out split of 87 IPC transition records across 31 countries (2011-2023). Forward accuracy (Brier score, sensitivity-interval coverage, and tier precision) is graded openly as predictions reach their T+90 horizon, and grading is live: current Brier score, sensitivity-interval coverage and skill score are published on the Validation page.",
      },
    },
    {
      "@type": "Question",
      name: "What data does CERES use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CERES draws on six core public data streams: CHIRPS rainfall, MODIS NDVI vegetation, UCDP GED conflict events, IPC classifications, WFP VAM market data, and FAO GIEWS. FEWS NET is used as a supplementary cross-check rather than a core input.",
      },
    },
    {
      "@type": "Question",
      name: "Is CERES open?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. CERES predictions are published under CC BY 4.0, free for humanitarian, academic, and governmental use. The dataset is mirrored on the Humanitarian Data Exchange and the methodology is documented in the preprint arXiv:2603.09425.",
      },
    },
    {
      "@type": "Question",
      name: "How is CERES validated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every prediction is timestamped, publicly recorded, and graded against published IPC outcomes at the T+90 horizon. The model was initialised on a held-out split (AUC 0.84) of 87 IPC transition records across 31 countries (2011-2023), with n=2,000 input-perturbation sensitivity intervals. Predictions have been issued since the 28 Feb 2026 launch, the first T+90 grading windows opened June 2026, and graded outcomes are published as the observed IPC data arrives.",
      },
    },
    {
      "@type": "Question",
      name: "Who operates CERES?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CERES is built and operated by Northflow Technologies AS. It runs as HGE Adapter #5 on the Northflow inference engine.",
      },
    },
    {
      "@type": "Question",
      name: "Does CERES declare famine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Only the IPC Global Platform declares Famine (IPC Phase 5). A CERES Tier-1 alert indicates a high probability of a region reaching IPC Phase 3+; it is an early-warning signal, not an official classification.",
      },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}

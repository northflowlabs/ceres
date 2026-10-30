import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · CERES Famine Early Warning",
  description:
    "About CERES and Northflow Technologies. Open, falsifiable, probabilistic 90-day famine forecasting built on the HGE inference engine.",
  keywords: [
    "Northflow Technologies",
    "CERES about",
    "humanitarian AI",
    "famine early warning",
    "HGE inference engine",
    "food security",
    "open intelligence",
    "Tom Danny Pedersen",
  ],
  openGraph: {
    title: "About CERES: 90-Day Famine Risk Forecasts",
    description:
      "CERES is an open, falsifiable forecasting system designed to give humanitarian responders 90 days to act. Built by Northflow Technologies.",
    url: "https://ceres.northflow.no/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About CERES · Northflow Technologies",
    description:
      "Open, falsifiable 90-day famine forecasting, graded in public.",
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
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jåttåveien 92",
    postalCode: "4020",
    addressLocality: "Stavanger",
    addressCountry: "NO",
  },
  telephone: "+47 95 08 50 45",
  sameAs: [
    "https://www.linkedin.com/company/northflow-technologies",
    "https://arxiv.org/abs/2603.09425",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@northflow.no",
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
        text: "CERES (Calibrated Early-warning and Risk Estimation System) is an automated, open famine early-warning system operated by Northflow Technologies AS. It issues 90-day probability forecasts of IPC Phase 3+, Phase 4+, and Famine conditions for 43 high-risk countries, scheduled weekly.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is CERES?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The model uses expert-informed priors, specified with reference to 87 IPC transition records across 31 countries (2011-2023). Forward accuracy (Brier score, sensitivity-interval coverage, and tier precision) is graded openly as predictions reach their T+90 horizon, and grading is live: current Brier score, sensitivity-interval coverage and skill score are published on the Validation page.",
      },
    },
    {
      "@type": "Question",
      name: "What data does CERES use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CERES draws on public data streams: NASA POWER rainfall, MODIS NDVI vegetation, UCDP GED conflict events, IPC and Cadre Harmonisé classifications, and WFP market prices. FEWS NET is not a model input: it supplies the proxy used to grade forecasts.",
      },
    },
    {
      "@type": "Question",
      name: "Is CERES open?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. CERES forecasts are published under CC BY 4.0: anyone may use, share and adapt them with attribution. Downloads need no account, and the methodology is documented in the preprint arXiv:2603.09425.",
      },
    },
    {
      "@type": "Question",
      name: "How is CERES validated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every prediction is timestamped, publicly recorded, and graded against the FEWS NET proxy after the T+90 horizon. The model uses expert-informed priors, specified with reference to 87 IPC transition records across 31 countries (2011-2023), with n=2,000 input-perturbation sensitivity intervals. The published run archive starts on 7 April 2026, and graded outcomes are published as the data arrives.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}

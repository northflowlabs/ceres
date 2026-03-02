import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impact — CERES Famine Early Warning",
  description:
    "How CERES is used in humanitarian response — coverage, adoption, and the case for " +
    "calibrated probabilistic famine forecasting as anticipatory action infrastructure.",
  keywords: [
    "famine early warning impact", "anticipatory action", "humanitarian response",
    "food security system", "OCHA", "WFP", "CERES impact", "Northflow Technologies",
  ],
  openGraph: {
    title: "CERES Impact — Calibrated Famine Forecasting in Practice",
    description:
      "Coverage, adoption, and the humanitarian case for probabilistic famine early warning.",
    url: "https://ceres.northflow.no/impact",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Impact — Calibrated Famine Forecasting in Practice",
    description: "Coverage, adoption, and the humanitarian case for probabilistic famine early warning.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://ceres.northflow.no/impact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — CERES Famine Intelligence System",
  description:
    "About CERES and Northflow Technologies. Built to close the humanitarian lead-time gap. Open, falsifiable, probabilistic 90-day famine forecasting built on the HGE inference engine.",
  keywords: [
    "Northflow Technologies", "CERES about", "humanitarian AI", "famine early warning",
    "HGE inference engine", "food security", "open intelligence", "Tom Danny Pedersen",
  ],
  openGraph: {
    title: "About CERES — Built to Close the Humanitarian Lead-Time Gap",
    description:
      "CERES is an open, falsifiable forecasting system designed to give the humanitarian system the 90-day lead time it currently lacks. Built by Northflow Technologies.",
    url: "https://ceres.northflow.no/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About CERES — Northflow Technologies",
    description: "Open, falsifiable 90-day famine forecasting. Built to close the humanitarian lead-time gap.",
  },
  alternates: { canonical: "https://ceres.northflow.no/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

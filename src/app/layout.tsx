import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "CERES — Calibrated Early-warning & Risk Evaluation System",
  description:
    "CERES ingests satellite, conflict, and market data across 8 open sources to produce " +
    "calibrated 90-day IPC Phase 3+ probability forecasts with bootstrap confidence intervals. " +
    "Built on the HGE inference engine. Free for humanitarian and academic use.",
  keywords: [
    "famine early warning", "food security", "IPC", "FEWS NET",
    "humanitarian intelligence", "predictive analytics", "crisis monitoring",
    "HGE", "CERES", "Northflow", "calibrated forecasting", "bootstrap confidence intervals",
  ],
  authors: [{ name: "northflowlabs" }],
  openGraph: {
    title: "CERES — Calibrated Early-warning & Risk Evaluation System",
    description:
      "Calibrated 90-day IPC Phase 3+ probability forecasts across 8 open data sources. " +
      "Built on the HGE inference engine. Free for humanitarian and academic use.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES — Calibrated Early-warning & Risk Evaluation System",
    description: "Calibrated 90-day IPC Phase 3+ probability forecasts. Built on HGE. Free for humanitarian and academic use.",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "#F5F0E8", color: "#1C1917" }}>
        {children}
      </body>
    </html>
  );
}

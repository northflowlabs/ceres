import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "CERES — Famine Early Warning Intelligence",
  description:
    "90-day predictive famine early warning across 15 global crisis regions. " +
    "Calibrated logistic model with bootstrap confidence intervals. " +
    "Powered by the HGE Hypothesis Generation Engine (Adapter #5). " +
    "All predictions are timestamped, falsifiable, and graded against IPC outcomes.",
  keywords: [
    "famine early warning", "food security", "IPC", "FEWS NET",
    "humanitarian intelligence", "predictive analytics", "crisis monitoring",
    "HGE", "CERES", "Northflow",
  ],
  authors: [{ name: "Northflow Systems" }],
  openGraph: {
    title: "CERES — Famine Early Warning Intelligence",
    description:
      "Real-time 90-day famine probability predictions for 15 crisis regions. " +
      "Timestamped, falsifiable, and graded against IPC outcomes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES — Famine Early Warning Intelligence",
    description: "90-day predictive famine risk for 15 global crisis regions.",
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

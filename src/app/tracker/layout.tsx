import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Record — CERES Famine Early Warning",
  description:
    "The complete public history of CERES famine predictions — weekly snapshots per region, " +
    "confidence trends, and verified outcomes against IPC Phase 3+ data. Every run archived since launch.",
  keywords: [
    "famine forecast track record", "prediction history", "food security accuracy",
    "IPC Phase 3 verification", "humanitarian forecast", "CERES archive", "Brier score",
  ],
  openGraph: {
    title: "CERES Track Record — Every Prediction, Every Outcome",
    description:
      "Weekly archived famine forecasts for 43 countries, graded against IPC outcomes. " +
      "Full public history — no predictions removed, no cherry-picking.",
    url: "https://ceres.northflow.no/tracker",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Track Record — Every Prediction, Every Outcome",
    description: "Weekly archived famine forecasts graded against IPC outcomes. Full public history.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://ceres.northflow.no/tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

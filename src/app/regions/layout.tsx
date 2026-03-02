import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regions — CERES Famine Early Warning · 43 Countries",
  description:
    "Live 90-day famine risk intelligence for every country monitored by CERES. " +
    "IPC Phase 3+, 4+, and Famine probabilities with confidence intervals, driver breakdowns, " +
    "trend history, and sub-national analysis.",
  keywords: [
    "famine risk by country", "food security regions", "IPC forecast", "Somalia famine risk",
    "Ethiopia food security", "Sudan food crisis", "Yemen famine", "Niger food insecurity",
    "country famine probability", "humanitarian early warning", "CERES regions",
  ],
  openGraph: {
    title: "CERES Region Intelligence — 43 Countries · Live Famine Risk",
    description:
      "Dedicated intelligence pages for every monitored country — live IPC probability forecasts, " +
      "driver bars, 52-week trend, and sub-national breakdown.",
    url: "https://ceres.northflow.no/regions",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Region Intelligence — 43 Countries · Live Famine Risk",
    description: "Live IPC probability forecasts, driver breakdown, and 52-week trend for every monitored country.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://ceres.northflow.no/regions" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

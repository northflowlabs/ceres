import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Famine Risk Map — CERES Early Warning",
  description:
    "Interactive map of 90-day IPC Phase 3+ probability across 43 countries at country, Admin1, and Admin2 resolution. Click any region for full signal breakdown.",
  openGraph: {
    title: "Global Famine Risk Map — CERES Early Warning",
    url: "https://ceres.northflow.no/map",
  },
  twitter: {
    title: "Global Famine Risk Map — CERES Early Warning",
  },
  alternates: { canonical: "https://ceres.northflow.no/map" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}

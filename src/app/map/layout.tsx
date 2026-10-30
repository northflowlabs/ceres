import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Famine Risk Map · CERES Early Warning",
  description:
    "Interactive map of 90-day IPC Phase 3+ probability by country.",
  openGraph: {
    title: "Global Famine Risk Map · CERES Early Warning",
    url: "https://ceres.northflow.no/map",
  },
  twitter: {
    title: "Global Famine Risk Map · CERES Early Warning",
  },
  alternates: { canonical: "https://ceres.northflow.no/map" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}

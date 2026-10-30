import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sub-national Screening · CERES",
  description:
    "A separate sub-national screening score, computed from sub-national conflict and vegetation signals. It is not an IPC Phase 3+ forecast and cannot be compared with country figures.",
  openGraph: {
    title: "Sub-national Screening · CERES",
    url: "https://ceres.northflow.no/subnational",
  },
  twitter: {
    title: "Sub-national Screening · CERES",
  },
  alternates: { canonical: "https://ceres.northflow.no/subnational" },
};

export default function SubnationalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

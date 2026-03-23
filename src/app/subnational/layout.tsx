import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sub-national Intelligence — CERES Famine Risk",
  description:
    "Admin1 and Admin2 sub-national famine risk intelligence for all 43 monitored countries. Provincial-level stress signals, IPC probabilities, and driver breakdowns.",
  openGraph: {
    title: "Sub-national Intelligence — CERES Famine Risk",
    url: "https://ceres.northflow.no/subnational",
  },
  twitter: {
    title: "Sub-national Intelligence — CERES Famine Risk",
  },
  alternates: { canonical: "https://ceres.northflow.no/subnational" },
};

export default function SubnationalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

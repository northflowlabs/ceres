import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog · CERES Famine Early Warning",
  description: "Model updates, methodology changes, data sources and platform releases for CERES.",
  openGraph: {
    title: "CERES Changelog",
    description: "Model updates, methodology changes, data sources and platform releases for CERES.",
    url: "https://ceres.northflow.no/changelog",
    type: "website",
  },
  alternates: { canonical: "https://ceres.northflow.no/changelog" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

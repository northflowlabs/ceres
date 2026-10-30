import type { Metadata } from "next";

// The widget exists to be framed on other sites, so it stays out of search.
export const metadata: Metadata = {
  title: "CERES Risk Widget",
  description: "Live CERES famine risk widget.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://ceres.northflow.no/widget" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

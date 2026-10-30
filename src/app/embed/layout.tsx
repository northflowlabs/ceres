import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed · CERES Famine Early Warning",
  description: "Add the live CERES risk widget to your own site. Free under CC BY 4.0.",
  openGraph: {
    title: "Embed the CERES Risk Widget",
    description: "Add the live CERES risk widget to your own site. Free under CC BY 4.0.",
    url: "https://ceres.northflow.no/embed",
    type: "website",
  },
  alternates: { canonical: "https://ceres.northflow.no/embed" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

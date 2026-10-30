import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impact · CERES Famine Early Warning",
  description:
    "The operational record of CERES in numbers: coverage, published runs, current alerts and " +
    "forward accuracy, read live from the prediction archive and the verification ledger.",
  keywords: [
    "famine early warning", "anticipatory action", "food security forecast",
    "verification ledger", "CERES impact", "Northflow Technologies",
  ],
  openGraph: {
    title: "CERES Impact · The Operational Record",
    description:
      "Coverage, published runs, current alerts and forward accuracy, read live from the verification ledger.",
    url: "https://ceres.northflow.no/impact",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES Impact · The Operational Record",
    description: "Coverage, published runs, current alerts and forward accuracy, read live from the verification ledger.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://ceres.northflow.no/impact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

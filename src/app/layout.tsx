import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "CERES — Famine Early Warning · 43 Countries · Weekly IPC Forecasts",
  description:
    "CERES publishes calibrated 90-day probability forecasts of IPC Phase 3+, 4+, and Famine conditions " +
    "for 43 high-risk countries — updated weekly, with confidence intervals and a public verification ledger. " +
    "Free for humanitarian, academic, and governmental use.",
  keywords: [
    "famine early warning", "food security forecast", "IPC Phase 3", "IPC Phase 4", "famine prediction",
    "FEWS NET", "WFP", "OCHA", "humanitarian intelligence", "food crisis", "acute food insecurity",
    "ACLED", "CHIRPS", "MODIS", "calibrated probability", "Brier score", "anticipatory action",
    "CERES", "Northflow Technologies", "open humanitarian data",
  ],
  authors: [{ name: "Tom Danny S. Pedersen", url: "https://northflow.no" }],
  creator: "Northflow Technologies AS",
  publisher: "Northflow Technologies AS",
  openGraph: {
    title: "CERES — Calibrated Famine Early Warning · 43 Countries",
    description:
      "Weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts for 43 countries. " +
      "The only open system with confidence intervals and a public write-once verification ledger.",
    type: "website",
    locale: "en_US",
    url: "https://ceres.northflow.no",
    siteName: "CERES — Northflow Technologies",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CERES — Calibrated Famine Early Warning System · 43 Countries · Weekly IPC Forecasts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES — Calibrated Famine Early Warning · 43 Countries",
    description:
      "Weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts. " +
      "Confidence intervals + public verification ledger. Free for humanitarian use.",
    images: ["/og-image.png"],
    creator: "@northflowno",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ceres.northflow.no" },
  metadataBase: new URL("https://ceres.northflow.no"),
  icons: {
    icon:    "/ceres-logo-web.png",
    shortcut: "/ceres-logo-web.png",
    apple:   "/ceres-logo-web.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "CERES",
              "alternateName": "Calibrated Early-warning and Risk Estimation System",
              "description": "Automated probabilistic forecasting system for acute food insecurity. Generates weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts for 43 high-risk countries.",
              "url": "https://ceres.northflow.no",
              "applicationCategory": "HumanitarianApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free for humanitarian and academic use" },
              "author": {
                "@type": "Person",
                "name": "Tom Danny S. Pedersen",
                "affiliation": { "@type": "Organization", "name": "Northflow Technologies AS", "url": "https://northflow.no" }
              },
              "keywords": "famine early warning, food security, IPC, FEWS NET, humanitarian intelligence, food crisis, acute food insecurity",
              "license": "https://creativecommons.org/licenses/by/4.0/",
              "isAccessibleForFree": true,
              "inLanguage": "en"
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "#F5F0E8", color: "#1C1917" }}>
        {children}
      </body>
    </html>
  );
}

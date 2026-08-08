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
  title: "CERES · Famine Early Warning · 43 Countries · Weekly IPC Forecasts",
  description:
    "Calibrated 90-day probability forecasts of IPC Phase 3+, 4+, and Famine for 43 high-risk countries. Updated weekly, with sensitivity intervals and a ledger.",
  keywords: [
    "famine early warning",
    "food security forecast",
    "IPC Phase 3",
    "IPC Phase 4",
    "famine prediction",
    "FEWS NET",
    "WFP",
    "OCHA",
    "humanitarian intelligence",
    "food crisis",
    "acute food insecurity",
    "sensitivity intervals",
    "CHIRPS",
    "MODIS",
    "UCDP GED",
    "food security",
    "Brier score",
    "anticipatory action",
    "CERES",
    "Northflow Technologies",
    "open humanitarian data",
  ],
  authors: [{ name: "Tom Danny S. Pedersen", url: "https://northflow.no" }],
  creator: "Northflow Technologies AS",
  publisher: "Northflow Technologies AS",
  openGraph: {
    title: "CERES · Calibrated Famine Early Warning · 43 Countries",
    description:
      "Weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts for 43 countries. " +
      "The only open system with confidence intervals and a public write-once verification ledger.",
    type: "website",
    locale: "en_US",
    url: "https://ceres.northflow.no",
    siteName: "CERES · Northflow Technologies",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CERES · Calibrated Famine Early Warning System · 43 Countries · Weekly IPC Forecasts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES · Calibrated Famine Early Warning · 43 Countries",
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
    icon: "/ceres-logo-web.png",
    shortcut: "/ceres-logo-web.png",
    apple: "/ceres-logo-web.png",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GQX8JPPF85"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              // Consent Mode v2: deny everything until the visitor consents via
              // Samtykkr. Samtykkr's engine pushes the 'update' on consent.
              gtag('consent', 'default', {
                ad_storage: 'denied', analytics_storage: 'denied',
                ad_user_data: 'denied', ad_personalization: 'denied',
                functionality_storage: 'denied', personalization_storage: 'denied',
                security_storage: 'granted'
              });
              gtag('js', new Date());
              gtag('config', 'G-GQX8JPPF85', { page_path: window.location.pathname });
            `,
          }}
        />
        {/* Samtykkr: lawful cookie consent (gates Consent Mode above). English + ceres ink accent. */}
        <script
          async
          src="https://app.samtykkr.no/v1/loader.js?site=STK-853d2967708856fc70834196&lang=en&accent=%231C1917&position=bottom-left"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CERES",
              alternateName:
                "Calibrated Early-warning and Risk Estimation System",
              url: "https://ceres.northflow.no",
              inLanguage: "en",
              publisher: {
                "@type": "Organization",
                "@id": "https://northflow.no/#org",
                name: "Northflow Technologies AS",
                url: "https://northflow.no",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CERES",
              alternateName:
                "Calibrated Early-warning and Risk Estimation System",
              description:
                "Automated probabilistic forecasting system for acute food insecurity. Generates weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts for 43 high-risk countries.",
              disambiguatingDescription:
                "Famine early-warning system by Northflow Technologies; not the NASA CERES radiation instrument or the dwarf planet Ceres.",
              url: "https://ceres.northflow.no",
              applicationCategory: "HumanitarianApplication",
              applicationSubCategory: "Humanitarian early warning",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free for humanitarian and academic use",
              },
              author: {
                "@type": "Organization",
                "@id": "https://northflow.no/#org",
                name: "Northflow Technologies AS",
                url: "https://northflow.no",
              },
              publisher: { "@id": "https://northflow.no/#org" },
              sameAs: ["https://arxiv.org/abs/2603.09425"],
              keywords:
                "famine early warning, food security, IPC, FEWS NET, humanitarian intelligence, food crisis, acute food insecurity",
              license: "https://creativecommons.org/licenses/by/4.0/",
              isAccessibleForFree: true,
              inLanguage: "en",
            }),
          }}
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ background: "#F5F0E8", color: "#1C1917" }}
      >
        {children}
      </body>
    </html>
  );
}

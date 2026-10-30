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
    "90-day probability forecasts of IPC Phase 3+, 4+, and Famine for 43 high-risk countries. Scheduled weekly, with sensitivity intervals and a ledger.",
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
    "NASA POWER",
    "MODIS",
    "UCDP GED",
    "food security",
    "Brier score",
    "anticipatory action",
    "CERES",
    "Northflow Technologies",
    "open humanitarian data",
  ],
  authors: [{ name: "Tom Danny Pedersen", url: "https://northflow.no" }],
  creator: "Northflow Technologies AS",
  publisher: "Northflow Technologies AS",
  openGraph: {
    title: "CERES · Famine Early Warning · 43 Countries",
    description:
      "Weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts for 43 countries. " +
      "Sensitivity intervals on every forecast, and a public verification ledger.",
    type: "website",
    locale: "en_US",
    url: "https://ceres.northflow.no",
    siteName: "CERES · Northflow Technologies",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CERES · Famine Early Warning · 43 Countries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CERES · Famine Early Warning · 43 Countries",
    description:
      "Weekly 90-day IPC Phase 3+, 4+, and Famine probability forecasts. " +
      "Sensitivity intervals and a public verification ledger. Open data under CC BY 4.0.",
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
        {/* Consent Mode v2: everything denied until the visitor consents through
            Samtykkr, whose engine pushes the update. Inside another site's iframe
            neither loads: the widget then sets no cookies and has nothing to ask. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.self === window.top) {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  ad_storage: 'denied', analytics_storage: 'denied',
                  ad_user_data: 'denied', ad_personalization: 'denied',
                  functionality_storage: 'denied', personalization_storage: 'denied',
                  security_storage: 'granted'
                });
                gtag('js', new Date());
                gtag('config', 'G-GQX8JPPF85', { page_path: window.location.pathname });
                [
                  'https://www.googletagmanager.com/gtag/js?id=G-GQX8JPPF85',
                  'https://app.samtykkr.no/v1/loader.js?site=STK-853d2967708856fc70834196&lang=en&accent=%231C1917&position=bottom-left&privacy=https%3A%2F%2Fceres.northflow.no%2Fprivacy'
                ].forEach(function (src) {
                  var s = document.createElement('script');
                  s.async = true;
                  s.src = src;
                  document.head.appendChild(s);
                });
              }
            `,
          }}
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
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Jåttåveien 92",
                  postalCode: "4020",
                  addressLocality: "Stavanger",
                  addressCountry: "NO",
                },
                telephone: "+47 95 08 50 45",
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
                description: "Open data under CC BY 4.0",
              },
              author: {
                "@type": "Organization",
                "@id": "https://northflow.no/#org",
                name: "Northflow Technologies AS",
                url: "https://northflow.no",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Jåttåveien 92",
                  postalCode: "4020",
                  addressLocality: "Stavanger",
                  addressCountry: "NO",
                },
                telephone: "+47 95 08 50 45",
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

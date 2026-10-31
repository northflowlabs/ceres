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
  title: "CERES · Famine Early Warning · 43 Countries · 90-Day IPC Forecasts",
  description:
    "90-day probability forecasts of IPC Phase 3+ for 43 high-risk countries. Scheduled weekly, with sensitivity intervals and a ledger.",
  keywords: [
    "famine early warning",
    "food security forecast",
    "IPC Phase 3",
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
  authors: [{ name: "Tom Danny S. Pedersen", url: "https://northflow.no" }],
  creator: "Northflow Technologies AS",
  publisher: "Northflow Technologies AS",
  openGraph: {
    title: "CERES · Famine Early Warning · 43 Countries",
    description:
      "90-day IPC Phase 3+ probability forecasts for 43 countries. " +
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
      "90-day IPC Phase 3+ probability forecasts. " +
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
        {/* The Google tag loads only once Samtykkr reports statistics consent, and
            its disable flag stops it again the moment that consent is taken back.
            Consent Mode alone is not enough: a tag running under denied consent
            still sends cookieless hits. Samtykkr's engine pushes the Consent Mode
            update before its events fire, but it knows only its own tab, so the
            stored choice is checked as well: on a storage event from another tab,
            on a return from the back-forward cache, when the tab becomes visible
            and on every route change. Without a readable cookie the storage copy,
            the bad cookie and the analytics cookies go before Samtykkr loads, so
            deleting cookies brings the banner back. Advertising signals stay denied
            whatever the banner grants, because GA is not used for advertising. GA
            cookies are normally host-only, though Google's tag reuses an existing
            parent _ga. Of the parent domain's cookies this code removes only this
            stream's; Samtykkr's own purge removes _ga and _ga_* there as well.
            Every nf_consent cookie is read, and all readable ones must grant. Where
            cookies cannot be read, as in a sandboxed popup, nothing here runs: no
            tag, no banner, and no wrapper around history. Inside another site's
            iframe neither loads: the widget then sets no cookies and has nothing
            to ask. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var cookiesReadable = false;
              try { cookiesReadable = typeof document.cookie === 'string'; } catch (e) {}
              if (window.self === window.top && cookiesReadable) {
                window['ga-disable-G-GQX8JPPF85'] = true;
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  ad_storage: 'denied', analytics_storage: 'denied',
                  ad_user_data: 'denied', ad_personalization: 'denied',
                  functionality_storage: 'denied', personalization_storage: 'denied',
                  security_storage: 'granted'
                });
                var tagLoaded = false;
                function addScript(src, async) {
                  var s = document.createElement('script');
                  s.async = async;
                  s.src = src;
                  document.head.appendChild(s);
                }
                function readChoices() {
                  var choices = { valid: [], bad: 0 };
                  document.cookie.split('; ').forEach(function (pair) {
                    if (pair.indexOf('nf_consent=') !== 0) return;
                    try {
                      var choice = JSON.parse(decodeURIComponent(pair.slice('nf_consent='.length)));
                      if (choice && choice.categories && typeof choice.categories === 'object') choices.valid.push(choice);
                      else choices.bad += 1;
                    } catch (e) {
                      choices.bad += 1;
                    }
                  });
                  return choices;
                }
                function expireCookie(name, domain, path) {
                  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || '/') + (domain ? '; domain=' + domain : '');
                }
                function parentDomain() {
                  return window.location.hostname.split('.').slice(1).join('.');
                }
                function clearBadConsentCookies() {
                  var paths = ['/'];
                  var path = '';
                  window.location.pathname.split('/').forEach(function (part) {
                    if (!part) return;
                    path += '/' + part;
                    paths.push(path);
                  });
                  paths.forEach(function (at) {
                    ['', window.location.hostname, parentDomain()].forEach(function (domain) {
                      expireCookie('nf_consent', domain, at);
                    });
                  });
                }
                function clearAnalyticsCookies() {
                  var host = window.location.hostname;
                  ['_ga', '_ga_GQX8JPPF85'].forEach(function (name) {
                    expireCookie(name);
                    expireCookie(name, host);
                  });
                  expireCookie('_ga_GQX8JPPF85', parentDomain());
                }
                function applyConsent() {
                  var stored = readChoices().valid;
                  var granted = !!window.NFConsent && window.NFConsent.has('statistics') && stored.length > 0 &&
                    stored.every(function (choice) { return !!choice.categories.statistics; });
                  window['ga-disable-G-GQX8JPPF85'] = !granted;
                  gtag('consent', 'update', {
                    analytics_storage: granted ? 'granted' : 'denied',
                    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
                  });
                  if (!granted) {
                    if (tagLoaded) clearAnalyticsCookies();
                    return;
                  }
                  if (tagLoaded) return;
                  tagLoaded = true;
                  gtag('js', new Date());
                  // 14 months of 30 days, in seconds. The cookie policy states this limit.
                  gtag('config', 'G-GQX8JPPF85', { cookie_expires: 36288000, cookie_domain: 'none' });
                  addScript('https://www.googletagmanager.com/gtag/js?id=G-GQX8JPPF85', true);
                }
                // Consent code must never break the page or a navigation.
                function safeConsent() {
                  try {
                    applyConsent();
                  } catch (e) {
                    window['ga-disable-G-GQX8JPPF85'] = true;
                  }
                }
                ['nf-consent-ready', 'nf-consent-change', 'nf-consent-withdraw'].forEach(function (name) {
                  window.addEventListener(name, safeConsent);
                });
                window.addEventListener('storage', function (e) {
                  if (e.key === 'nf_consent' || e.key === null) safeConsent();
                });
                window.addEventListener('pageshow', function (e) {
                  if (e.persisted) safeConsent();
                });
                document.addEventListener('visibilitychange', function () {
                  if (document.visibilityState === 'visible') safeConsent();
                });
                window.addEventListener('popstate', safeConsent);
                ['pushState', 'replaceState'].forEach(function (method) {
                  var original = window.history[method];
                  window.history[method] = function () {
                    safeConsent();
                    return original.apply(this, arguments);
                  };
                });
                try {
                  var found = readChoices();
                  if (!found.valid.length) {
                    clearBadConsentCookies();
                    clearAnalyticsCookies();
                    window.localStorage.removeItem('nf_consent');
                  } else if (found.bad) {
                    // Samtykkr reads only the first cookie, then its storage copy.
                    var strictest = found.valid.filter(function (choice) { return !choice.categories.statistics; })[0];
                    window.localStorage.setItem('nf_consent', JSON.stringify(strictest || found.valid[0]));
                  }
                } catch (e) {}
                addScript('https://app.samtykkr.no/v1/loader.js?site=STK-853d2967708856fc70834196&lang=en&accent=%231C1917&position=bottom-left&privacy=https%3A%2F%2Fceres.northflow.no%2Fprivacy', false);
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
                "Automated probabilistic forecasting system for acute food insecurity. Generates 90-day IPC Phase 3+ probability forecasts for 43 high-risk countries.",
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

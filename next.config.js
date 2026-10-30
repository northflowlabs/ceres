/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  env: {
    // NEXT_PUBLIC_API_URL is set in Vercel for Production only, so this
    // fallback is what every Preview build actually used, and it pointed at a
    // localhost backend that does not exist there. Preview deploys rendered an
    // empty dashboard, which quietly makes visual review of a pull request
    // worthless: the page looks broken whatever the change did.
    //
    // Localhost is a development default and belongs only in development. Any
    // other build falls back to the public API, matching src/lib/api.ts.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8100"
        : "https://api.ceres.northflow.no"),
  },
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      {
        // Open data for people and programs, not search results.
        source: "/ledger/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        // Every page except the embeddable widget must never be framed.
        source: "/((?!widget$).*)",
        headers: [
          ...common,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
      {
        // /widget is built to be embedded on other organisations' sites
        // (see /embed), so framing stays open there.
        source: "/widget",
        headers: [
          ...common,
          { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/track-record",
        destination: "/validation",
        permanent: true,
      },
      {
        // API sign-up is closed; the free downloads live on /data.
        source: "/api-access",
        destination: "/data",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

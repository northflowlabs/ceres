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
  async redirects() {
    return [
      {
        source: "/track-record",
        destination: "/validation",
        permanent: true,
      },
      {
        source: "/sub-national",
        destination: "/subnational",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

import type { Metadata } from "next";
import { regionName, REGION_NAMES } from "@/lib/regionNames";

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id } = await params;
  const code = id.toUpperCase();
  const known = code in REGION_NAMES;
  const country = regionName(code);
  const canonical = `https://ceres.northflow.no/regions/${id}`;

  const title = `${country} Famine Risk: 90-Day IPC Phase 3+ Forecast | CERES`;

  const description = known
    ? `Live 90-day famine risk for ${country}: calibrated IPC Phase 3+, 4+, and Famine probabilities with sensitivity intervals, driver breakdown, and sub-national signals. Updated weekly by CERES.`
    : `Live 90-day famine risk: calibrated IPC Phase 3+, 4+, and Famine probabilities with sensitivity intervals and driver breakdown. Updated weekly by CERES.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

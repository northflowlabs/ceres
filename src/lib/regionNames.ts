// Canonical region-id -> country-name map for the 43 high-risk countries
// monitored by CERES. Used by sitemap generation and per-region metadata.

export const REGION_NAMES: Record<string, string> = {
  AFG: "Afghanistan",
  BGD: "Bangladesh",
  BDI: "Burundi",
  BFA: "Burkina Faso",
  CAF: "Central African Republic",
  CMR: "Cameroon",
  COD: "DR Congo",
  DJI: "Djibouti",
  ERI: "Eritrea",
  ETH: "Ethiopia",
  GMB: "Gambia",
  GNB: "Guinea-Bissau",
  GTM: "Guatemala",
  HND: "Honduras",
  HTI: "Haiti",
  IRQ: "Iraq",
  KEN: "Kenya",
  LSO: "Lesotho",
  MDG: "Madagascar",
  MLI: "Mali",
  MMR: "Myanmar",
  MOZ: "Mozambique",
  MRT: "Mauritania",
  MWI: "Malawi",
  NGA: "Nigeria",
  NIG: "Niger",
  PAK: "Pakistan",
  PSE: "Palestine",
  RWA: "Rwanda",
  SDN: "Sudan",
  SEN: "Senegal",
  SLV: "El Salvador",
  SOM: "Somalia",
  SSD: "South Sudan",
  SWZ: "Eswatini",
  SYR: "Syria",
  TCD: "Chad",
  TZA: "Tanzania",
  UGA: "Uganda",
  VEN: "Venezuela",
  YEM: "Yemen",
  ZMB: "Zambia",
  ZWE: "Zimbabwe",
};

// Regions the API has no Admin1 breakdown for.
export const NO_ADMIN1 = new Set(["DJI", "ERI", "GMB", "GNB", "GTM", "HND", "LSO", "SLV", "SWZ"]);

// The 43 monitored region ids, in canonical order.
export const REGION_IDS: string[] = Object.keys(REGION_NAMES);

export function regionName(id: string): string {
  return REGION_NAMES[id] ?? id;
}

// World region for each monitored country, shown under the country name.
const NON_AFRICA_REGION: Record<string, string> = {
  IRQ: "Middle East",
  PSE: "Middle East",
  SYR: "Middle East",
  YEM: "Middle East",
  AFG: "South Asia",
  BGD: "South Asia",
  PAK: "South Asia",
  MMR: "Southeast Asia",
  HTI: "Caribbean",
  GTM: "Central America",
  HND: "Central America",
  SLV: "Central America",
  VEN: "South America",
};

export function worldRegion(id: string): string {
  if (NON_AFRICA_REGION[id]) return NON_AFRICA_REGION[id];
  return REGION_NAMES[id] ? "Africa" : "";
}

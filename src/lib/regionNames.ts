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

// The 43 monitored region ids, in canonical order.
export const REGION_IDS: string[] = Object.keys(REGION_NAMES);

export function regionName(id: string): string {
  return REGION_NAMES[id] ?? id;
}

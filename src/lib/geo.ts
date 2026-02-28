/**
 * Minimal world map geo data — country centroids + ISO-3 codes
 * for plotting risk markers on an SVG equirectangular projection.
 * Full choropleth paths omitted to stay bundle-light; we use
 * proportional circles on a clean basemap SVG.
 */

export interface CountryGeo {
  iso3: string;
  name: string;
  lat: number;
  lon: number;
}

/** Crisis-region centroids used for risk overlay circles */
export const CRISIS_COUNTRIES: CountryGeo[] = [
  { iso3: "ETH", name: "Ethiopia",     lat:  9.1,  lon: 40.5 },
  { iso3: "SOM", name: "Somalia",      lat:  5.9,  lon: 43.7 },
  { iso3: "SDN", name: "Sudan",        lat: 12.9,  lon: 30.2 },
  { iso3: "SSD", name: "South Sudan",  lat:  7.9,  lon: 29.7 },
  { iso3: "KEN", name: "Kenya",        lat: -1.3,  lon: 36.8 },
  { iso3: "YEM", name: "Yemen",        lat: 15.6,  lon: 48.5 },
  { iso3: "NIG", name: "Niger",        lat: 17.6,  lon:  8.1 },
  { iso3: "MLI", name: "Mali",         lat: 17.0,  lon: -4.0 },
  { iso3: "BFA", name: "Burkina Faso", lat: 12.4,  lon: -1.6 },
  { iso3: "HTI", name: "Haiti",        lat: 18.9,  lon:-72.3 },
  { iso3: "AFG", name: "Afghanistan",  lat: 33.9,  lon: 67.7 },
  { iso3: "SYR", name: "Syria",        lat: 34.8,  lon: 38.9 },
  { iso3: "COD", name: "DR Congo",     lat: -4.0,  lon: 21.8 },
  { iso3: "ZWE", name: "Zimbabwe",     lat:-20.0,  lon: 30.0 },
  { iso3: "MOZ", name: "Mozambique",   lat:-18.2,  lon: 35.0 },
];

/** Equirectangular projection: lat/lon → SVG x/y */
export function project(
  lat: number,
  lon: number,
  width = 960,
  height = 500
): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

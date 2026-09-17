// CARTO basemaps require an API key (https://carto.com/basemaps/apikey).
// Without one every tile is watermarked "API KEY REQUIRED".
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_BASEMAPS_KEY ?? "";

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function cartoTileUrl(style: string): string {
  const base = `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`;
  return CARTO_KEY ? `${base}?key=${encodeURIComponent(CARTO_KEY)}` : base;
}

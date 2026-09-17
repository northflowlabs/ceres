// Esri ArcGIS Online basemap tiles (no API key). CARTO basemaps now require
// a key and reject ours, so they are not used until that is resolved.
export const BASEMAP_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function basemapTileUrl(service: "Canvas/World_Light_Gray_Base" | "World_Street_Map"): string {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/{z}/{y}/{x}`;
}

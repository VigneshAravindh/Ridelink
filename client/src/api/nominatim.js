// src/api/nominatim.js
export async function searchLocationNominatim(q, limit = 6) {
  if (!q || q.trim().length < 2) return [];
  const encoded = encodeURIComponent(q.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&limit=${limit}&q=${encoded}`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en"
    }
  });
  if (!res.ok) return [];
  const data = await res.json();
  // map restful result to simplified objects
  return data.map((item) => ({
    display_name: item.display_name,
    address: item.address,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    type: item.type,
    osm_id: item.osm_id,
  }));
}

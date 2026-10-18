import "server-only";

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;
const INIT = { headers: { "user-agent": "SeenSooner/0.1" }, next: { revalidate: 86400 } } as RequestInit & {
  next: { revalidate: number };
};

async function json<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { ...INIT, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Postcode, outcode ("N12") or a town name ("Leeds"), via postcodes.io. */
export async function findPlace(raw: string): Promise<Place | null> {
  const q = raw.trim().replace(/\s+/g, " ");
  if (!q || q.length > 60) return null;
  if (POSTCODE.test(q)) {
    const d = await json<{ result: { postcode: string; latitude: number; longitude: number; admin_district: string } }>(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(q)}`,
    );
    if (d?.result?.latitude != null)
      return { label: `${d.result.postcode}, ${d.result.admin_district}`, lat: d.result.latitude, lng: d.result.longitude };
  }
  if (OUTCODE.test(q)) {
    const d = await json<{ result: { outcode: string; latitude: number; longitude: number; admin_district: string[] } }>(
      `https://api.postcodes.io/outcodes/${encodeURIComponent(q)}`,
    );
    if (d?.result?.latitude != null)
      return {
        label: `${d.result.outcode}${d.result.admin_district?.[0] ? `, ${d.result.admin_district[0]}` : ""}`,
        lat: d.result.latitude,
        lng: d.result.longitude,
      };
  }
  const d = await json<{ result: { name_1: string; county_unitary?: string; latitude: number; longitude: number; local_type: string }[] }>(
    `https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=5`,
  );
  // Prefer real settlements over hamlets and street names.
  const rank = ["City", "Town", "Suburban Area", "Village", "Other Settlement", "Hamlet"];
  const score = (t: string) => (rank.includes(t) ? rank.indexOf(t) : rank.length);
  const best = d?.result?.filter((p) => p.latitude != null).sort((a, b) => score(a.local_type) - score(b.local_type))[0];
  if (best) return { label: best.county_unitary ? `${best.name_1}, ${best.county_unitary}` : best.name_1, lat: best.latitude, lng: best.longitude };
  return null;
}

export function parseCoords(lat?: string, lng?: string): Place | null {
  const a = Number(lat), b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 49 || a > 61 || b < -9 || b > 2.5) return null;
  return { label: "your location", lat: a, lng: b };
}

/** Straight-line miles. Good enough to rank; we say "as the crow flies". */
export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

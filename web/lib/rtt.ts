import "server-only";
import data from "@/data/rtt.json";
import { miles } from "@/lib/geo";

export interface Specialty {
  code: string;
  slug: string;
  name: string;
  blurb: string;
}
export interface Provider {
  code: string;
  slug: string;
  name: string;
  nhs: boolean;
  icb: string;
  postcode: string | null;
  town: string | null;
  lat: number | null;
  lng: number | null;
  region: string | null;
}
export interface Wait {
  p: string;
  s: string;
  total: number;
  median: number;
  p92: number;
  within18: number;
  over52: number;
  treatedMedian: number | null;
  treated: number;
  trend: (number | null)[];
}
export interface Row extends Wait {
  provider: Provider;
  distance?: number;
}

const D = data as unknown as {
  generatedAt: string;
  period: string;
  months: string[];
  source: { name: string; url: string; file: string; licence: string };
  specialties: Specialty[];
  providers: Provider[];
  waits: Wait[];
};

const providersByCode = new Map(D.providers.map((p) => [p.code, p]));
const providersBySlug = new Map(D.providers.map((p) => [p.slug, p]));

export const RTT_SOURCE = D.source;
export const RTT_MONTHS = D.months;

/** "2026-08" → "August 2026" */
export function monthLabel(key: string, short = false) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: short ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
export const RTT_PERIOD = monthLabel(D.period);

/** Specialties people pick from. "All specialties" stays last. */
export const SPECIALTIES: Specialty[] = [
  ...D.specialties.filter((s) => s.slug !== "all").sort((a, b) => a.name.localeCompare(b.name)),
  ...D.specialties.filter((s) => s.slug === "all"),
];

export function getSpecialty(slug: string | undefined) {
  return SPECIALTIES.find((s) => s.slug === slug);
}
export function getProvider(slug: string) {
  return providersBySlug.get(slug);
}
export const ALL_PROVIDERS = D.providers;

function rows(code: string): Row[] {
  return D.waits.filter((w) => w.s === code).map((w) => ({ ...w, provider: providersByCode.get(w.p)! }));
}

export function nearby(code: string, at: { lat: number; lng: number }, radius: number) {
  return rows(code)
    .filter((r) => r.provider.lat != null)
    .map((r) => ({ ...r, distance: miles(at, { lat: r.provider.lat!, lng: r.provider.lng! }) }))
    .filter((r) => r.distance <= radius)
    .sort((a, b) => a.median - b.median);
}

export function national(code: string) {
  return rows(code).sort((a, b) => a.median - b.median);
}

export function providerWaits(code: string) {
  const bySpec = new Map(SPECIALTIES.map((s) => [s.code, s]));
  return D.waits
    .filter((w) => w.p === code && bySpec.has(w.s))
    .map((w) => ({ ...w, specialty: bySpec.get(w.s)! }))
    .sort((a, b) => (a.s === "C_999" ? 1 : b.s === "C_999" ? -1 : b.total - a.total));
}

/** Where this hospital sits among all providers for the same specialty (1 = fastest). */
export function rankFor(w: Wait) {
  const all = national(w.s);
  return { rank: all.findIndex((r) => r.p === w.p) + 1, of: all.length };
}

/** England-wide headline: median of medians and the spread, for a specialty. */
export function spread(code: string) {
  const all = national(code).filter((r) => r.total >= 200);
  if (!all.length) return null;
  const m = all.map((r) => r.median);
  return { fastest: all[0], slowest: all[all.length - 1], typical: m[Math.floor(m.length / 2)], count: all.length };
}

/**
 * The home-page story: in one region, the widest gap between two hospitals
 * no more than `maxApart` miles from each other, for a specialty.
 */
export function gapStory(code = "C_110", region = "London", maxApart = 15) {
  const list = rows(code).filter((r) => r.provider.region === region && r.total >= 300 && r.provider.lat != null);
  let best: { fast: Row; slow: Row; apart: number } | null = null;
  for (const a of list)
    for (const b of list) {
      if (a.median >= b.median) continue;
      const apart = miles({ lat: a.provider.lat!, lng: a.provider.lng! }, { lat: b.provider.lat!, lng: b.provider.lng! });
      if (apart > maxApart) continue;
      if (!best || b.median - a.median > best.slow.median - best.fast.median) best = { fast: a, slow: b, apart };
    }
  return best ? { ...best, list: list.sort((x, y) => x.median - y.median) } : null;
}

export const weeks = (n: number) => `${n < 10 ? n.toFixed(1).replace(/\.0$/, "") : Math.round(n)} week${n === 1 ? "" : "s"}`;

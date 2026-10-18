import "server-only";
import { unstable_cache } from "next/cache";
import { getLiveSites } from "@/lib/live/index.ts";

// Every visitor shares one fetch round per 5 minutes, so trust sites see at
// most ~12 requests an hour from us, however busy this site gets.
export const getLive = unstable_cache(getLiveSites, ["live-sites-v1"], { revalidate: 300 });

/** Request-time clock, kept out of component bodies (React purity rule). */
export const snapshotTime = () => Date.now();

/** "2 hr", "4 hr+" (over), "up to 1 hr" (under), "2 hr 30 min to 3 hr" (range). */
export function fmtWait(s: { waitMinutes: number | null; waitBand?: "over" | "under" | "range"; waitHigh?: number | null }) {
  if (s.waitMinutes == null) return null;
  const v = fmtMinutes(s.waitMinutes);
  if (s.waitBand === "over") return `${v}+`;
  if (s.waitBand === "under") return `up to ${v}`;
  if (s.waitBand === "range" && s.waitHigh != null) return `${v} to ${fmtMinutes(s.waitHigh)}`;
  return v;
}

export function fmtMinutes(m: number) {
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return r ? `${h} hr ${r} min` : `${h} hr`;
}

export function ago(iso: string | null, now = Date.now()) {
  if (!iso) return null;
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins)) return null;
  if (mins < 1) return { text: "just now", mins: 0 };
  if (mins < 60) return { text: `${mins} min ago`, mins };
  const h = Math.round(mins / 60);
  return { text: h < 48 ? `${h} hr ago` : `${Math.round(h / 24)} days ago`, mins };
}

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

const unit = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** Trust-site style: "1 hour 10 minutes", "54 minutes", "2 hours". */
export function fmtLong(m: number) {
  const r = Math.round(m);
  if (r === 0) return "no wait (0 minutes)";
  if (r < 60) return unit(r, "minute");
  const h = Math.floor(r / 60);
  const min = r % 60;
  return min ? `${unit(h, "hour")} ${unit(min, "minute")}` : unit(h, "hour");
}

/** Long form that keeps a band honest: "more than 2 hours", "less than 1 hour", "2 hours 30 minutes to 3 hours". */
export function fmtWaitLong(s: { waitMinutes: number | null; waitBand?: "over" | "under" | "range"; waitHigh?: number | null }) {
  if (s.waitMinutes == null) return null;
  const v = fmtLong(s.waitMinutes);
  if (s.waitBand === "over") return `more than ${v}`;
  if (s.waitBand === "under") return `less than ${v}`;
  if (s.waitBand === "range" && s.waitHigh != null) return `${v} to ${fmtLong(s.waitHigh)}`;
  return v;
}

/** "18:45 on Saturday 18 October 2026", in UK time. */
export function ukStamp(ms: number) {
  const d = new Date(ms);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
  const day = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  return `${time} on ${day}`;
}

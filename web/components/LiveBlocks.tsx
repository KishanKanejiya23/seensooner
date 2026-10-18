import { minutesTone, TONE_WORD, type Tone } from "@/components/Bars";
import { ArrowIcon, ClockIcon, PinIcon, RefreshIcon } from "@/components/Icons";
import type { LiveSite } from "@/lib/live/types.ts";
import { ago, fmtWaitLong, ukStamp } from "@/lib/live-cache";

const KIND_LONG: Record<LiveSite["kind"], string> = {
  AE: "Emergency department (A&E)",
  CHILDREN_AE: "Children's emergency department",
  UTC: "Urgent treatment centre",
  MIU: "Minor injuries unit",
};
const DOT: Record<Tone, string> = { quick: "bg-quick", mid: "bg-mid", long: "bg-long" };
const WORD: Record<Tone, string> = { quick: "text-quick-ink", mid: "text-mid-ink", long: "text-long-ink" };

export type Hospital = { key: string; name: string; trust: string; distance?: number; lat: number; lng: number; sourceUrl: string; sourceName: string; units: LiveSite[] };

/** Several departments at one hospital read as one block, as trust sites show them. */
export function groupByHospital(sites: (LiveSite & { distance?: number })[]): Hospital[] {
  const map = new Map<string, Hospital>();
  for (const s of sites) {
    const key = `${s.name}|${s.trust}`;
    const h = map.get(key) ?? { key, name: s.name, trust: s.trust, distance: s.distance, lat: s.lat, lng: s.lng, sourceUrl: s.sourceUrl, sourceName: s.sourceName, units: [] };
    h.units.push(s);
    map.set(key, h);
  }
  const order: Record<LiveSite["kind"], number> = { AE: 0, CHILDREN_AE: 1, UTC: 2, MIU: 3 };
  for (const h of map.values()) h.units.sort((a, b) => order[a.kind] - order[b.kind]);
  return [...map.values()];
}

export const shortestIn = (h: Hospital) => Math.min(...h.units.map((u) => u.waitMinutes ?? Infinity));

export function TimestampPanel({ now, href }: { now: number; href: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-900 px-6 py-5 text-white">
      <div className="flex items-center gap-4">
        <ClockIcon className="h-10 w-10 shrink-0 text-saffron" />
        <p>
          <span className="block text-[16px] text-brand-100">We last checked every hospital&apos;s live page at</span>
          <span className="block text-[20px] font-bold sm:text-[24px]">{ukStamp(now)}</span>
        </p>
      </div>
      {/* A link, not a script: reloading the page is the refresh. */}
      <a href={href} className="inline-flex min-h-12 items-center gap-2 rounded bg-brand-700 px-5 font-bold hover:bg-brand-800">
        <RefreshIcon className="h-5 w-5" /> Refresh page
      </a>
    </div>
  );
}

export function HospitalBlock({ h, now, headingLevel = 3 }: { h: Hospital; now: number; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`;
  return (
    <article className="rise" aria-labelledby={`h-${h.key}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <H id={`h-${h.key}`} className="text-[24px]">
          {h.name}
        </H>
        <a href={h.sourceUrl} className="link text-[18px]">
          View on the trust&apos;s website<span className="sr-only"> ({h.sourceName})</span>
        </a>
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] text-ink-2">
        <span>{h.trust}</span>
        {h.distance != null && (
          <span className="inline-flex items-center gap-1 font-bold text-ink">
            <PinIcon className="h-4 w-4" /> <span className="num">{h.distance.toFixed(1)}</span> miles away
          </span>
        )}
        <a href={maps} className="inline-flex items-center gap-1 font-bold text-brand-600 underline underline-offset-4">
          Directions <ArrowIcon className="h-4 w-4" />
        </a>
      </p>

      <div className="mt-4 flex gap-5 border-b-4 border-ember bg-well px-5 py-5 sm:px-6">
        <ClockIcon className="mt-1 hidden h-10 w-10 shrink-0 text-ember sm:block" />
        <ul className="min-w-0 flex-1 space-y-4">
          {h.units.map((u) => {
            const tone = u.waitMinutes != null ? minutesTone(u.waitMinutes) : null;
            const wait = fmtWaitLong(u);
            const age = ago(u.sourceUpdatedAt, now) ?? ago(u.fetchedAt, now);
            const stale = age != null && age.mins > 120;
            const label = u.unit && !/emergency department|^a&e$|^ed$/i.test(u.unit) ? u.unit : KIND_LONG[u.kind];
            return (
              <li key={u.id}>
                <p className="text-[18px] sm:text-[20px]">
                  {label}:{" "}
                  {wait ? (
                    <strong className="num whitespace-nowrap">{wait}</strong>
                  ) : (
                    <strong>{u.open === false ? "closed right now" : "no time published right now"}</strong>
                  )}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] text-ink-2">
                  {tone && (
                    <span className={`inline-flex items-center gap-2 font-bold ${WORD[tone]}`}>
                      <span className={`h-3 w-3 rounded-full ${DOT[tone]}`} aria-hidden="true" />
                      {TONE_WORD[tone]} wait
                    </span>
                  )}
                  {u.patientsWaiting != null && (
                    <span>
                      <span className="num">{u.patientsWaiting}</span> {u.patientsWaiting === 1 ? "person" : "people"} waiting
                    </span>
                  )}
                  <span className={stale ? "font-bold text-long-ink" : ""}>
                    {stale ? `May be out of date: hospital updated it ${age!.text}` : `Hospital updated it ${age?.text ?? "recently"}`}
                  </span>
                </p>
                <p className="mt-1 text-[14px] text-ink-3">{u.metric}.</p>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

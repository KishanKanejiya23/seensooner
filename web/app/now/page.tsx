import type { Metadata } from "next";
import Link from "next/link";
import { minutesTone, TONE_WORD } from "@/components/Bars";
import { Notice } from "@/components/Notice";
import { SearchPanel } from "@/components/SearchPanel";
import { findPlace, miles, parseCoords } from "@/lib/geo";
import type { LiveSite } from "@/lib/live/types.ts";
import { ago, fmtWait, getLive, snapshotTime } from "@/lib/live-cache";
import { SPECIALTIES } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Live A&E and urgent care waiting times near you",
  description: "Current waits at A&E departments, urgent treatment centres and minor injuries units, straight from each NHS trust's own live page.",
  alternates: { canonical: "/now" },
};

const KIND: Record<LiveSite["kind"], string> = {
  AE: "A&E",
  CHILDREN_AE: "Children's A&E",
  UTC: "Urgent treatment centre",
  MIU: "Minor injuries unit",
};
const TONE_TEXT = { quick: "text-quick-ink", mid: "text-mid-ink", long: "text-long-ink" } as const;
const TONE_BG = { quick: "bg-quick-soft", mid: "bg-mid-soft", long: "bg-long-soft" } as const;
const RADIUS = 30;

type Sorted = LiveSite & { distance?: number };

/** "A&E · Emergency Department" says the same thing twice; keep the unit only when it adds something. */
const SAME: Record<LiveSite["kind"], RegExp> = {
  AE: /^(adult )?(emergency department|a&e|ed)$/i,
  CHILDREN_AE: /^(children'?s|paediatric) (emergency department|a&e|ed)$/i,
  UTC: /^urgent treatment centre$/i,
  MIU: /^minor injur(y|ies) unit$/i,
};
const redundant = (s: LiveSite) => SAME[s.kind].test((s.unit ?? "").trim());

function Ticket({ s, now }: { s: Sorted; now: number }) {
  const tone = s.waitMinutes != null ? minutesTone(s.waitMinutes) : null;
  const age = ago(s.sourceUpdatedAt, now) ?? ago(s.fetchedAt, now);
  const stale = age != null && age.mins > 120;
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
  return (
    <li className="grid overflow-hidden rounded-xl border border-line bg-card sm:grid-cols-[216px_16px_1fr]">
      <div className={`flex flex-col justify-center px-6 py-5 ${tone ? TONE_BG[tone] : "bg-paper-2"}`}>
        {s.waitMinutes != null ? (
          <>
            <span className="num text-[24px] font-bold leading-tight sm:text-[28px]">{fmtWait(s)}</span>
            <span className={`mt-2 text-[14px] font-bold ${tone ? TONE_TEXT[tone] : ""}`}>{tone && TONE_WORD[tone]} wait</span>
          </>
        ) : (
          <span className="text-[18px] font-bold text-ink-2">{s.open === false ? "Closed now" : "No wait shown"}</span>
        )}
      </div>
      <div className="perf hidden sm:block" aria-hidden="true" />
      <div className="min-w-0 px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[20px] font-bold leading-snug">{s.name}</h3>
          {s.distance != null && <span className="num text-[16px] text-ink-2">{s.distance.toFixed(1)} mi</span>}
        </div>
        <p className="mt-1 text-[16px] text-ink-2">
          <span className="font-bold">{KIND[s.kind]}</span>
          {s.unit && !redundant(s) ? ` · ${s.unit}` : ""} · {s.trust}
        </p>
        <p className="mt-3 text-[14px] text-ink-3">{s.metric}.</p>
        {s.patientsWaiting != null && (
          <p className="mt-1 text-[14px] text-ink-3">
            <span className="num">{s.patientsWaiting}</span> {s.patientsWaiting === 1 ? "person" : "people"} waiting
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[16px]">
          <span className={`inline-flex items-center gap-2 ${stale ? "font-bold text-long-ink" : "text-ink-2"}`}>
            <span className={`h-2 w-2 rounded-full ${stale ? "bg-long" : "bg-live"}`} aria-hidden="true" />
            {stale ? `May be out of date: updated ${age!.text}` : `Updated ${age?.text ?? "recently"}`}
          </span>
          <a href={maps} className="font-bold text-act hover:underline">Directions</a>
          <a href={s.sourceUrl} className="text-act hover:underline">
            Trust&apos;s live page<span className="sr-only"> ({s.sourceName})</span>
          </a>
        </div>
      </div>
    </li>
  );
}

export default async function Now({ searchParams }: PageProps<"/now">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q);
  const sort = one(sp.sort) === "wait" ? "wait" : "distance";
  const place = parseCoords(one(sp.lat), one(sp.lng)) ?? (q ? await findPlace(q) : null);
  const { sites, sources } = await getLive();
  const now = snapshotTime();
  const specs = SPECIALTIES.map((s) => ({ slug: s.slug, name: s.name }));

  let list: Sorted[] = [];
  if (place) {
    list = sites.map((s) => ({ ...s, distance: miles(place, s) })).filter((s) => s.distance <= RADIUS);
    list.sort((a, b) =>
      sort === "wait" ? (a.waitMinutes ?? 1e9) - (b.waitMinutes ?? 1e9) || a.distance! - b.distance! : a.distance! - b.distance!,
    );
  }
  const base = place && !q ? `lat=${place.lat}&lng=${place.lng}` : `q=${encodeURIComponent(q)}`;
  const failed = sources.filter((s) => !s.ok);
  const nations = [...new Set(sites.map((s) => s.nation))];
  const quickest = [...sites].filter((s) => s.waitMinutes != null && s.kind !== "MIU").sort((a, b) => a.waitMinutes! - b.waitMinutes!);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <p className="caps flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
        </span>
        Live · {sites.length} sites · {nations.join(", ")}
      </p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">
        {place ? <>Urgent care near {place.label}</> : "A&E and urgent care waits, right now"}
      </h1>

      <div className="mt-8">
        <SearchPanel specialties={specs} mode="now" q={q} compact />
      </div>

      <div className="mt-8">
        <Notice title="The sickest people are always seen first">
          These are the trusts&apos; own figures. Your wait depends on how urgent you are. If you&apos;re getting worse while you wait,
          tell staff straight away. If it&apos;s life-threatening, <a className="prose-link" href="tel:999">call 999</a>.
        </Notice>
      </div>

      {!place && q && (
        <div className="mt-8">
          <Notice title={`We couldn't find "${q}"`} tone="warn">Try a full postcode, the first half of one, or a town name.</Notice>
        </div>
      )}

      {place && (
        <section className="mt-12" aria-labelledby="results">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="results" className="text-[20px] font-bold">
              {list.length ? `${list.length} sites within ${RADIUS} miles publish a live wait` : `No live waits within ${RADIUS} miles`}
            </h2>
            {list.length > 1 && (
              <nav aria-label="Sort" className="flex gap-2">
                {(["distance", "wait"] as const).map((k) => (
                  <Link
                    key={k}
                    href={`/now?${base}&sort=${k}`}
                    aria-current={k === sort ? "true" : undefined}
                    className={`inline-flex min-h-12 items-center rounded border-2 px-4 text-[16px] font-bold ${k === sort ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-2 hover:border-ink"}`}
                  >
                    {k === "distance" ? "Nearest" : "Shortest wait"}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {list.length > 0 ? (
            <ul className="mt-6 space-y-4">{list.map((s) => <Ticket key={s.id} s={s} now={now} />)}</ul>
          ) : (
            <div className="mt-6">
              <Notice title="Your area doesn't publish live waits yet">
                Most hospitals in England only report A&amp;E waits monthly, so there&apos;s nothing live to show near you. Use{" "}
                <a className="prose-link" href="https://111.nhs.uk/">NHS 111</a>: they can tell you where to go and book a slot at many
                urgent treatment centres.
              </Notice>
            </div>
          )}
        </section>
      )}

      {!place && quickest.length > 0 && (
        <section className="mt-12" aria-labelledby="quickest">
          <h2 id="quickest" className="text-[20px] font-bold">Shortest A&amp;E and urgent care waits right now</h2>
          <p className="mt-1 text-ink-2">Across every site we track. Search above to sort by distance from you.</p>
          <ul className="mt-6 space-y-4">{quickest.slice(0, 6).map((s) => <Ticket key={s.id} s={s} now={now} />)}</ul>
        </section>
      )}

      <section className="mt-16 border-t border-line pt-8 text-[16px] text-ink-2" aria-labelledby="sources">
        <h2 id="sources" className="caps">Where these numbers come from</h2>
        <p className="mt-3 max-w-3xl">
          Only some trusts publish live waits. We read each official page every few minutes and show its figure unchanged, with the
          trust&apos;s own update time. Each trust measures its wait slightly differently, so we show its definition on every result.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {sources.filter((s) => s.ok).map((s) => (
            <li key={s.id}>
              <a className="prose-link" href={s.sourceUrl}>{s.name}</a> <span className="num text-ink-3">({s.count})</span>
            </li>
          ))}
        </ul>
        {failed.length > 0 && (
          <p className="mt-4 text-ink-3">
            Couldn&apos;t reach just now: {failed.map((f) => f.name).join(", ")}. We&apos;ll try again in a few minutes.
          </p>
        )}
      </section>
    </div>
  );
}

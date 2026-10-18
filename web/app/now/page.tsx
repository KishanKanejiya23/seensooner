import type { Metadata } from "next";
import Link from "next/link";
import { groupByHospital, HospitalBlock, shortestIn, TimestampPanel } from "@/components/LiveBlocks";
import { Notice } from "@/components/Notice";
import { SearchPanel } from "@/components/SearchPanel";
import { PageBanner, PageLayout } from "@/components/Shell";
import { findPlace, miles, parseCoords } from "@/lib/geo";
import { getLive, snapshotTime } from "@/lib/live-cache";
import { SPECIALTIES } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Live A&E waiting times near you",
  description:
    "Current waits at A&E departments, urgent treatment centres and minor injuries units near you, straight from each hospital's own live page and checked every few minutes.",
  alternates: { canonical: "/now" },
};

const RADIUS = 30;

export default async function Now({ searchParams }: PageProps<"/now">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q);
  const sort = one(sp.sort) === "wait" ? "wait" : "distance";
  const place = parseCoords(one(sp.lat), one(sp.lng)) ?? (q ? await findPlace(q) : null);
  const { sites, sources } = await getLive();
  const now = snapshotTime();
  const specs = SPECIALTIES.map((s) => ({ slug: s.slug, name: s.name }));
  const base = place && !q ? `lat=${place.lat}&lng=${place.lng}` : q ? `q=${encodeURIComponent(q)}` : "";
  const self = `/now${base ? `?${base}${sort === "wait" ? "&sort=wait" : ""}` : ""}`;

  const near = place ? groupByHospital(sites.map((s) => ({ ...s, distance: miles(place, s) })).filter((s) => s.distance <= RADIUS)) : [];
  near.sort((a, b) => (sort === "wait" ? shortestIn(a) - shortestIn(b) || a.distance! - b.distance! : a.distance! - b.distance!));

  const all = groupByHospital(sites);
  const regions = [...new Set(all.map((h) => h.units[0].region ?? h.units[0].nation))].sort();
  const failed = sources.filter((s) => !s.ok);

  return (
    <>
      <PageBanner
        photo="ambulance"
        kicker="Updated every few minutes"
        title={place ? <>Urgent care near {place.label}</> : "Live A&E and urgent care waiting times"}
        lede="Straight from each hospital's own live page, so you can see where you're likely to be seen sooner before you set off."
      />
      <PageLayout trail={[{ label: "Urgent care now" }]} current="/now">
        <div className="max-w-[860px] space-y-6 text-[18px]">
          <p>
            If you don&apos;t need urgent medical attention, <a className="link" href="https://111.nhs.uk/">NHS 111</a>, your pharmacist or your GP
            may help you faster, and leave A&amp;E free for the people who need it most.
          </p>
          <p className="font-bold">
            Everyone is assessed (triaged) when they arrive, and the most unwell people are always seen first. The times below are each
            hospital&apos;s own figures. What each one measures is written under it.
          </p>
        </div>

        <div className="mt-10">
          <SearchPanel specialties={specs} mode="now" q={q} fixedMode />
        </div>

        {!place && q && (
          <div className="mt-8">
            <Notice title={`We couldn't find "${q}"`} tone="warn">
              Try a full postcode (like B71 4HJ), the first half of one (like B71), or a town name.
            </Notice>
          </div>
        )}

        <div className="mt-10">
          <TimestampPanel now={now} href={self} />
        </div>

        {place && (
          <section className="mt-10" aria-labelledby="results">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="results" className="text-[24px] sm:text-[30px]">
                {near.length ? `${near.length} hospitals within ${RADIUS} miles` : `No live waits within ${RADIUS} miles`}
              </h2>
              {near.length > 1 && (
                <nav aria-label="Sort hospitals" className="flex items-center gap-2 text-[16px]">
                  <span className="mr-1 font-bold">Sort by:</span>
                  {(["distance", "wait"] as const).map((k) => (
                    <Link
                      key={k}
                      href={`/now?${base}&sort=${k}`}
                      aria-current={k === sort ? "true" : undefined}
                      className={`inline-flex min-h-12 items-center rounded border-2 px-4 font-bold ${k === sort ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-white text-ink hover:border-brand-700"}`}
                    >
                      {k === "distance" ? "Nearest" : "Shortest wait"}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            {near.length > 0 ? (
              <div className="mt-8 space-y-12">
                {near.map((h) => (
                  <HospitalBlock key={h.key} h={h} now={now} />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <Notice title="Hospitals near you don't publish live waits yet">
                  Most hospitals in England only report A&amp;E times once a month, so there&apos;s nothing live to show here.{" "}
                  <a className="link" href="https://111.nhs.uk/">NHS 111</a> can tell you where to go, and can book a time slot at many urgent
                  treatment centres.
                </Notice>
              </div>
            )}
          </section>
        )}

        {!place && (
          <section className="mt-12" aria-labelledby="by-region">
            <h2 id="by-region" className="text-[24px] sm:text-[30px]">
              Every hospital we track, by area
            </h2>
            <p className="mt-2 text-ink-2">
              {all.length} hospitals and urgent care centres publish a live wait we can read. Search above to sort them by distance from you.
            </p>
            <div className="mt-6 border-t border-line">
              {regions.map((r) => {
                const list = all.filter((h) => (h.units[0].region ?? h.units[0].nation) === r).sort((a, b) => shortestIn(a) - shortestIn(b));
                return (
                  <details key={r} className="border-b border-line">
                    <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[20px] font-bold hover:text-brand-600">
                      <span>
                        {r} <span className="num font-normal text-ink-3">({list.length})</span>
                      </span>
                      <span className="chev text-[16px] text-ink-3 transition-transform" aria-hidden="true">▼</span>
                    </summary>
                    <div className="space-y-10 pb-10 pt-2">
                      {list.map((h) => (
                        <HospitalBlock key={h.key} h={h} now={now} />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-16" aria-labelledby="sources">
          <h2 id="sources" className="text-[24px]">
            Where these times come from
          </h2>
          <p className="mt-3 max-w-[860px] text-ink-2">
            Only some hospitals publish a live wait. We read each official page every few minutes and show its figure unchanged, with the
            hospital&apos;s own update time. When a hospital only gives a range, like &ldquo;more than 2 hours&rdquo;, that&apos;s what we show.
          </p>
          <ul className="mt-5 grid gap-x-8 gap-y-2 text-[16px] sm:grid-cols-2">
            {sources
              .filter((s) => s.ok)
              .map((s) => (
                <li key={s.id}>
                  <a className="link" href={s.sourceUrl}>
                    {s.name}
                  </a>{" "}
                  <span className="num text-ink-3">({s.count})</span>
                </li>
              ))}
          </ul>
          {failed.length > 0 && (
            <p className="mt-4 text-[16px] text-ink-3">
              We couldn&apos;t reach {failed.map((f) => f.name).join(", ")} just now. We&apos;ll try again in a few minutes.
            </p>
          )}
        </section>
      </PageLayout>
    </>
  );
}

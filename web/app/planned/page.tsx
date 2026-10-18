import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { Notice } from "@/components/Notice";
import { PlannedLegend, PlannedList, axisMax } from "@/components/PlannedList";
import { SearchPanel } from "@/components/SearchPanel";
import { PageBanner, PageLayout } from "@/components/Shell";
import { findPlace, parseCoords } from "@/lib/geo";
import { RTT_PERIOD, SPECIALTIES, getSpecialty, nearby, weeks } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Hospital waiting times for operations and specialists",
  description: `Compare how long hospitals near you are taking for planned care, from hip replacements to cataracts. NHS England data for ${RTT_PERIOD}, 506 providers.`,
  alternates: { canonical: "/planned" },
};

const RADII = [10, 25, 50];

export default async function Planned({ searchParams }: PageProps<"/planned">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q);
  const spec = getSpecialty(one(sp.s)) ?? getSpecialty("orthopaedics")!;
  const radius = RADII.includes(Number(one(sp.r))) ? Number(one(sp.r)) : 25;
  const place = parseCoords(one(sp.lat), one(sp.lng)) ?? (q ? await findPlace(q) : null);
  const specs = SPECIALTIES.map((s) => ({ slug: s.slug, name: s.name }));
  const rows = place ? nearby(spec.code, place, radius) : [];
  const base = place && !q ? `lat=${place.lat}&lng=${place.lng}` : `q=${encodeURIComponent(q)}`;
  const max = axisMax(rows);

  return (
    <>
      <PageBanner
        photo="red-chairs"
        kicker={`NHS England data for ${RTT_PERIOD}`}
        title={place ? <>{spec.name} waits near {place.label}</> : "Waiting for an operation or specialist"}
        lede="See how long every hospital near you is taking, then ask to be referred to the one that suits you."
      />
      <PageLayout trail={place ? [{ href: "/planned", label: "Planned care" }, { label: spec.name }] : [{ label: "Planned care" }]} current="/planned">
        <div className="max-w-[860px] space-y-6 text-[18px]">
          <p>
            Hospitals publish how long people on their waiting lists have waited, every month. The gap between two hospitals a few
            miles apart is often months.
          </p>
          <p className="font-bold">
            In England you can usually choose where you&apos;re referred, including independent hospitals that treat NHS patients for free.{" "}
            <Link className="link" href="/right-to-choose">How to ask your GP</Link>.
          </p>
        </div>

        <div className="mt-10">
          <SearchPanel specialties={specs} mode="planned" q={q} s={spec.slug} fixedMode />
        </div>

        {!place && q && (
          <div className="mt-8">
            <Notice title={`We couldn't find "${q}"`} tone="warn">
              Try a full postcode (like M1 1AE), the first half of one (like M1), or a town name.
            </Notice>
          </div>
        )}

        {place && (
          <section className="mt-12" aria-labelledby="results">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="results" className="text-[24px] sm:text-[30px]">
                  {rows.length ? `${rows.length} hospitals within ${radius} miles` : `No hospitals within ${radius} miles`}
                </h2>
                <p className="mt-1 text-[16px] text-ink-2">{spec.blurb}. Shortest wait first. Distances are in a straight line.</p>
              </div>
              <nav aria-label="Search radius" className="flex items-center gap-2 text-[16px]">
                <span className="mr-1 font-bold">Within:</span>
                {RADII.map((r) => (
                  <Link
                    key={r}
                    href={`/planned?${base}&s=${spec.slug}&r=${r}`}
                    aria-current={r === radius ? "true" : undefined}
                    className={`num inline-flex min-h-12 items-center rounded border-2 px-4 font-bold ${r === radius ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-white text-ink hover:border-brand-700"}`}
                  >
                    {r} miles
                  </Link>
                ))}
              </nav>
            </div>

            {rows.length > 0 ? (
              <>
                {rows.length > 1 && (
                  <div className="mt-6 border-l-8 border-saffron bg-well px-6 py-5 text-[18px]">
                    The quickest, <strong>{rows[0].provider.name}</strong>, has a median wait of <strong>{weeks(rows[0].median)}</strong>.
                    {rows[rows.length - 1].median - rows[0].median >= 2 && (
                      <> That&apos;s {weeks(rows[rows.length - 1].median - rows[0].median)} shorter than the slowest one near you.</>
                    )}
                  </div>
                )}
                <div className="mt-8">
                  <PlannedLegend max={max} />
                </div>
                <div className="mt-4">
                  <PlannedList rows={rows.slice(0, 15)} specialtyName={spec.name} max={max} />
                </div>
                {rows.length > 15 && (
                  <details className="mt-2">
                    <summary className="flex min-h-14 items-center gap-2 py-3 text-[18px] font-bold text-brand-600 underline underline-offset-4">
                      Show the other {rows.length - 15} hospitals <span className="chev text-[14px] transition-transform" aria-hidden="true">▼</span>
                    </summary>
                    <PlannedList rows={rows.slice(15)} specialtyName={spec.name} offset={15} best={rows[0].median} max={max} />
                  </details>
                )}
                <div className="mt-10 grid gap-6 xl:grid-cols-2">
                  <Notice title="What these numbers mean">
                    The median is how long half the people <em>on the list now</em> have waited so far. It isn&apos;t a promise of your
                    wait, which depends on how urgent your case is. Independent hospitals often take simpler cases.
                  </Notice>
                  <Notice title="You can usually choose">
                    For a first appointment with a specialist, ask your GP to refer you to any provider here that offers the service on the
                    NHS. <Link className="link" href="/right-to-choose">How to ask</Link>
                  </Notice>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <Notice title="No hospitals close enough">
                  {radius < 50 ? (
                    <>
                      Try a <Link className="link" href={`/planned?${base}&s=${spec.slug}&r=50`}>wider search, within 50 miles</Link>, or{" "}
                      <Link className="link" href={`/planned/${spec.slug}`}>see every provider in England</Link>.
                    </>
                  ) : (
                    <>
                      <Link className="link" href={`/planned/${spec.slug}`}>See every provider in England</Link>. This data covers England only.
                    </>
                  )}
                </Notice>
              </div>
            )}
          </section>
        )}

        {!place && (
          <section className="mt-14" aria-labelledby="by-specialty">
            <h2 id="by-specialty" className="text-[24px] sm:text-[30px]">
              Or browse England by specialty
            </h2>
            <ul className="mt-6 grid gap-x-8 border-t border-line sm:grid-cols-2">
              {SPECIALTIES.map((s) => (
                <li key={s.slug} className="border-b border-line">
                  <Link href={`/planned/${s.slug}`} className="group flex items-start justify-between gap-4 py-4">
                    <span>
                      <span className="block text-[18px] font-bold text-brand-600 underline-offset-4 group-hover:underline">{s.name}</span>
                      <span className="block text-[16px] text-ink-2">{s.blurb}</span>
                    </span>
                    <ArrowIcon className="mt-1 h-5 w-5 shrink-0 text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageLayout>
    </>
  );
}

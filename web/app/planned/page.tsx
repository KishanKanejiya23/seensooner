import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/Notice";
import { PlannedLegend, PlannedList, axisMax } from "@/components/PlannedList";
import { SearchPanel } from "@/components/SearchPanel";
import { findPlace, parseCoords } from "@/lib/geo";
import { RTT_PERIOD, SPECIALTIES, getSpecialty, nearby, weeks } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Compare hospital waiting times for operations and specialists",
  description: `How long hospitals near you are taking for planned care, by specialty. NHS England data for ${RTT_PERIOD}.`,
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

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <p className="caps">Planned care · NHS England data for {RTT_PERIOD}</p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">
        {place ? (
          <>
            {spec.name} waits near {place.label}
          </>
        ) : (
          "Compare hospital waiting times"
        )}
      </h1>

      <div className="mt-8">
        <SearchPanel specialties={specs} mode="planned" q={q} s={spec.slug} compact />
      </div>

      {!place && q && (
        <div className="mt-10">
          <Notice title={`We couldn't find "${q}"`} tone="warn">
            Try a full postcode (like M1 1AE), the first half of one (like M1), or a town name.
          </Notice>
        </div>
      )}

      {place && (
        <section className="mt-12" aria-labelledby="results">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="results" className="text-[20px] font-bold">
                {rows.length ? `${rows.length} providers within ${radius} miles, shortest wait first` : `No providers within ${radius} miles`}
              </h2>
              <p className="mt-1 text-[16px] text-ink-2">{spec.blurb}. Distances are as the crow flies, to the provider&apos;s main address.</p>
            </div>
            <nav aria-label="Search radius" className="flex gap-2">
              {RADII.map((r) => (
                <Link
                  key={r}
                  href={`/planned?${base}&s=${spec.slug}&r=${r}`}
                  aria-current={r === radius ? "true" : undefined}
                  className={`num inline-flex min-h-12 items-center rounded border-2 px-4 text-[16px] font-bold ${r === radius ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-2 hover:border-ink"}`}
                >
                  {r} mi
                </Link>
              ))}
            </nav>
          </div>

          {rows.length > 0 ? (
            <>
              {rows.length > 1 && (
                <p className="mt-6 max-w-3xl text-[18px]">
                  The fastest, <strong>{rows[0].provider.name}</strong>, has a median wait of {weeks(rows[0].median)}.{" "}
                  {rows[rows.length - 1].median - rows[0].median >= 2 && (
                    <>That&apos;s {weeks(rows[rows.length - 1].median - rows[0].median)} shorter than the slowest nearby.</>
                  )}
                </p>
              )}
              <div className="mt-6">
                <PlannedLegend max={axisMax(rows)} />
              </div>
              <div className="mt-4">
                <PlannedList rows={rows.slice(0, 15)} specialtyName={spec.name} />
              </div>
              {rows.length > 15 && (
                <details className="group mt-2">
                  <summary className="flex min-h-14 items-center gap-2 py-3 text-[18px] font-bold text-act hover:underline">
                    Show the other {rows.length - 15} <span className="chev transition-transform" aria-hidden="true">▾</span>
                  </summary>
                  <PlannedList rows={rows.slice(15)} specialtyName={spec.name} offset={15} best={rows[0].median} max={axisMax(rows)} />
                </details>
              )}
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Notice title="What these numbers mean">
                  The median is how long half the people <em>currently on the list</em> have waited so far. It isn&apos;t a promise of
                  your wait, which depends on how urgent your case is. Independent hospitals often take simpler cases.
                </Notice>
                <Notice title="You can usually choose">
                  For a first appointment with a specialist, you can ask your GP to refer you to any provider here that offers the
                  service on the NHS. <Link className="prose-link" href="/right-to-choose">How to ask</Link>
                </Notice>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <Notice title="Nothing close enough">
                {radius < 50 ? (
                  <>
                    Try a wider search: <Link className="prose-link" href={`/planned?${base}&s=${spec.slug}&r=50`}>within 50 miles</Link>, or{" "}
                    <Link className="prose-link" href={`/planned/${spec.slug}`}>see every provider in England</Link>.
                  </>
                ) : (
                  <>
                    <Link className="prose-link" href={`/planned/${spec.slug}`}>See every provider in England</Link> for {spec.name.toLowerCase()}.
                    This data covers England only.
                  </>
                )}
              </Notice>
            </div>
          )}
        </section>
      )}

      {!place && (
        <section className="mt-16" aria-labelledby="by-specialty">
          <h2 id="by-specialty" className="caps">Or browse England by specialty</h2>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTIES.map((s) => (
              <li key={s.slug} className="border-b border-line">
                <Link href={`/planned/${s.slug}`} className="block py-4 hover:underline">
                  <span className="block font-bold">{s.name}</span>
                  <span className="block text-[16px] text-ink-3">{s.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

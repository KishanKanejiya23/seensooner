import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlannedLegend, PlannedList, axisMax } from "@/components/PlannedList";
import { RTT_PERIOD, SPECIALTIES, getSpecialty, national, spread, weeks } from "@/lib/rtt";

export const dynamicParams = false;
export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ specialty: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/planned/[specialty]">): Promise<Metadata> {
  const spec = getSpecialty((await params).specialty);
  if (!spec) return {};
  const sp = spread(spec.code);
  return {
    title: `${spec.name} waiting times at every hospital in England`,
    description: `${spec.blurb}. Median waits from ${sp ? weeks(sp.fastest.median) : "?"} to ${sp ? weeks(sp.slowest.median) : "?"} across ${sp?.count ?? 0} providers, ${RTT_PERIOD}.`,
    alternates: { canonical: `/planned/${spec.slug}` },
  };
}

export default async function SpecialtyPage({ params }: PageProps<"/planned/[specialty]">) {
  const spec = getSpecialty((await params).specialty);
  if (!spec) notFound();
  const all = national(spec.code);
  const sp = spread(spec.code);
  const regions = [...new Set(all.map((r) => r.provider.region ?? "Other"))].sort();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-[16px] text-ink-3">
        <Link href="/planned" className="hover:underline">Planned care</Link> <span aria-hidden="true">/</span> {spec.name}
      </nav>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">{spec.name} waiting times in England</h1>
      <p className="mt-4 max-w-2xl text-[20px] text-ink-2">{spec.blurb}.</p>

      {sp && (
        <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          <div className="bg-paper p-6">
            <dt className="caps">Fastest (200+ waiting)</dt>
            <dd className="num mt-2 text-[30px] font-bold">{weeks(sp.fastest.median)}</dd>
            <dd className="text-[16px] text-ink-2">{sp.fastest.provider.name}</dd>
          </div>
          <div className="bg-paper p-6">
            <dt className="caps">Typical provider</dt>
            <dd className="num mt-2 text-[30px] font-bold">{weeks(sp.typical)}</dd>
            <dd className="text-[16px] text-ink-2">Median of {sp.count} providers</dd>
          </div>
          <div className="bg-paper p-6">
            <dt className="caps">Slowest (200+ waiting)</dt>
            <dd className="num mt-2 text-[30px] font-bold">{weeks(sp.slowest.median)}</dd>
            <dd className="text-[16px] text-ink-2">{sp.slowest.provider.name}</dd>
          </div>
        </dl>
      )}

      <p className="mt-10">
        <Link href={`/planned?s=${spec.slug}`} className="inline-flex min-h-12 items-center rounded bg-ink px-6 font-bold text-paper hover:bg-ink-2">
          Sort these by distance from me
        </Link>
      </p>

      <section className="mt-12" aria-labelledby="fastest">
        <h2 id="fastest" className="text-[24px] font-bold">Fastest 20 in England</h2>
        <div className="mt-4"><PlannedLegend max={axisMax(all.slice(0, 20))} /></div>
        <div className="mt-4"><PlannedList rows={all.slice(0, 20)} showDistance={false} specialtyName={spec.name} /></div>
      </section>

      <section className="mt-16" aria-labelledby="regions">
        <h2 id="regions" className="text-[24px] font-bold">Every provider, by region</h2>
        <p className="mt-2 text-ink-2">{all.length} providers reported {spec.name.toLowerCase()} waits for {RTT_PERIOD}.</p>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {regions.map((region) => {
            const rows = all.filter((r) => (r.provider.region ?? "Other") === region);
            return (
              <details key={region} className="group">
                <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[18px] font-bold hover:underline">
                  <span>
                    {region} <span className="num font-normal text-ink-3">({rows.length})</span>
                  </span>
                  <span className="chev text-ink-3 transition-transform" aria-hidden="true">▾</span>
                </summary>
                <div className="pb-6">
                  <PlannedList rows={rows} showDistance={false} specialtyName={spec.name} />
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

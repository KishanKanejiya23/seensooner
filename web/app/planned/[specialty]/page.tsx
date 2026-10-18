import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PlannedLegend, PlannedList, axisMax } from "@/components/PlannedList";
import { PageBanner, PageLayout } from "@/components/Shell";
import { RTT_PERIOD, RTT_SOURCE, SPECIALTIES, getSpecialty, national, spread, weeks } from "@/lib/rtt";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ specialty: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/planned/[specialty]">): Promise<Metadata> {
  const spec = getSpecialty((await params).specialty);
  if (!spec) return {};
  const sp = spread(spec.code);
  const title = `${spec.name} waiting times at every hospital in England`;
  const description = `${spec.blurb}. Median NHS waits from ${sp ? weeks(sp.fastest.median) : "?"} to ${sp ? weeks(sp.slowest.median) : "?"} across ${sp?.count ?? 0} providers, ${RTT_PERIOD}. Compare and choose.`;
  return { title, description, alternates: { canonical: `/planned/${spec.slug}` }, openGraph: { title, description, url: `/planned/${spec.slug}` } };
}

export default async function SpecialtyPage({ params }: PageProps<"/planned/[specialty]">) {
  const spec = getSpecialty((await params).specialty);
  if (!spec) notFound();
  const all = national(spec.code);
  const sp = spread(spec.code);
  const regions = [...new Set(all.map((r) => r.provider.region ?? "Other"))].sort();
  const top = all.slice(0, 20);

  return (
    <>
      <PageBanner photo="red-chairs" kicker={`England, ${RTT_PERIOD}`} title={`${spec.name} waiting times`} lede={`${spec.blurb}. Every hospital in England that reported waits, quickest first.`} />
      <PageLayout trail={[{ href: "/planned", label: "Planned care" }, { label: spec.name }]} current="/planned">
        {sp && (
          <dl className="grid gap-px bg-line sm:grid-cols-3">
            {[
              { k: "Quickest hospital", v: weeks(sp.fastest.median), d: sp.fastest.provider.name },
              { k: "Typical hospital", v: weeks(sp.typical), d: `Middle of ${sp.count} providers` },
              { k: "Slowest hospital", v: weeks(sp.slowest.median), d: sp.slowest.provider.name },
            ].map((x, i) => (
              <div key={x.k} className={`p-6 ${i === 0 ? "bg-brand-900 text-white" : "bg-well"}`}>
                <dt className={`text-[16px] font-bold ${i === 0 ? "text-saffron" : "text-ink-2"}`}>{x.k}</dt>
                <dd className="num mt-2 text-[30px] font-bold">{x.v}</dd>
                <dd className={`text-[16px] ${i === 0 ? "text-brand-100" : "text-ink-2"}`}>{x.d}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 text-[16px] text-ink-2">Median wait. &ldquo;Quickest&rdquo; and &ldquo;slowest&rdquo; count hospitals with at least 200 people waiting.</p>

        <p className="mt-8">
          <Link href={`/planned?s=${spec.slug}`} className="inline-flex min-h-12 items-center rounded bg-brand-700 px-6 text-[18px] font-bold text-white hover:bg-brand-900">
            Find the quickest near me
          </Link>
        </p>

        <section className="mt-14" aria-labelledby="fastest">
          <h2 id="fastest" className="text-[24px] sm:text-[30px]">
            The 20 quickest in England
          </h2>
          <div className="mt-4">
            <PlannedLegend max={axisMax(top)} />
          </div>
          <div className="mt-4">
            <PlannedList rows={top} showDistance={false} specialtyName={spec.name} />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="regions">
          <h2 id="regions" className="text-[24px] sm:text-[30px]">
            Every hospital, by region
          </h2>
          <p className="mt-2 text-ink-2">
            {all.length} providers reported {spec.name.toLowerCase()} waits for {RTT_PERIOD}.
          </p>
          <div className="mt-6 border-t border-line">
            {regions.map((region) => {
              const rows = all.filter((r) => (r.provider.region ?? "Other") === region);
              return (
                <details key={region} className="border-b border-line">
                  <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[20px] font-bold hover:text-brand-600">
                    <span>
                      {region} <span className="num font-normal text-ink-3">({rows.length})</span>
                    </span>
                    <span className="chev text-[16px] text-ink-3 transition-transform" aria-hidden="true">▼</span>
                  </summary>
                  <div className="pb-8">
                    <PlannedList rows={rows} showDistance={false} specialtyName={spec.name} />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </PageLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `${spec.name} waiting times by hospital in England, ${RTT_PERIOD}`,
          description: `Median, 92nd percentile and share within 18 weeks for ${spec.name.toLowerCase()} referral-to-treatment waits at ${all.length} providers in England.`,
          url: `${SITE_URL}/planned/${spec.slug}`,
          isBasedOn: RTT_SOURCE.url,
          license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
          spatialCoverage: { "@type": "Place", name: "England" },
          temporalCoverage: RTT_PERIOD,
          creator: { "@id": `${SITE_URL}/#org` },
        }}
      />
    </>
  );
}

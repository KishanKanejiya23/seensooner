import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RangeBar, Sparkline, Trend, weeksTone } from "@/components/Bars";
import { ALL_PROVIDERS, RTT_MONTHS, RTT_PERIOD, RTT_SOURCE, getProvider, monthLabel, providerWaits, rankFor, weeks } from "@/lib/rtt";

export const dynamicParams = false;
export function generateStaticParams() {
  return ALL_PROVIDERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hospital/[slug]">): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} waiting times`,
    description: `How long ${p.name} is taking for planned care, by specialty, with 12-month trends. NHS England data for ${RTT_PERIOD}.`,
    alternates: { canonical: `/hospital/${p.slug}` },
  };
}

export default async function HospitalPage({ params }: PageProps<"/hospital/[slug]">) {
  const p = getProvider((await params).slug);
  if (!p) notFound();
  const waits = providerWaits(p.code);
  const total = waits.find((w) => w.s === "C_999");
  const specs = waits.filter((w) => w.s !== "C_999");
  const max = Math.min(52, Math.max(12, ...specs.map((w) => Math.ceil(w.p92))));
  const near = p.lat != null ? `lat=${p.lat}&lng=${p.lng}` : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-[16px] text-ink-3">
        <Link href="/hospitals" className="hover:underline">Hospitals</Link> <span aria-hidden="true">/</span> {p.region ?? "England"}
      </nav>
      <h1 className="mt-3 max-w-4xl text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">{p.name}</h1>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[18px] text-ink-2">
        <span className="font-bold">{p.nhs ? "NHS trust" : "Independent provider, treating NHS patients"}</span>
        {p.town && <span>{p.town}{p.postcode ? `, ${p.postcode}` : ""}</span>}
        <span className="text-ink-3">ODS code <span className="num">{p.code}</span></span>
      </p>

      {total && (
        <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          <div className="bg-paper p-6">
            <dt className="caps">Waiting now</dt>
            <dd className="num mt-2 text-[30px] font-bold">{total.total.toLocaleString("en-GB")}</dd>
          </div>
          <div className="bg-paper p-6">
            <dt className="caps">Median wait</dt>
            <dd className="num mt-2 text-[30px] font-bold">{weeks(total.median)}</dd>
          </div>
          <div className="bg-paper p-6">
            <dt className="caps">Within 18 weeks</dt>
            <dd className="num mt-2 text-[30px] font-bold">{Math.round(total.within18)}%</dd>
            <dd className="text-[14px] text-ink-3">NHS standard: 92%</dd>
          </div>
          <div className="bg-paper p-6">
            <dt className="caps">Over a year</dt>
            <dd className="num mt-2 text-[30px] font-bold">{total.over52.toLocaleString("en-GB")}</dd>
          </div>
        </dl>
      )}

      <section className="mt-14" aria-labelledby="by-spec">
        <h2 id="by-spec" className="text-[24px] font-bold">By specialty</h2>
        <p className="mt-2 text-ink-2">
          Median wait of people on the list at the end of {RTT_PERIOD}. Rank is out of every provider in England for that specialty
          (1 is fastest).
        </p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {specs.map((w) => {
            const { rank, of } = rankFor(w);
            return (
              <li key={w.s} className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_150px] md:items-center md:gap-8">
                <div>
                  <p className="text-[18px] font-bold">{w.specialty.name}</p>
                  <p className="text-[14px] text-ink-3">
                    <span className="num">{w.total.toLocaleString("en-GB")}</span> waiting · ranked <span className="num">{rank}</span> of{" "}
                    <span className="num">{of}</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="num text-[24px] font-bold">{weeks(w.median)}</span>
                    <span className="text-[14px] text-ink-3">
                      <span className="num">{Math.round(w.within18)}%</span> within 18 weeks
                    </span>
                  </div>
                  <div className="mt-2"><RangeBar median={w.median} p92={w.p92} max={max} tone={weeksTone(w.median)} /></div>
                  <p className="mt-2 text-[14px]"><Trend values={w.trend} /></p>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-start">
                  <Sparkline values={w.trend} label={`Median ${w.specialty.name} wait from ${monthLabel(RTT_MONTHS[0])} to ${RTT_PERIOD}`} />
                  {near && (
                    <Link href={`/planned?${near}&s=${w.specialty.slug}`} className="text-[16px] font-bold text-act hover:underline">
                      Compare nearby
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-10 max-w-3xl text-[16px] text-ink-3">
        Source: <a className="prose-link" href={RTT_SOURCE.url}>{RTT_SOURCE.name}</a>, {RTT_PERIOD}. Figures are for patients whose
        treatment is NHS-funded. Specialties with fewer than 20 people waiting are left out.
      </p>
    </div>
  );
}

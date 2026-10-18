import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RangeBar, Sparkline, Trend, weeksTone } from "@/components/Bars";
import { JsonLd } from "@/components/JsonLd";
import { PageBanner, PageLayout } from "@/components/Shell";
import { ALL_PROVIDERS, RTT_MONTHS, RTT_PERIOD, RTT_SOURCE, getProvider, monthLabel, providerWaits, rankFor, weeks } from "@/lib/rtt";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return ALL_PROVIDERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hospital/[slug]">): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  const total = providerWaits(p.code).find((w) => w.s === "C_999");
  const title = `${p.name} waiting times`;
  const description = `${p.name}${p.town ? `, ${p.town}` : ""}: ${total ? `median wait ${weeks(total.median)}, ${Math.round(total.within18)}% seen within 18 weeks. ` : ""}Waits by specialty with 12-month trends, NHS England data for ${RTT_PERIOD}.`;
  return { title, description, alternates: { canonical: `/hospital/${p.slug}` }, openGraph: { title, description, url: `/hospital/${p.slug}` } };
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
    <>
      <PageBanner
        photo={p.nhs ? "clinic" : "blue-chairs"}
        kicker={p.nhs ? "NHS trust" : "Independent provider treating NHS patients"}
        title={p.name}
        lede={[p.town, p.postcode].filter(Boolean).join(", ") || undefined}
      />
      <PageLayout trail={[{ href: "/hospitals", label: "Hospitals" }, { label: p.name }]} current="/hospitals">
        {total && (
          <dl className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
            {[
              { k: "People waiting", v: total.total.toLocaleString("en-GB") },
              { k: "Median wait", v: weeks(total.median) },
              { k: "Within 18 weeks", v: `${Math.round(total.within18)}%`, d: "NHS standard: 92%" },
              { k: "Waiting over a year", v: total.over52.toLocaleString("en-GB") },
            ].map((x, i) => (
              <div key={x.k} className={`p-6 ${i === 1 ? "bg-brand-900 text-white" : "bg-well"}`}>
                <dt className={`text-[16px] font-bold ${i === 1 ? "text-saffron" : "text-ink-2"}`}>{x.k}</dt>
                <dd className="num mt-2 text-[30px] font-bold">{x.v}</dd>
                {x.d && <dd className="text-[14px] text-ink-2">{x.d}</dd>}
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 text-[16px] text-ink-2">All specialties together, end of {RTT_PERIOD}.</p>

        <section className="mt-14" aria-labelledby="by-spec">
          <h2 id="by-spec" className="text-[24px] sm:text-[30px]">
            Waiting times by specialty
          </h2>
          <p className="mt-2 text-ink-2">
            Median wait of people on the list. The rank is out of every provider in England for that specialty, where 1 is the quickest.
          </p>
          <ul className="@container mt-6 border-t-4 border-brand-700">
            {specs.map((w) => {
              const { rank, of } = rankFor(w);
              return (
                <li key={w.s} className="grid gap-4 border-b border-line py-6 @2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] @2xl:items-center @2xl:gap-8 @3xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_140px]">
                  <div>
                    <h3 className="text-[20px]">
                      <Link href={`/planned/${w.specialty.slug}`} className="link font-bold">
                        {w.specialty.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-[16px] text-ink-2">
                      <span className="num">{w.total.toLocaleString("en-GB")}</span> waiting · ranked <span className="num">{rank}</span> of{" "}
                      <span className="num">{of}</span>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <strong className="num text-[24px]">{weeks(w.median)}</strong>
                      <span className="text-[14px] text-ink-2">
                        <span className="num">{Math.round(w.within18)}%</span> within 18 weeks
                      </span>
                    </div>
                    <div className="mt-2">
                      <RangeBar median={w.median} p92={w.p92} max={max} tone={weeksTone(w.median)} />
                    </div>
                    <p className="mt-2 text-[16px] font-bold">
                      <Trend values={w.trend} />
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 @3xl:flex-col @3xl:items-start">
                    <Sparkline values={w.trend} label={`Median ${w.specialty.name} wait from ${monthLabel(RTT_MONTHS[0])} to ${RTT_PERIOD}`} />
                    {near && (
                      <Link href={`/planned?${near}&s=${w.specialty.slug}`} className="text-[16px] font-bold text-brand-600 underline underline-offset-4">
                        Compare nearby
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-10 max-w-[860px] text-[16px] text-ink-2">
          Source: <a className="link" href={RTT_SOURCE.url}>{RTT_SOURCE.name}</a>, {RTT_PERIOD}. Figures are for patients whose treatment is
          NHS-funded. Specialties with fewer than 20 people waiting are left out. ODS code <span className="num">{p.code}</span>.
        </p>
      </PageLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": p.nhs ? "Hospital" : "MedicalOrganization",
          name: p.name,
          url: `${SITE_URL}/hospital/${p.slug}`,
          identifier: { "@type": "PropertyValue", propertyID: "ODS", value: p.code },
          ...(p.postcode ? { address: { "@type": "PostalAddress", postalCode: p.postcode, addressLocality: p.town ?? undefined, addressCountry: "GB" } } : {}),
          ...(p.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
        }}
      />
    </>
  );
}

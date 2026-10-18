import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { Notice } from "@/components/Notice";
import { PageBanner, PageLayout } from "@/components/Shell";
import { SiteSearch } from "@/components/SiteHeader";
import { findPlace } from "@/lib/geo";
import { ALL_PROVIDERS } from "@/lib/rtt";

// Search results are thin, personal pages: keep them out of the index, but follow their links.
export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function Search({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 80) ?? "";
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const hospitals = words.length
    ? ALL_PROVIDERS.filter((p) => words.every((w) => `${p.name} ${p.town ?? ""}`.toLowerCase().includes(w))).slice(0, 20)
    : [];
  const place = q ? await findPlace(q) : null;
  const enc = encodeURIComponent(q);

  return (
    <>
      <PageBanner photo="waiting-room" title={q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"} />
      <PageLayout trail={[{ label: "Search" }]}>
        <div className="max-w-[720px]">
          <SiteSearch id="page-search" size="lg" />
        </div>

        {place && (
          <section className="mt-12" aria-labelledby="near">
            <h2 id="near" className="text-[30px]">
              Near {place.label}
            </h2>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {[
                { href: `/now?q=${enc}`, t: "Urgent care waits now", d: "A&E, urgent treatment centres and minor injuries units, live." },
                { href: `/planned?q=${enc}`, t: "Planned care waits", d: "How long hospitals are taking for operations and specialists." },
              ].map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="group block h-full border-b-4 border-saffron bg-well p-6 hover:bg-well-2">
                    <span className="flex items-center justify-between gap-4 text-[22px] font-bold text-brand-700 group-hover:underline">
                      {x.t} <ArrowIcon className="h-6 w-6 shrink-0" />
                    </span>
                    <span className="mt-2 block text-[18px] text-ink-2">{x.d}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hospitals.length > 0 && (
          <section className="mt-12" aria-labelledby="hosp">
            <h2 id="hosp" className="text-[30px]">
              Hospitals matching &ldquo;{q}&rdquo;
            </h2>
            <ul className="mt-4 border-t-4 border-brand-700">
              {hospitals.map((p) => (
                <li key={p.code} className="border-b border-line">
                  <Link href={`/hospital/${p.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                    <span>
                      <span className="block text-[18px] font-bold text-brand-600 group-hover:underline">{p.name}</span>
                      <span className="block text-[16px] text-ink-2">{[p.nhs ? "NHS trust" : "Independent, NHS-funded", p.town, p.region].filter(Boolean).join(" · ")}</span>
                    </span>
                    <ArrowIcon className="h-5 w-5 shrink-0 text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {q && !place && hospitals.length === 0 && (
          <div className="mt-10">
            <Notice title={`Nothing found for "${q}"`} tone="warn">
              Try a postcode (like B71 4HJ), a town (like Leeds), or part of a hospital&apos;s name (like Royal Free). Or{" "}
              <Link className="link" href="/hospitals">browse every hospital</Link>.
            </Notice>
          </div>
        )}
      </PageLayout>
    </>
  );
}

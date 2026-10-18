import Image from "next/image";
import Link from "next/link";
import { RangeBar, weeksTone } from "@/components/Bars";
import { ArrowIcon, ClockIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { TimestampPanel } from "@/components/LiveBlocks";
import { MissionBand } from "@/components/Mission";
import { SearchPanel } from "@/components/SearchPanel";
import { BannerPhoto, EmergencyBox } from "@/components/Shell";
import { fmtWaitLong, getLive, snapshotTime } from "@/lib/live-cache";
import { RTT_PERIOD, SPECIALTIES, gapStory, spread, weeks } from "@/lib/rtt";
import { SITE_URL } from "@/lib/site";
import { WHERE_TO_GO } from "@/lib/where";

export const revalidate = 300;

const TILES = [
  { href: "/now", photo: "ambulance", title: "Urgent care now", text: "Live waits at A&E, urgent treatment centres and minor injuries units near you." },
  { href: "/planned", photo: "red-chairs", title: "Waiting for an operation", text: "How long every hospital in England is taking, for 20 specialties." },
  { href: "/right-to-choose", photo: "blue-chairs", title: "Your right to choose", text: "You can ask to be referred somewhere quicker. Here's how, in three steps." },
];

export default async function Home() {
  const story = gapStory("C_110", "London", 15);
  const ortho = spread("C_110");
  const eyes = spread("C_130");
  const specs = SPECIALTIES.map((s) => ({ slug: s.slug, name: s.name }));
  const { sites } = await getLive();
  const now = snapshotTime();
  const board = pickBoard(sites);

  return (
    <>
      <div className="banner">
        <BannerPhoto photo="waiting-room" />
        <div className="mx-auto max-w-[1320px] px-4 pb-32 pt-12 sm:px-8 sm:pt-16 lg:pb-40 lg:pt-20">
          <div className="marker max-w-[820px] bg-brand-900 px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-[16px] font-bold text-saffron">Free and independent · Built on public NHS data</p>
            <h1 className="mt-3 text-[36px] sm:text-[48px] lg:text-[56px]">Find out how long you&apos;ll wait, before you go.</h1>
            <p className="mt-4 text-[18px] text-brand-100 sm:text-[20px]">
              Live waits at A&amp;E and urgent care near you, and how long every hospital in England is taking for operations and
              specialist appointments.
            </p>
          </div>
        </div>
      </div>

      {/* The search box overlaps the photo: the one thing to do on this page sits at the seam. */}
      <div className="mx-auto -mt-24 max-w-[1320px] px-4 sm:px-8 lg:-mt-28">
        <div className="rise relative bg-white p-2 shadow-[0_24px_48px_-24px_rgb(5_43_40/0.45)]" style={{ animationDelay: "120ms" }}>
          <SearchPanel specialties={specs} />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16 lg:py-20">
        <section aria-labelledby="right-now">
          <h2 id="right-now" className="text-[30px] sm:text-[36px]">
            Shortest waits right now
          </h2>
          <p className="mt-2 text-[18px] text-ink-2">
            Across the {sites.length} sites we track. Your nearest may be different: search above to sort by distance.
          </p>
          <div className="mt-6">
            <TimestampPanel now={now} href="/" />
          </div>
          <ul className="border-b-4 border-ember bg-well">
            {board.map((s) => (
              <li key={s.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/now?lat=${s.lat.toFixed(4)}&lng=${s.lng.toFixed(4)}`}
                  className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-well-2 sm:grid-cols-[auto_1fr_auto] sm:px-6"
                >
                  <ClockIcon className="row-span-2 h-8 w-8 text-ember sm:row-span-1" />
                  <span className="min-w-0">
                    <span className="block text-[18px] font-bold group-hover:underline">{s.name}</span>
                    <span className="block text-[16px] text-ink-2">
                      {s.kind === "UTC" ? "Urgent treatment centre" : "A&E"} · {s.region ?? s.nation}
                    </span>
                  </span>
                  <strong className="num col-start-2 text-[20px] sm:col-start-auto">{fmtWaitLong(s)}</strong>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/now" className="mt-6 inline-flex min-h-12 items-center gap-2 text-[18px] font-bold text-brand-600 underline underline-offset-4 hover:text-brand-900">
            See every live wait, by area <ArrowIcon className="h-5 w-5" />
          </Link>
        </section>

        <section aria-labelledby="where" className="space-y-6">
          <h2 id="where" className="text-[30px] sm:text-[36px]">
            Not sure where to go?
          </h2>
          <p className="text-[18px] text-ink-2">The right place first is usually the quickest way to be seen.</p>
          <ul className="border-t border-line">
            {WHERE_TO_GO.filter((o) => !o.urgent).map((o) => (
              <li key={o.id} className="border-b border-line">
                <a href={o.id === "ae" || o.id === "utc" ? "/where-to-go" : o.action.href} className="group flex items-start justify-between gap-4 py-4">
                  <span>
                    <span className="block text-[18px] font-bold text-brand-600 underline-offset-4 group-hover:underline">{o.service}</span>
                    <span className="block text-[16px] text-ink-2">{o.when}</span>
                  </span>
                  <ArrowIcon className="mt-1 h-5 w-5 shrink-0 text-ink-3" />
                </a>
              </li>
            ))}
          </ul>
          <EmergencyBox />
        </section>
      </div>

      {story && (
        <section aria-labelledby="gap" className="bg-well">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-24">
            <div className="min-w-0">
              <p className="text-[16px] font-bold uppercase tracking-[0.08em] text-brand-600">What most people are never told</p>
              <h2 id="gap" className="mt-3 text-[30px] sm:text-[40px]">
                The same care can take <span className="text-quick-ink">{weeks(story.fast.median)}</span> at one hospital and{" "}
                <span className="text-long-ink">{weeks(story.slow.median)}</span> at another.
              </h2>
              <p className="mt-6 text-[18px] text-ink-2">
                Half the people waiting for orthopaedic care, such as a hip or knee replacement, at{" "}
                <strong className="text-ink">{story.fast.provider.name}</strong> have waited {weeks(story.fast.median)} or less. At{" "}
                <strong className="text-ink">{story.slow.provider.name}</strong>, <span className="num">{story.apart.toFixed(0)}</span> miles away,
                it&apos;s {weeks(story.slow.median)}.
              </p>
              <p className="mt-4 text-[18px] text-ink-2">
                In England you have a legal right to choose where you&apos;re referred for most planned care, including private hospitals that
                treat NHS patients for free.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/right-to-choose" className="inline-flex min-h-12 items-center rounded bg-brand-700 px-6 text-[18px] font-bold text-white hover:bg-brand-900">
                  How to ask your GP
                </Link>
                <Link href="/planned" className="inline-flex min-h-12 items-center rounded border-2 border-brand-700 bg-white px-6 text-[18px] font-bold text-brand-700 hover:bg-brand-50">
                  Compare hospitals near me
                </Link>
              </div>
            </div>

            <figure className="min-w-0 border-t-4 border-brand-700 bg-white p-6 sm:p-8">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[20px] font-bold">Orthopaedics in London</span>
                <span className="text-[16px] text-ink-3">Median wait, {RTT_PERIOD}</span>
              </figcaption>
              <ul className="mt-6 space-y-4">
                {story.list
                  .slice(0, 5)
                  .concat(story.list.slice(-3))
                  .map((r, i) => (
                    <li key={r.p} className={i === 5 ? "border-t-2 border-dashed border-line pt-4" : ""}>
                      <div className="flex items-baseline justify-between gap-4 text-[16px]">
                        <Link href={`/hospital/${r.provider.slug}`} className="truncate hover:underline">
                          {r.provider.name}
                        </Link>
                        <span className="num shrink-0 font-bold">{weeks(r.median)}</span>
                      </div>
                      <div className="mt-2">
                        <RangeBar median={r.median} max={Math.ceil(story.list[story.list.length - 1].median)} tone={weeksTone(r.median)} />
                      </div>
                    </li>
                  ))}
              </ul>
              <p className="mt-6 text-[14px] text-ink-3">
                Fastest five and slowest three of {story.list.length} London providers with 300 or more people waiting. Source: NHS England.
              </p>
            </figure>
          </div>

          {ortho && eyes && (
            <div className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-8 lg:pb-24">
              <ul className="grid gap-px bg-line sm:grid-cols-3">
                {[
                  { k: "Hip, knee and joint care", v: ortho, href: "/planned/orthopaedics" },
                  { k: "Eye care, including cataracts", v: eyes, href: "/planned/ophthalmology" },
                ].map(({ k, v, href }) => (
                  <li key={k} className="bg-white">
                    <Link href={href} className="block h-full p-6 hover:bg-brand-50">
                      <span className="block text-[18px] font-bold">{k} across England</span>
                      <span className="num mt-3 block text-[24px] font-bold">
                        {weeks(v.fastest.median)} to {weeks(v.slowest.median)}
                      </span>
                      <span className="mt-1 block text-[16px] text-ink-2">
                        Median wait across <span className="num">{v.count}</span> providers. Typical: {weeks(v.typical)}.
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="bg-white">
                  <Link href="/planned" className="flex h-full flex-col justify-between p-6 hover:bg-brand-50">
                    <span className="text-[18px] font-bold">{SPECIALTIES.length - 1} specialties, 506 hospitals</span>
                    <span className="mt-4 inline-flex items-center gap-2 font-bold text-brand-600">
                      Compare by specialty <ArrowIcon className="h-5 w-5" />
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="popular" className="mx-auto max-w-[1320px] px-4 py-16 sm:px-8 lg:py-24">
        <h2 id="popular" className="text-[30px] sm:text-[36px]">
          How can we help today?
        </h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-3">
          {TILES.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="group block h-full border-b-4 border-saffron bg-well hover:bg-well-2">
                <span className="block aspect-[16/9] overflow-hidden bg-brand-800">
                  <Image
                    src={`/photos/${t.photo}.webp`}
                    alt=""
                    width={640}
                    height={360}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="block p-6">
                  <span className="flex items-center justify-between gap-4 text-[24px] font-bold text-brand-700 group-hover:underline">
                    {t.title} <ArrowIcon className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-2 block text-[18px] text-ink-2">{t.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MissionBand />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${SITE_URL}/#home`,
          url: SITE_URL,
          name: "Compare NHS waiting times near you",
          isPartOf: { "@id": `${SITE_URL}/#site` },
          about: [
            { "@type": "Thing", name: "NHS A&E waiting times" },
            { "@type": "Thing", name: "NHS referral to treatment waiting times" },
          ],
          inLanguage: "en-GB",
        }}
      />
    </>
  );
}

/** Five shortest exact A&E / UTC waits, one per trust so no single area fills the list. */
function pickBoard(sites: Awaited<ReturnType<typeof getLive>>["sites"]) {
  const exact = sites
    .filter((s) => s.waitMinutes != null && !s.waitBand && (s.kind === "AE" || s.kind === "UTC"))
    .sort((a, b) => a.waitMinutes! - b.waitMinutes!);
  const trusts = new Set<string>();
  return exact.filter((s) => !trusts.has(s.trust) && trusts.add(s.trust)).slice(0, 5);
}

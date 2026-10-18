import Link from "next/link";
import { RangeBar, weeksTone } from "@/components/Bars";
import { LiveBoard } from "@/components/LiveBoard";
import { SearchPanel } from "@/components/SearchPanel";
import { getLive } from "@/lib/live-cache";
import { RTT_PERIOD, SPECIALTIES, gapStory, spread, weeks } from "@/lib/rtt";
import { WHERE_TO_GO } from "@/lib/where";

export default async function Home() {
  const story = gapStory("C_110", "London", 15);
  const ortho = spread("C_110");
  const eyes = spread("C_130");
  const specs = SPECIALTIES.map((s) => ({ slug: s.slug, name: s.name }));
  const { sites } = await getLive();
  const board = pickBoard(sites);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <p className="caps">Independent · Built on public NHS data</p>
            <h1 className="mt-4 max-w-3xl text-[36px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[64px]">
              Find where you&apos;ll be seen sooner.
            </h1>
            <p className="mt-6 max-w-2xl text-[20px] leading-relaxed text-ink-2">
              Live waits at A&amp;E and urgent care near you, and how long every hospital in England is taking for operations and
              specialist appointments.
            </p>
          </div>
          {board.length > 0 && (
            <div className="hidden min-w-0 lg:block">
              <LiveBoard sites={board} total={sites.length} />
            </div>
          )}
        </div>
        <div className="mt-10">
          <SearchPanel specialties={specs} />
        </div>
      </section>

      {story && (
        <section aria-labelledby="gap" className="border-y border-line bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.1fr]">
            <div className="min-w-0">
              <p className="caps">The gap nobody tells you about</p>
              <h2 id="gap" className="mt-4 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">
                Bones and joints: <span className="text-quick-ink">{weeks(story.fast.median)}</span> at one hospital,{" "}
                <span className="text-long-ink">{weeks(story.slow.median)}</span> at another.
              </h2>
              <p className="mt-6 max-w-xl text-[18px] text-ink-2">
                Half the people waiting for orthopaedic care, such as a hip or knee replacement, at <strong className="text-ink">{story.fast.provider.name}</strong>{" "}
                have waited {weeks(story.fast.median)} or less. At <strong className="text-ink">{story.slow.provider.name}</strong>,{" "}
                <span className="num">{story.apart.toFixed(0)}</span> miles away, it&apos;s {weeks(story.slow.median)}.
              </p>
              <p className="mt-4 max-w-xl text-[18px] text-ink-2">
                In England you have a legal right to choose where you&apos;re referred for most planned care, including private
                hospitals that treat NHS patients for free. Most people are never told.
              </p>
              <Link href="/right-to-choose" className="mt-8 inline-flex min-h-12 items-center rounded bg-act px-6 font-bold text-act-ink hover:opacity-90">
                How to ask your GP
              </Link>
            </div>

            <figure className="min-w-0">
              <figcaption className="flex items-baseline justify-between gap-4 text-[14px] text-ink-3">
                <span className="font-bold text-ink-2">Orthopaedics, London. Median wait.</span>
                <span>{RTT_PERIOD}</span>
              </figcaption>
              <ul className="mt-4 space-y-3">
                {story.list.slice(0, 6).concat(story.list.slice(-3)).map((r, i, arr) => (
                  <li key={r.p} className={i === 6 && arr.length > 6 ? "border-t border-dashed border-line pt-3" : ""}>
                    <div className="flex items-baseline justify-between gap-4 text-[16px]">
                      <span className="truncate">{r.provider.name}</span>
                      <span className="num shrink-0 font-bold">{weeks(r.median)}</span>
                    </div>
                    <div className="mt-1">
                      <RangeBar median={r.median} max={Math.ceil(story.list[story.list.length - 1].median)} tone={weeksTone(r.median)} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] text-ink-3">
                Fastest six and slowest three of {story.list.length} London providers with 300 or more people waiting.
              </p>
            </figure>
          </div>
        </section>
      )}

      <section aria-labelledby="numbers" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 id="numbers" className="caps">Across England, {RTT_PERIOD}</h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {[ortho && { k: "Orthopaedics", v: ortho, href: "/planned/orthopaedics" }, eyes && { k: "Eyes", v: eyes, href: "/planned/ophthalmology" }]
            .filter(Boolean)
            .map((x) => {
              const { k, v, href } = x as { k: string; v: NonNullable<typeof ortho>; href: string };
              return (
                <Link key={k} href={href} className="block bg-paper p-6 hover:bg-paper-2">
                  <dt className="text-[16px] font-bold">{k}</dt>
                  <dd className="mt-3">
                    <span className="num text-[24px] font-bold">{weeks(v.fastest.median)}</span>
                    <span className="text-ink-3"> to </span>
                    <span className="num text-[24px] font-bold">{weeks(v.slowest.median)}</span>
                  </dd>
                  <dd className="mt-2 text-[16px] text-ink-2">
                    Median wait across <span className="num">{v.count}</span> providers. Typical: {weeks(v.typical)}.
                  </dd>
                </Link>
              );
            })}
          <Link href="/planned" className="flex flex-col justify-between bg-paper p-6 hover:bg-paper-2">
            <span className="text-[16px] font-bold">{SPECIALTIES.length - 1} specialties, 500+ hospitals</span>
            <span className="mt-6 font-bold text-act">Compare by specialty →</span>
          </Link>
        </dl>
      </section>

      <section aria-labelledby="where" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="caps">Not sure where to go?</p>
            <h2 id="where" className="mt-3 text-[30px] font-bold tracking-[-0.02em] sm:text-[36px]">
              The right place is often the quickest.
            </h2>
          </div>
          <Link href="/where-to-go" className="font-bold text-act hover:underline">
            Full guide →
          </Link>
        </div>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {WHERE_TO_GO.map((o) => (
            <li key={o.id} className="grid gap-2 py-5 sm:grid-cols-[260px_1fr_auto] sm:items-baseline sm:gap-8">
              <span className={`text-[18px] font-bold ${o.urgent ? "text-sos" : ""}`}>{o.service}</span>
              <span className="text-ink-2">{o.when}</span>
              <a href={o.action.href} className="font-bold text-act hover:underline">
                {o.action.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** The five shortest exact A&E / UTC waits, one per trust so no single area fills the board. */
function pickBoard(sites: Awaited<ReturnType<typeof getLive>>["sites"]) {
  const exact = sites
    .filter((s) => s.waitMinutes != null && !s.waitBand && (s.kind === "AE" || s.kind === "UTC"))
    .sort((a, b) => a.waitMinutes! - b.waitMinutes!);
  const trusts = new Set<string>();
  return exact.filter((s) => !trusts.has(s.trust) && trusts.add(s.trust)).slice(0, 5);
}

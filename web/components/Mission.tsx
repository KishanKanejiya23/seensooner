import Link from "next/link";
import { AIM, BEVAN } from "@/lib/mission";

/** The quote band: big saffron quote marks on deep teal, one real quote, our aim beside it. */
export function MissionBand({ withLink = true }: { withLink?: boolean }) {
  return (
    <section aria-labelledby="aim" className="bg-brand-900 text-white">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-24">
        <figure>
          <span aria-hidden="true" className="block h-16 text-[120px] font-bold leading-none text-saffron">
            &ldquo;
          </span>
          <blockquote className="mt-2 text-[24px] font-bold leading-snug sm:text-[30px]">
            <p>{BEVAN.quote}</p>
          </blockquote>
          <figcaption className="mt-6 text-[18px] text-brand-100">
            <strong className="text-white">{BEVAN.who}</strong>, {BEVAN.where}
          </figcaption>
        </figure>
        <div>
          <p className="text-[16px] font-bold uppercase tracking-[0.08em] text-saffron">Our aim</p>
          <h2 id="aim" className="mt-3 text-[30px] sm:text-[36px]">
            {AIM.title}
          </h2>
          <div className="mt-6 space-y-4 text-[18px] text-brand-100">
            {AIM.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-6 border-l-4 border-saffron pl-4 text-[18px] italic text-white">{AIM.sign}</p>
          {withLink && (
            <Link href="/about" className="mt-8 inline-flex min-h-12 items-center rounded bg-white px-6 font-bold text-brand-900 hover:bg-saffron">
              Read why we built it
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

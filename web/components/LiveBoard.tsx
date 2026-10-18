import Link from "next/link";
import type { LiveSite } from "@/lib/live/types.ts";
import { ago, snapshotTime } from "@/lib/live-cache";

const KIND: Record<LiveSite["kind"], string> = { AE: "A&E", CHILDREN_AE: "Child A&E", UTC: "UTC", MIU: "MIU" };

/**
 * A departures board: the UK's most familiar "how long until" display.
 * It's a glance, not a decision tool; the button leads to a local search.
 */
export function LiveBoard({ sites, total }: { sites: LiveSite[]; total: number }) {
  const now = snapshotTime();
  const newest = sites.map((s) => s.sourceUpdatedAt ?? s.fetchedAt).sort().at(-1) ?? null;
  return (
    <figure className="overflow-hidden rounded-xl bg-[#15171c] text-[#f1efea] shadow-lift">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <span className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.12em]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4cc77f] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4cc77f]" />
          </span>
          Shortest waits now
        </span>
        <span className="text-[14px] text-[#b9bcc3]">
          {total} sites{newest ? ` · ${ago(newest, now)?.text}` : ""}
        </span>
      </figcaption>
      <table className="w-full table-fixed text-left">
        <caption className="sr-only">A sample of current urgent care waits</caption>
        <thead className="text-[12px] uppercase tracking-[0.12em] text-[#9da1aa]">
          <tr>
            <th scope="col" className="px-5 pb-2 pt-4 font-bold">Site</th>
            <th scope="col" className="w-20 px-2 pb-2 pt-4 font-bold">Type</th>
            <th scope="col" className="w-28 px-5 pb-2 pt-4 text-right font-bold">Wait</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.id} className="border-t border-white/5">
              <td className="truncate px-5 py-3 text-[16px]" title={`${s.name}, ${s.trust}`}>
                {s.name}
                <span className="block truncate text-[12px] text-[#9da1aa]">{s.region ?? s.nation}</span>
              </td>
              <td className="num px-2 py-3 text-[14px] text-[#b9bcc3]">{KIND[s.kind]}</td>
              <td className="num whitespace-nowrap px-5 py-3 text-right text-[18px] font-bold text-[#f3c969]">
                {s.waitMinutes != null ? short(s.waitMinutes) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-white/10 px-5 py-4">
        <Link href="/now" className="text-[16px] font-bold text-[#7fd8cb] hover:underline">
          See every live wait →
        </Link>
      </div>
    </figure>
  );
}

const short = (m: number) => (m < 60 ? `${Math.round(m)}m` : `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, "0")}m`);

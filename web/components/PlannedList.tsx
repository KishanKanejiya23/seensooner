import Link from "next/link";
import { RangeBar, Sparkline, weeksTone } from "@/components/Bars";
import type { Row } from "@/lib/rtt";
import { weeks } from "@/lib/rtt";

/**
 * Every result shares one axis, so the eye compares bar lengths straight
 * down the list. The axis stops at 52 weeks; longer whiskers are clipped.
 */
export const axisMax = (rows: Row[]) => Math.min(52, Math.max(12, ...rows.map((r) => Math.ceil(r.p92))));

export function PlannedList({
  rows,
  showDistance = true,
  specialtyName,
  offset = 0,
  best = rows[0]?.median,
  max = axisMax(rows),
}: {
  rows: Row[];
  showDistance?: boolean;
  specialtyName: string;
  /** For a continuation list: numbering and the "vs fastest" baseline carry on. */
  offset?: number;
  best?: number;
  max?: number;
}) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {rows.map((r, i) => {
        const tone = weeksTone(r.median);
        const n = i + offset;
        const extra = best != null && n > 0 ? r.median - best : 0;
        return (
          <li key={r.p}>
            <Link
              href={`/hospital/${r.provider.slug}`}
              className="group grid grid-cols-[32px_1fr] gap-x-3 gap-y-3 px-1 py-5 hover:bg-paper-2 sm:grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1fr)_120px] sm:items-center sm:gap-x-6 sm:px-3"
            >
              <span className="num pt-1 text-[16px] text-ink-3 sm:pt-0">{String(n + 1).padStart(2, "0")}</span>

              <span className="min-w-0">
                <span className="block text-[18px] font-bold leading-snug group-hover:underline">{r.provider.name}</span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-ink-3">
                  <span className={r.provider.nhs ? "" : "font-bold text-ink-2"}>{r.provider.nhs ? "NHS trust" : "Independent, NHS-funded"}</span>
                  {showDistance && r.distance != null && <span className="num">{r.distance.toFixed(1)} mi</span>}
                  {r.provider.town && <span>{r.provider.town}</span>}
                </span>
              </span>

              <span className="col-start-2 sm:col-start-auto">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="num text-[24px] font-bold leading-none">{weeks(r.median)}</span>
                  <span className="text-[14px] text-ink-3">
                    {extra >= 1 ? <span className="num">+{Math.round(extra)} wk vs fastest</span> : n === 0 ? "Fastest here" : null}
                  </span>
                </span>
                <span className="mt-2 block">
                  <RangeBar median={r.median} p92={r.p92} max={max} tone={tone} />
                </span>
                <span className="mt-2 block text-[14px] text-ink-3">
                  <span className="num">{Math.round(r.within18)}%</span> within 18 weeks ·{" "}
                  <span className="num">{r.total.toLocaleString("en-GB")}</span> waiting
                </span>
              </span>

              <span className="col-start-2 hidden sm:col-start-auto sm:block">
                <Sparkline values={r.trend} label={`${specialtyName} median wait at ${r.provider.name} over the last year`} />
                <span className="mt-1 block text-[12px] text-ink-3">12-month trend</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function PlannedLegend({ max = 52 }: { max?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-ink-3">
      <span className="flex items-center gap-2">
        <span className="h-3 w-10 rounded-full bg-quick" aria-hidden="true" /> Half of patients have waited up to here
      </span>
      <span className="flex items-center gap-2">
        <span className="relative h-3 w-10" aria-hidden="true">
          <span className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 bg-ink-3/60" />
          <span className="absolute right-0 top-0 h-3 w-[2px] bg-ink-3/70" />
        </span>
        92 in 100 have waited up to here
      </span>
      <span>Bar scale: 0 to {max} weeks</span>
    </div>
  );
}

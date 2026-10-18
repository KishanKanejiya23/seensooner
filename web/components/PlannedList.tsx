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
  /** For a continuation list: numbering and the "vs quickest" baseline carry on. */
  offset?: number;
  best?: number;
  max?: number;
}) {
  return (
    <ol className="@container border-t-4 border-brand-700">
      {rows.map((r, i) => {
        const n = i + offset;
        const extra = best != null && n > 0 ? r.median - best : 0;
        return (
          <li key={r.p} className="border-b border-line">
            <Link
              href={`/hospital/${r.provider.slug}`}
              className="group grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 gap-y-3 px-1 py-5 hover:bg-well @lg:px-3 @2xl:grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)] @2xl:items-center @3xl:grid-cols-[40px_minmax(0,1.2fr)_minmax(0,1fr)_120px]"
            >
              <span
                className={`num flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-bold ${n === 0 ? "bg-saffron text-ink" : "bg-well-2 text-ink-2"}`}
              >
                {n + 1}
              </span>

              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[18px] font-bold leading-snug text-brand-600 group-hover:underline">
                  {r.provider.name}
                </span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[16px] text-ink-2">
                  <span>{r.provider.nhs ? "NHS trust" : <strong>Independent, NHS-funded</strong>}</span>
                  {showDistance && r.distance != null && (
                    <span>
                      <span className="num">{r.distance.toFixed(1)}</span> miles
                    </span>
                  )}
                  {r.provider.town && <span>{r.provider.town}</span>}
                </span>
              </span>

              <span className="col-start-2 @2xl:col-start-auto">
                <span className="flex items-baseline justify-between gap-3">
                  <strong className="num whitespace-nowrap text-[24px] leading-none">{weeks(r.median)}</strong>
                  <span className="whitespace-nowrap text-[14px] text-ink-2">
                    {extra >= 1 ? (
                      <>
                        <span className="num">+{Math.round(extra)}</span> {Math.round(extra) === 1 ? "week" : "weeks"}
                        <span className="sr-only"> longer than the quickest</span>
                      </>
                    ) : n === 0 ? (
                      <strong className="text-quick-ink">Quickest near you</strong>
                    ) : null}
                  </span>
                </span>
                <span className="mt-2 block">
                  <RangeBar median={r.median} p92={r.p92} max={max} tone={weeksTone(r.median)} />
                </span>
                <span className="mt-2 block text-[14px] text-ink-2">
                  <span className="num">{Math.round(r.within18)}%</span> within 18 weeks · <span className="num">{r.total.toLocaleString("en-GB")}</span> waiting
                </span>
              </span>

              <span className="hidden @3xl:block">
                <Sparkline values={r.trend} label={`${specialtyName} median wait at ${r.provider.name} over the last year`} />
                <span className="mt-1 block whitespace-nowrap text-[14px] text-ink-3">Last 12 months</span>
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
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[16px] text-ink-2">
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
      <span>
        Scale: 0 to <span className="num">{max}</span> weeks
      </span>
    </div>
  );
}

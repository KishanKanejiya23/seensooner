// Wait lengths are shown three ways at once: the number, the bar length on a
// shared axis, and a quiet colour ramp. Colour alone never carries meaning.

export type Tone = "quick" | "mid" | "long";

/** Planned care: the NHS standard is 18 weeks. */
export function weeksTone(w: number): Tone {
  return w <= 8 ? "quick" : w <= 18 ? "mid" : "long";
}
/** Urgent care: under an hour is quick, over three is long. */
export function minutesTone(m: number): Tone {
  return m <= 60 ? "quick" : m <= 180 ? "mid" : "long";
}

const FILL: Record<Tone, string> = { quick: "bg-quick", mid: "bg-mid", long: "bg-long" };
const SOFT: Record<Tone, string> = { quick: "bg-quick-soft", mid: "bg-mid-soft", long: "bg-long-soft" };
export const TONE_WORD: Record<Tone, string> = { quick: "Shorter", mid: "Middling", long: "Longer" };

/**
 * A median bar with a whisker out to the 92nd percentile: "half are seen by
 * here, nearly everyone by there". `max` is the shared axis for the list.
 */
export function RangeBar({ median, p92, max, tone }: { median: number; p92?: number; max: number; tone: Tone }) {
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <div className={`relative h-3 w-full rounded-full ${SOFT[tone]}`} aria-hidden="true">
      {p92 != null && (
        <span className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink-3/60" style={{ left: pct(median), width: `calc(${pct(p92)} - ${pct(median)})` }} />
      )}
      {p92 != null && <span className="absolute top-0 h-3 w-[2px] bg-ink-3/70" style={{ left: `calc(${pct(p92)} - 1px)` }} />}
      <span className={`absolute inset-y-0 left-0 rounded-full ${FILL[tone]}`} style={{ width: pct(median) }} />
    </div>
  );
}

export function Sparkline({ values, width = 96, height = 28, label }: { values: (number | null)[]; width?: number; height?: number; label: string }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v != null);
  if (pts.length < 2) return null;
  const lo = Math.min(...pts.map((p) => p.v));
  const hi = Math.max(...pts.map((p) => p.v));
  const span = hi - lo || 1;
  const x = (i: number) => (i / (values.length - 1)) * (width - 4) + 2;
  const y = (v: number) => height - 3 - ((v - lo) / span) * (height - 6);
  const d = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
      <path d={d} fill="none" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r="2.8" fill="var(--ink)" />
    </svg>
  );
}

/** Up/down against a year ago, with an arrow so it isn't colour-only. */
export function Trend({ values }: { values: (number | null)[] }) {
  const first = values.find((v) => v != null);
  const last = values[values.length - 1];
  if (first == null || last == null) return null;
  const diff = last - first;
  if (Math.abs(diff) < 0.5) return <span className="text-ink-3">About the same as a year ago</span>;
  const better = diff < 0;
  return (
    <span className={better ? "text-quick-ink" : "text-long-ink"}>
      <span aria-hidden="true">{better ? "↓" : "↑"}</span> {Math.abs(diff).toFixed(1)} weeks {better ? "shorter" : "longer"} than a year ago
    </span>
  );
}

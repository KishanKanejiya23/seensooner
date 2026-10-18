"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type Mode = "now" | "planned";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "now", label: "Urgent care, right now", hint: "A&E, urgent treatment centres and minor injuries units" },
  { id: "planned", label: "An operation or specialist", hint: "Hospital waiting lists, by specialty" },
];

/**
 * One panel, two questions. The mode switch is the only thing that changes
 * the form: same place field, same button, so nothing has to be relearnt.
 * It is a plain GET form, so it works before (and without) JavaScript.
 */
export function SearchPanel({
  specialties,
  mode: initialMode = "now",
  q = "",
  s = "orthopaedics",
  compact = false,
}: {
  specialties: { slug: string; name: string }[];
  mode?: Mode;
  q?: string;
  s?: string;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [spec, setSpec] = useState(s);
  const router = useRouter();
  const id = useId();

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeoError("Your browser can't share a location. Type a postcode instead.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const extra = mode === "planned" ? `&s=${encodeURIComponent(spec)}` : "";
        router.push(`/${mode}?lat=${lat}&lng=${lng}${extra}`);
      },
      () => {
        setLocating(false);
        setGeoError("Location wasn't shared. Type a postcode or town instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className={`rounded-xl border border-line bg-card ${compact ? "" : "shadow-lift"}`}>
      <div role="radiogroup" aria-label="What are you looking for?" className="grid grid-cols-2 border-b border-line p-1">
        {MODES.map((m) => {
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setMode(m.id)}
              className={`relative min-h-12 rounded-lg px-3 py-3 text-left transition-colors ${on ? "text-act-ink" : "text-ink-2 hover:text-ink"}`}
            >
              {on && (
                <motion.span
                  layoutId={`${id}-pill`}
                  className="absolute inset-0 rounded-lg bg-act"
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                />
              )}
              <span className="relative block text-[16px] font-bold leading-tight">{m.label}</span>
              {!compact && (
                <span className={`relative mt-1 hidden text-[14px] leading-snug sm:block ${on ? "opacity-90" : "text-ink-3"}`}>
                  {m.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form action={`/${mode}`} method="get" className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-end">
        <div className="min-w-0 flex-[1.2]">
          <label htmlFor={`${id}-q`} className="caps block">
            Where are you?
          </label>
          <input
            id={`${id}-q`}
            name="q"
            defaultValue={q}
            required
            autoComplete="postal-code"
            placeholder="Postcode or town, e.g. LS1 4AP"
            className="mt-2 h-14 w-full rounded border-2 border-line-strong bg-card px-4 text-[18px] text-ink placeholder:text-ink-3 focus:border-act focus:outline-none"
          />
        </div>

        {mode === "planned" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 flex-1">
            <label htmlFor={`${id}-s`} className="caps block">
              Specialty
            </label>
            <select
              id={`${id}-s`}
              name="s"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="mt-2 h-14 w-full rounded border-2 border-line-strong bg-card px-3 text-[18px] text-ink focus:border-act focus:outline-none"
            >
              {specialties.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        <button
          type="submit"
          className="h-14 shrink-0 rounded bg-ink px-8 text-[18px] font-bold text-paper transition-transform hover:bg-ink-2 active:scale-[0.98]"
        >
          {mode === "now" ? "Show waits" : "Compare hospitals"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-[16px] sm:px-6">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex min-h-12 items-center gap-2 font-bold text-act hover:underline disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          {locating ? "Finding you…" : "Use my location"}
        </button>
        <span className="text-[14px] text-ink-3">Used once to sort results. Never stored.</span>
        {geoError && (
          <p role="alert" className="w-full text-[16px] text-long-ink">
            {geoError}
          </p>
        )}
      </div>
    </div>
  );
}

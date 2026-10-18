"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { PinIcon } from "@/components/Icons";

type Mode = "now" | "planned";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "now", label: "I need care today", hint: "A&E, urgent treatment centres, minor injuries" },
  { id: "planned", label: "I'm waiting for an operation or specialist", hint: "Hospital waiting lists by specialty" },
];

/**
 * One box, two questions. The mode switch is the only thing that changes the
 * form: same place field, same button. A plain GET form, so it works before
 * (and without) JavaScript; "use my location" is the only scripted part.
 */
export function SearchPanel({
  specialties,
  mode: initialMode = "now",
  q = "",
  s = "orthopaedics",
  fixedMode = false,
}: {
  specialties: { slug: string; name: string }[];
  mode?: Mode;
  q?: string;
  s?: string;
  /** On /now and /planned the page already answers "which question", so hide the switch. */
  fixedMode?: boolean;
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
    <div className="border-t-4 border-brand-700 bg-well">
      {!fixedMode && (
        <div role="radiogroup" aria-label="What do you need?" className="grid gap-2 px-4 pt-4 sm:grid-cols-2 sm:px-6 sm:pt-6">
          {MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMode(m.id)}
                className={`relative min-h-16 rounded border-2 px-4 py-3 text-left ${on ? "border-brand-700 text-white" : "border-line-strong bg-white text-ink hover:border-brand-700"}`}
              >
                {on && (
                  <motion.span layoutId={`${id}-on`} className="absolute inset-0 rounded-[2px] bg-brand-700" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-saffron" : "border-line-strong"}`}
                  >
                    {on && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
                  </span>
                  <span>
                    <span className="block text-[18px] font-bold leading-snug">{m.label}</span>
                    <span className={`mt-1 block text-[16px] leading-snug ${on ? "text-brand-100" : "text-ink-3"}`}>{m.hint}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <form action={`/${mode}`} method="get" className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-end">
        <div className="min-w-0 flex-[1.2]">
          <label htmlFor={`${id}-q`} className="block text-[18px] font-bold">
            Your postcode or town
          </label>
          <input
            id={`${id}-q`}
            name="q"
            defaultValue={q}
            required
            autoComplete="postal-code"
            placeholder="For example, B71 4HJ or Leeds"
            className="mt-2 h-14 w-full rounded border-2 border-ink bg-white px-4 text-[18px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-4 focus:ring-saffron"
          />
        </div>

        {mode === "planned" && (
          <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-s`} className="block text-[18px] font-bold">
              Specialty
            </label>
            <select
              id={`${id}-s`}
              name="s"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="mt-2 h-14 w-full rounded border-2 border-ink bg-white px-3 text-[18px] text-ink focus:outline-none focus:ring-4 focus:ring-saffron"
            >
              {specialties.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="h-14 shrink-0 rounded bg-brand-700 px-8 text-[18px] font-bold text-white hover:bg-brand-900 active:translate-y-px">
          {mode === "now" ? "Show waiting times" : "Compare hospitals"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-5 text-[16px] sm:px-6">
        <button type="button" onClick={locate} disabled={locating} className="inline-flex min-h-12 items-center gap-2 font-bold text-brand-600 underline underline-offset-4 hover:text-brand-900 disabled:opacity-60">
          <PinIcon className="h-5 w-5" />
          {locating ? "Finding where you are…" : "Use my location instead"}
        </button>
        <span className="text-ink-3">Used once to sort the results. Never stored.</span>
        {geoError && (
          <p role="alert" className="w-full font-bold text-long-ink">
            {geoError}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useDeferredValue, useId, useState } from "react";

type P = { code: string; slug: string; name: string; nhs: boolean; town: string | null; region: string };

/** Type-to-filter over 500 names: instant, and the full list is still in the HTML for search engines. */
export function HospitalFilter({ providers }: { providers: P[] }) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());
  const id = useId();
  const shown = dq ? providers.filter((p) => `${p.name} ${p.town ?? ""}`.toLowerCase().includes(dq)) : providers;
  const regions = [...new Set(shown.map((p) => p.region))].sort();
  return (
    <>
      <div className="border-t-4 border-brand-700 bg-well p-4 sm:p-6">
        <label htmlFor={id} className="block text-[18px] font-bold">
          Filter by hospital name or town
        </label>
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="For example, Royal Free or Leeds"
          className="mt-2 h-14 w-full rounded border-2 border-ink bg-white px-4 text-[18px] placeholder:text-ink-3 focus:outline-none focus:ring-4 focus:ring-saffron"
        />
        <p aria-live="polite" className="mt-3 text-[16px] text-ink-2">
          Showing <span className="num font-bold">{shown.length}</span> of <span className="num">{providers.length}</span>
        </p>
      </div>
      {shown.length === 0 && <p className="mt-8 text-[18px]">No hospital matches &ldquo;{q}&rdquo;. Check the spelling, or try the town instead.</p>}
      {regions.map((region) => {
        const list = shown.filter((p) => p.region === region);
        return (
          <section key={region} className="mt-12" aria-labelledby={`r-${region}`}>
            <h2 id={`r-${region}`} className="border-b-4 border-saffron pb-2 text-[24px]">
              {region} <span className="num text-[18px] font-normal text-ink-3">({list.length})</span>
            </h2>
            <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {list.map((p) => (
                <li key={p.code} className="border-b border-line">
                  <Link href={`/hospital/${p.slug}`} className="group flex items-baseline justify-between gap-3 py-3">
                    <span className="text-brand-600 underline-offset-4 group-hover:underline">{p.name}</span>
                    {!p.nhs && <span className="shrink-0 rounded bg-well-2 px-2 text-[14px] font-bold text-ink-2">Independent</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

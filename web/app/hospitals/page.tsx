import type { Metadata } from "next";
import Link from "next/link";
import { ALL_PROVIDERS, RTT_PERIOD } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Every hospital and provider in England",
  description: `Waiting times for 500+ NHS trusts and independent providers in England, ${RTT_PERIOD}.`,
  alternates: { canonical: "/hospitals" },
};

export default function Hospitals() {
  const regions = [...new Set(ALL_PROVIDERS.map((p) => p.region ?? "Other"))].sort();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="text-[30px] font-bold tracking-[-0.02em] sm:text-[48px]">Every hospital</h1>
      <p className="mt-4 max-w-2xl text-[20px] text-ink-2">
        {ALL_PROVIDERS.length} NHS trusts and independent providers reported planned-care waits for {RTT_PERIOD}.
      </p>
      {regions.map((region) => {
        const list = ALL_PROVIDERS.filter((p) => (p.region ?? "Other") === region).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <section key={region} className="mt-12" aria-labelledby={`r-${region}`}>
            <h2 id={`r-${region}`} className="caps">{region} · {list.length}</h2>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <li key={p.code} className="border-b border-line">
                  <Link href={`/hospital/${p.slug}`} className="flex items-baseline justify-between gap-3 py-3 hover:underline">
                    <span>{p.name}</span>
                    {!p.nhs && <span className="shrink-0 text-[12px] font-bold text-ink-3">IND</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

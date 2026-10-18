import type { Metadata } from "next";
import { WHERE_TO_GO } from "@/lib/where";

export const metadata: Metadata = {
  title: "Where to go: A&E, urgent care, 111 or a pharmacy",
  description: "A plain guide to which NHS service to use, from 999 and A&E to urgent treatment centres, NHS 111, pharmacies and your GP.",
  alternates: { canonical: "/where-to-go" },
};

export default function WhereToGo() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
      <p className="caps">A plain guide</p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">Where should I go?</h1>
      <p className="mt-6 max-w-2xl text-[20px] text-ink-2">
        Going to the right place first is usually the quickest way to be seen. This page points you to a service. It can&apos;t tell you
        whether you&apos;re all right: if you&apos;re unsure, use NHS 111.
      </p>
      <div className="mt-12 space-y-6">
        {WHERE_TO_GO.map((o) => (
          <section
            key={o.id}
            aria-labelledby={`w-${o.id}`}
            className={`rounded-xl border p-6 sm:p-8 ${o.urgent ? "border-sos border-l-8" : "border-line bg-card"}`}
          >
            <h2 id={`w-${o.id}`} className={`text-[24px] font-bold ${o.urgent ? "text-sos" : ""}`}>{o.service}</h2>
            <p className="mt-2 text-[18px] font-bold text-ink-2">{o.when}</p>
            <ul className="mt-4 list-disc space-y-1 pl-6 text-ink-2">
              {o.examples.map((e) => <li key={e}>{e}</li>)}
            </ul>
            <a
              href={o.action.href}
              className={`mt-6 inline-flex min-h-12 items-center rounded px-6 font-bold ${o.urgent ? "bg-sos text-white" : "border-2 border-ink text-ink hover:bg-ink hover:text-paper"}`}
            >
              {o.action.label}
            </a>
          </section>
        ))}
      </div>
      <p className="mt-10 text-[16px] text-ink-3">
        Summarised from NHS guidance on{" "}
        <a className="prose-link" href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/">urgent and emergency care services</a>.
        Other services: Samaritans <a className="prose-link" href="tel:116123">116 123</a>, any time.
      </p>
    </div>
  );
}

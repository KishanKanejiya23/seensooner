import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageBanner, PageLayout } from "@/components/Shell";
import { WHERE_TO_GO } from "@/lib/where";

export const metadata: Metadata = {
  title: "Where to go: 999, A&E, urgent treatment centre, NHS 111 or a pharmacy",
  description: "A plain guide to which NHS service to use, from 999 and A&E to urgent treatment centres, NHS 111, Pharmacy First and your GP.",
  alternates: { canonical: "/where-to-go" },
};

export default function WhereToGo() {
  return (
    <>
      <PageBanner photo="ambulance-rear" kicker="A plain guide" title="Where should I go?" lede="Going to the right place first is usually the quickest way to be seen." />
      <PageLayout trail={[{ label: "Where to go" }]} current="/where-to-go" updated="18 October 2026">
        <p className="max-w-[860px] text-[20px]">
          This page points you to a service. It can&apos;t tell you whether you&apos;re all right. If you&apos;re not sure, use{" "}
          <a className="link" href="https://111.nhs.uk/">NHS 111</a>.
        </p>
        <div className="mt-10 space-y-8">
          {WHERE_TO_GO.map((o) => (
            <section key={o.id} aria-labelledby={`w-${o.id}`} className={o.urgent ? "bg-sos p-6 text-white sm:p-8" : "border-l-8 border-brand-700 bg-well p-6 sm:p-8"}>
              <h2 id={`w-${o.id}`} className="text-[30px]">
                {o.service}
              </h2>
              <p className={`mt-2 text-[20px] font-bold ${o.urgent ? "" : "text-ink-2"}`}>{o.when}</p>
              <ul className={`mt-4 list-disc space-y-1 pl-6 text-[18px] ${o.urgent ? "" : "text-ink-2"}`}>
                {o.examples.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <a
                href={o.action.href}
                className={`mt-6 inline-flex min-h-12 items-center rounded px-6 text-[18px] font-bold ${o.urgent ? "bg-white text-sos hover:bg-brand-50" : "bg-brand-700 text-white hover:bg-brand-900"}`}
              >
                {o.action.label}
              </a>
            </section>
          ))}
        </div>
        <p className="mt-10 text-[16px] text-ink-2">
          Summarised from NHS guidance on{" "}
          <a className="link" href="https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/">
            urgent and emergency care services
          </a>
          . Samaritans: <a className="link" href="tel:116123">116 123</a>, any time, free.
        </p>
      </PageLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: WHERE_TO_GO.map((o) => ({
            "@type": "Question",
            name: `When should I use ${o.service === "Call 999" ? "999" : o.service}?`,
            acceptedAnswer: { "@type": "Answer", text: `${o.when} For example: ${o.examples.join("; ")}.` },
          })),
        }}
      />
    </>
  );
}

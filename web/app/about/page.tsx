import type { Metadata } from "next";
import { RTT_MONTHS, RTT_PERIOD, RTT_SOURCE, monthLabel } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "How SeenSooner works",
  description: "Where the waiting-time data comes from, how it's calculated, and what it can and can't tell you.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <p className="caps">Methodology</p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">How this works</h1>
      <p className="mt-6 text-[20px] leading-relaxed text-ink-2">
        SeenSooner puts public NHS waiting-time data in one place, so you can compare before you travel or before you&apos;re referred.
        It&apos;s independent: not part of, funded by or endorsed by the NHS.
      </p>

      <h2 className="mt-14 text-[24px] font-bold">Urgent care, right now</h2>
      <p className="mt-3 text-ink-2">
        Some NHS trusts and health boards publish a live wait for their A&amp;E departments, urgent treatment centres and minor injuries
        units. We read those official pages every few minutes and show the figure unchanged, with the time the trust says it was updated.
        We never estimate or fill in a number. Most hospitals in England don&apos;t publish a live figure, so they don&apos;t appear.
      </p>
      <p className="mt-3 text-ink-2">
        Trusts measure different things (time to triage, time to see a clinician, an average over the last few hours), so every result
        shows that trust&apos;s own definition.
      </p>

      <h2 className="mt-14 text-[24px] font-bold">Planned care</h2>
      <p className="mt-3 text-ink-2">
        From the <a className="prose-link" href={RTT_SOURCE.url}>{RTT_SOURCE.name}</a>, published monthly. We use the full data file for
        each month from {monthLabel(RTT_MONTHS[0])} to {RTT_PERIOD}, covering every NHS trust and independent provider treating NHS
        patients in England.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-2">
        <li><strong className="text-ink">Median wait:</strong> half the people still waiting at the end of the month had waited this long or less.</li>
        <li><strong className="text-ink">92 in 100:</strong> the 92nd percentile, the point by which almost everyone on the list had been waiting.</li>
        <li><strong className="text-ink">Within 18 weeks:</strong> the share waiting under 18 weeks. The NHS standard is 92%.</li>
        <li>Medians are worked out from the weekly counts in the data, to one decimal place.</li>
        <li>Specialty and provider combinations with fewer than 20 people waiting are left out, because a median of a handful of people is noise.</li>
        <li>Locations come from the NHS Organisation Data Service. For trusts with several hospitals that&apos;s the main address, so distances are approximate.</li>
      </ul>

      <h2 className="mt-14 text-[24px] font-bold">What it can&apos;t tell you</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>Your own wait. That depends on how urgent your case is, and on your clinician.</li>
        <li>Quality of care. A short wait isn&apos;t the same as a better hospital. Independent hospitals often take simpler, lower-risk cases.</li>
        <li>Whether you should go to A&amp;E. Use <a className="prose-link" href="https://111.nhs.uk/">NHS 111</a> or call 999 in an emergency.</li>
      </ul>

      <h2 className="mt-14 text-[24px] font-bold">Licence</h2>
      <p className="mt-3 text-ink-2">
        Contains public sector information licensed under the {RTT_SOURCE.licence}. Postcode lookups by postcodes.io (Office for National
        Statistics data).
      </p>
    </div>
  );
}

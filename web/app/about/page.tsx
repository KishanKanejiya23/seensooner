import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { MissionBand } from "@/components/Mission";
import { PageBanner, PageLayout } from "@/components/Shell";
import { VALUES } from "@/components/SiteFooter";
import { RTT_MONTHS, RTT_PERIOD, RTT_SOURCE, monthLabel } from "@/lib/rtt";
import { AUTHOR, ISSUES_URL, REPO_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About SeenSooner: our aim, and where our data comes from",
  description: "Why SeenSooner exists, the values it's built on, where every waiting time comes from, how it's calculated, and what it can and can't tell you.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageBanner photo="waiting-room" kicker="About us" title="Why we built SeenSooner" lede="A small, independent project with one aim: make NHS waiting times easy for everyone to see." />
      <PageLayout trail={[{ label: "About us" }]} current="/about" updated="18 October 2026">
        <div className="max-w-[860px] space-y-6 text-[18px]">
          <p className="text-[20px]">
            SeenSooner puts public NHS waiting-time data in one place, so you can compare before you travel or before you&apos;re referred.
            It&apos;s independent: not part of, funded by or endorsed by the NHS. It&apos;s free, it has no adverts, and it doesn&apos;t
            store anything about you.
          </p>
          <p>
            It was built by <a className="link" href={AUTHOR.url}>{AUTHOR.name}</a>, a software engineer in London, after watching friends and
            family wait months without knowing a hospital a few miles away could see them in weeks. The code is{" "}
            <a className="link" href={REPO_URL}>open source</a>, so anyone can check how it works.
          </p>
        </div>

        <h2 className="mt-14 text-[30px]">What we believe</h2>
        <ul className="mt-6 grid gap-6 xl:grid-cols-3">
          {VALUES.map(({ Icon, name, text }) => (
            <li key={name} className="border-t-4 border-saffron bg-well p-6">
              <Icon className="h-12 w-12 text-brand-700" />
              <h3 className="mt-4 text-[22px]">{name}</h3>
              <p className="mt-2 text-[18px] text-ink-2">{text}</p>
            </li>
          ))}
        </ul>

        <h2 id="data" className="mt-16 scroll-mt-8 text-[30px]">
          Where our data comes from
        </h2>
        <h3 className="mt-8 text-[22px]">Urgent care, right now</h3>
        <p className="mt-3 max-w-[860px] text-[18px] text-ink-2">
          Some NHS trusts and health boards publish a live wait for their A&amp;E departments, urgent treatment centres and minor injuries
          units. We read those official pages every few minutes and show the figure unchanged, with the time the hospital says it was
          updated. We never estimate or fill in a number. Hospitals measure different things (time to triage, time to see a clinician, an
          average over the last few hours), so every result shows that hospital&apos;s own definition. Most hospitals in England don&apos;t
          publish a live figure, so they don&apos;t appear. <Link className="link" href="/now">See every live source</Link>.
        </p>

        <h3 className="mt-8 text-[22px]">Planned care</h3>
        <p className="mt-3 max-w-[860px] text-[18px] text-ink-2">
          From the <a className="link" href={RTT_SOURCE.url}>{RTT_SOURCE.name}</a>, published monthly. We use the full data file for each
          month from {monthLabel(RTT_MONTHS[0])} to {RTT_PERIOD}, covering every NHS trust and independent provider treating NHS patients in
          England.
        </p>
        <ul className="mt-4 max-w-[860px] list-disc space-y-2 pl-6 text-[18px] text-ink-2">
          <li><strong className="text-ink">Median wait:</strong> half the people still waiting at the end of the month had waited this long or less.</li>
          <li><strong className="text-ink">92 in 100:</strong> the point by which almost everyone on the list had been waiting.</li>
          <li><strong className="text-ink">Within 18 weeks:</strong> the share waiting under 18 weeks. The NHS standard is 92%.</li>
          <li>Hospital and specialty combinations with fewer than 20 people waiting are left out: a median of a handful of people is noise.</li>
          <li>Locations come from the NHS Organisation Data Service. For trusts with several hospitals that&apos;s the main address, so distances are approximate.</li>
        </ul>

        <h2 className="mt-16 text-[30px]">What it can&apos;t tell you</h2>
        <ul className="mt-4 max-w-[860px] list-disc space-y-2 pl-6 text-[18px] text-ink-2">
          <li>Your own wait. That depends on how urgent your case is, and on your clinician.</li>
          <li>The quality of care. A short wait isn&apos;t the same as a better hospital, and independent hospitals often take simpler cases.</li>
          <li>Whether you should go to A&amp;E. Use <a className="link" href="https://111.nhs.uk/">NHS 111</a>, or call 999 in an emergency.</li>
        </ul>

        <h2 className="mt-16 text-[30px]">Help us get it right</h2>
        <p className="mt-3 max-w-[860px] text-[18px] text-ink-2">
          If a number looks wrong, a hospital has started publishing live waits, or something is hard to use,{" "}
          <a className="link" href={ISSUES_URL}>tell us on GitHub</a>. Contains public sector information licensed under the {RTT_SOURCE.licence}.
          Postcode lookups by postcodes.io (Office for National Statistics data). Photos from Unsplash.
        </p>
      </PageLayout>
      <MissionBand withLink={false} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${SITE_URL}/about`,
          name: "About SeenSooner",
          isPartOf: { "@id": `${SITE_URL}/#site` },
          about: { "@id": `${SITE_URL}/#org` },
        }}
      />
    </>
  );
}

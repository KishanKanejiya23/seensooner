import Link from "next/link";
import { CareIcon, HonestIcon, OpenIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { SiteSearch } from "@/components/SiteHeader";
import { RTT_PERIOD, RTT_SOURCE } from "@/lib/rtt";
import { AUTHOR, ISSUES_URL, REPO_URL } from "@/lib/site";

export const VALUES = [
  { Icon: HonestIcon, name: "Honest numbers", text: "Every figure comes from an official NHS source and links back to it. We never guess or fill gaps." },
  { Icon: OpenIcon, name: "Open to everyone", text: "Free, no account, no adverts, nothing about you stored. The code is open source." },
  { Icon: CareIcon, name: "Care comes first", text: "999 is on every page. We point you towards care, never away from it." },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="bg-brand-700 text-white">
        <div className="mx-auto grid max-w-[1320px] items-center gap-6 px-4 py-12 sm:px-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-[18px] font-bold text-brand-100">Looking for something?</p>
            <p className="mt-1 text-[24px] font-bold sm:text-[30px]">Start with your postcode or a hospital</p>
          </div>
          <SiteSearch id="footer-search" size="lg" onDark />
        </div>
      </div>

      <div className="bg-brand-950 text-white">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-8">
          <section aria-labelledby="values" className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-start">
            <h2 id="values" className="text-[30px]">Our values</h2>
            <ul className="grid gap-8 md:grid-cols-3">
              {VALUES.map(({ Icon, name, text }) => (
                <li key={name} className="flex gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-white text-brand-700">
                    <Icon className="h-10 w-10" />
                  </span>
                  <span>
                    <span className="block text-[20px] font-bold">{name}</span>
                    <span className="mt-1 block text-[16px] text-brand-100">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 grid gap-10 border-t border-brand-800 pt-12 md:grid-cols-[1.3fr_1fr_1fr]">
            <div className="max-w-md">
              <Logo tone="light" />
              <p className="mt-5 text-[16px] text-brand-100">
                SeenSooner is an independent project. It is not part of, funded by or endorsed by the NHS, and nothing on it is
                medical advice. If you are unwell, contact NHS 111 or your GP. In an emergency, call 999.
              </p>
            </div>
            <div>
              <h2 className="text-[18px]">Using the site</h2>
              <ul className="mt-4 space-y-3 text-[16px]">
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/now">Urgent care waits now</Link></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/planned">Planned care waits</Link></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/planned/orthopaedics">Hip and knee waiting times</Link></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/planned/ophthalmology">Cataract and eye waiting times</Link></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/where-to-go">Where should I go?</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-[18px]">About</h2>
              <ul className="mt-4 space-y-3 text-[16px]">
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/about">Our aim and how this works</Link></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/about#data">Where our data comes from</Link></li>
                <li><a className="underline underline-offset-4 hover:no-underline" href={ISSUES_URL}>Report a problem</a></li>
                <li><a className="underline underline-offset-4 hover:no-underline" href={REPO_URL}>Source code on GitHub</a></li>
                <li><Link className="underline underline-offset-4 hover:no-underline" href="/accessibility">Accessibility statement</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-brand-800 pt-8 text-[14px] text-brand-100">
            <p>
              Planned-care data: <a className="underline underline-offset-4" href={RTT_SOURCE.url}>NHS England</a>, {RTT_PERIOD}. Contains public sector
              information licensed under the {RTT_SOURCE.licence}. Photos: Unsplash.
            </p>
            <p>
              Designed and built by <a className="underline underline-offset-4" href={AUTHOR.url}>{AUTHOR.name}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

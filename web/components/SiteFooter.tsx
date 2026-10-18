import Link from "next/link";
import { TicketMark } from "@/components/Logo";
import { RTT_PERIOD, RTT_SOURCE } from "@/lib/rtt";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-[16px] text-ink-2 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <p className="flex items-center gap-2 font-bold text-ink">
            <TicketMark size={22} /> SeenSooner
          </p>
          <p className="mt-3">
            An independent tool built on public NHS data. Not part of, or endorsed by, the NHS. Nothing here is medical advice:
            if you are unwell, contact NHS 111 or your GP, and call 999 in an emergency.
          </p>
        </div>
        <div>
          <p className="caps">Data</p>
          <ul className="mt-3 space-y-2">
            <li>
              Planned care: <a className="prose-link" href={RTT_SOURCE.url}>NHS England RTT statistics</a>, {RTT_PERIOD}
            </li>
            <li>Urgent care: each trust&apos;s own live wait page, linked on every result</li>
            <li>Locations: NHS ODS and postcodes.io</li>
            <li>Contains public sector information licensed under the {RTT_SOURCE.licence}.</li>
          </ul>
        </div>
        <div>
          <p className="caps">Pages</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:underline" href="/planned/orthopaedics">Orthopaedic waiting times</Link></li>
            <li><Link className="hover:underline" href="/planned/ophthalmology">Eye (cataract) waiting times</Link></li>
            <li><Link className="hover:underline" href="/hospitals">Every hospital</Link></li>
            <li><Link className="hover:underline" href="/about">How this works</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-10 text-[14px] text-ink-3 sm:px-6">
        Built by{" "}
        <a className="underline underline-offset-2" href="https://kishankanejiya.pages.dev/">
          Kishan Kanejiya
        </a>
        .
      </p>
    </footer>
  );
}

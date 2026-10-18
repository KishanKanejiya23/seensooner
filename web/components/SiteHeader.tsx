import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NHS_111 } from "@/lib/site";

const NAV = [
  { href: "/now", label: "Urgent care now" },
  { href: "/planned", label: "Planned care" },
  { href: "/where-to-go", label: "Where to go" },
  { href: "/right-to-choose", label: "Right to choose" },
];

export function SiteHeader() {
  return (
    <header>
      {/* Always first, on every page: this site must never slow down an emergency. */}
      <div className="bg-sos text-white">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-[14px] sm:px-6">
          <span>
            <strong>Life-threatening emergency?</strong> Do not compare waits.{" "}
            <a href="tel:999" className="font-bold underline underline-offset-2">
              Call 999
            </a>
          </span>
          <span className="opacity-90">
            Not sure what you need?{" "}
            <a href={NHS_111} className="font-bold underline underline-offset-2">
              NHS 111
            </a>{" "}
            or call{" "}
            <a href="tel:111" className="font-bold underline underline-offset-2">
              111
            </a>
          </span>
        </p>
      </div>
      <div className="border-b border-line">
        <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="SeenSooner home" className="rounded">
            <Logo />
          </Link>
          <ul className="-mx-2 flex flex-wrap items-center gap-x-1 text-[16px]">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded px-2 py-2 font-medium text-ink-2 hover:text-ink hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

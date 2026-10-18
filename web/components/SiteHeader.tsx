import Link from "next/link";
import { MenuIcon, PhoneIcon, SearchIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { ISSUES_URL, NAV, NHS_111 } from "@/lib/site";

export function SiteSearch({ id, size = "md", onDark = false }: { id: string; size?: "md" | "lg"; onDark?: boolean }) {
  const h = size === "lg" ? "h-14" : "h-12";
  return (
    <form action="/search" method="get" role="search" className="flex w-full">
      <label htmlFor={id} className="sr-only">
        Search by postcode, town or hospital
      </label>
      <input
        id={id}
        name="q"
        required
        placeholder="Search postcode, town or hospital"
        className={`${h} min-w-0 flex-1 rounded-l-full border-2 border-r-0 ${onDark ? "border-white bg-white" : "border-line-strong bg-well"} pl-6 pr-3 text-[18px] text-ink placeholder:text-ink-3 focus:border-brand-700 focus:bg-white focus:outline-none`}
      />
      <button
        type="submit"
        className={`${h} inline-flex w-16 shrink-0 items-center justify-center rounded-r-full ${onDark ? "bg-saffron text-ink hover:bg-white" : "bg-brand-700 text-white hover:bg-brand-900"}`}
      >
        <SearchIcon className="h-6 w-6" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
}

export function SiteHeader() {
  return (
    <header>
      {/* Utility bar: the emergency route is the first focusable thing on every page. */}
      <div className="bg-utility text-white">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-8">
          <a href="tel:999" className="inline-flex min-h-10 items-center gap-2 rounded bg-sos px-4 text-[16px] font-bold hover:bg-sos-dark">
            <PhoneIcon className="h-4 w-4" /> Emergency? Call 999
          </a>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[16px]">
            <li><a href={NHS_111} className="hover:underline">NHS 111 online</a></li>
            <li><Link href="/about#data" className="hover:underline">Where our data comes from</Link></li>
            <li className="hidden sm:block"><a href={ISSUES_URL} className="hover:underline">Report a problem</a></li>
          </ul>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-10 gap-y-4 px-4 py-6 sm:px-8">
          <Link href="/" className="rounded">
            <Logo />
          </Link>
          <div className="hidden w-full max-w-[540px] md:block">
            <SiteSearch id="header-search" />
          </div>
          {/* Phones and small tablets: a native disclosure, so the menu works without JavaScript. */}
          <details className="group md:hidden">
            <summary className="inline-flex min-h-12 items-center gap-2 rounded border-2 border-ink px-4 font-bold">
              <MenuIcon className="h-5 w-5" /> Menu
            </summary>
            <div className="absolute left-0 right-0 z-30 mt-4 border-y-4 border-brand-700 bg-white px-4 pb-6 pt-4 shadow-xl">
              <SiteSearch id="menu-search" />
              <ul className="mt-4 divide-y divide-line">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block py-3 text-[18px] font-bold">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>

        <nav aria-label="Main" className="hidden border-b border-line md:block">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
}

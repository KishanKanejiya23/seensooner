"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";

const active = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`) || (href === "/hospitals" && path.startsWith("/hospital/")));

export function NavLinks() {
  const path = usePathname() ?? "/";
  return (
    <ul className="mx-auto flex max-w-[1320px] flex-wrap gap-x-5 px-4 sm:px-8 lg:gap-x-8">
      {NAV.map((n) => {
        const on = active(path, n.href);
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={`block border-b-4 pb-4 pt-1 text-[16px] font-bold lg:text-[18px] ${on ? "border-saffron text-ink" : "border-transparent text-ink-2 hover:border-line-strong hover:text-ink"}`}
            >
              {n.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

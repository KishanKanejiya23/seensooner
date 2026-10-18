import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, PhoneIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { ISSUES_URL, NHS_111, SITE_URL } from "@/lib/site";

/**
 * The banner photo as a real <img>, not a CSS background: the browser finds it
 * in the HTML straight away (it's usually the LCP element), and a prefetched
 * route never drags its photo along. The overlay darkens it, so phones are
 * told to take the 800px file even on retina screens.
 */
export function BannerPhoto({ photo }: { photo: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static, pre-sized files; next/image adds nothing here
    <img
      src={`/photos/${photo}.webp`}
      srcSet={`/photos/${photo}-sm.webp 800w, /photos/${photo}.webp 1600w`}
      sizes="(min-width: 768px) 100vw, 60vw"
      alt=""
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 -z-20 h-full w-full object-cover"
    />
  );
}

export type Crumb = { href?: string; label: string };

/**
 * Photo banner with a titled panel and a saffron marker, the way trust sites
 * open a page. The photo is decoration (empty alt via CSS background), the
 * panel carries the h1.
 */
export function PageBanner({ title, lede, photo, kicker }: { title: ReactNode; lede?: ReactNode; photo: string; kicker?: ReactNode }) {
  return (
    <div className="banner">
      <BannerPhoto photo={photo} />
      <div className="mx-auto flex min-h-[220px] max-w-[1320px] items-center px-4 py-10 sm:min-h-[280px] sm:px-8 lg:min-h-[320px]">
        <div className="marker max-w-[760px] bg-brand-900 px-6 py-6 text-white sm:px-10 sm:py-8">
          {kicker && <p className="mb-2 text-[16px] font-bold text-saffron">{kicker}</p>}
          <h1 className="text-[30px] sm:text-[40px] lg:text-[48px]">{title}</h1>
          {lede && <p className="mt-3 text-[18px] text-brand-100 sm:text-[20px]">{lede}</p>}
        </div>
      </div>
    </div>
  );
}

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const all: Crumb[] = [{ href: "/", label: "Home" }, ...trail];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[16px]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li className="font-bold">You are here:</li>
          {all.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-ink-3">›</span>}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="link">{c.label}</Link>
              ) : (
                <span aria-current="page" className="text-ink-2">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `${SITE_URL}${c.href === "/" ? "" : c.href}` } : {}),
          })),
        }}
      />
    </>
  );
}

const SECTION = [
  { href: "/now", label: "Urgent care waits now" },
  { href: "/planned", label: "Planned care waits" },
  { href: "/hospitals", label: "Every hospital" },
  { href: "/where-to-go", label: "Where should I go?" },
  { href: "/right-to-choose", label: "Your right to choose" },
  { href: "/about", label: "About SeenSooner" },
];

export function EmergencyBox() {
  return (
    <div className="bg-sos px-6 py-6 text-white">
      <p className="text-[18px]">
        <strong>For life-threatening emergencies</strong>, always dial{" "}
        <a href="tel:999" className="font-bold underline underline-offset-2">999</a>.
      </p>
      <p className="mt-4 text-[18px]">
        <strong>For urgent help that isn&apos;t life-threatening</strong>, go to{" "}
        <a href={NHS_111} className="font-bold underline underline-offset-2">NHS 111 online</a> or{" "}
        <a href="tel:111" className="font-bold underline underline-offset-2">call 111</a>.
      </p>
      <a href="tel:999" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded bg-white px-5 font-bold text-sos hover:bg-brand-50">
        <PhoneIcon className="h-5 w-5" /> Call 999
      </a>
    </div>
  );
}

export function Sidebar({ current, children }: { current?: string; children?: ReactNode }) {
  return (
    <aside className="space-y-8" aria-label="In this section">
      <nav aria-labelledby="side-title">
        <h2 id="side-title" className="text-[24px]">Find your way</h2>
        <ul className="mt-4 border-t border-line">
          {SECTION.map((s) => {
            const on = s.href === current;
            return (
              <li key={s.href} className="border-b border-line">
                <Link
                  href={s.href}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-between gap-3 px-3 py-3 text-[18px] ${on ? "bg-brand-700 font-bold text-white" : "hover:bg-well-2"}`}
                >
                  {s.label}
                  <ArrowIcon className={`h-4 w-4 shrink-0 ${on ? "text-saffron" : "text-ink-3"}`} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <EmergencyBox />
      {children}
    </aside>
  );
}

/** Main column + grey sidebar column, collapsing to one column below 1024px. */
export function PageLayout({ trail, current, children, aside, updated }: { trail: Crumb[]; current?: string; children: ReactNode; aside?: ReactNode; updated?: string }) {
  return (
    <div className="overflow-x-clip">
      <div className="mx-auto grid max-w-[1320px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 px-4 py-10 sm:px-8 lg:pr-16">
          <Breadcrumbs trail={trail} />
          <div className="mt-10">{children}</div>
          <PageMeta updated={updated} />
        </div>
        {/* Grey to the right edge of the screen on desktop: a box-shadow bleed clipped to the right. */}
        <div className="bg-well px-4 py-10 sm:px-8 lg:pl-10 lg:[box-shadow:0_0_0_100vmax_var(--well)] lg:[clip-path:inset(0_-100vmax_0_0)]">
          <Sidebar current={current}>{aside}</Sidebar>
        </div>
      </div>
    </div>
  );
}

/** Every page ends the way public-sector pages do: when it was updated, and a way to report a problem. */
export function PageMeta({ updated }: { updated?: string }) {
  return (
    <div className="mt-16 border-t border-line pt-6 text-[16px] text-ink-2">
      {updated && <p>Page last reviewed: {updated}</p>}
      <p className="mt-2">
        Spotted something wrong, or a hospital we&apos;re missing?{" "}
        <a href={ISSUES_URL} className="link">Tell us on GitHub</a>. We read every report.
      </p>
    </div>
  );
}

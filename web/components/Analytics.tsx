"use client";

/**
 * Google Analytics 4 with Consent Mode v2 and a small cookie banner.
 *
 * - Storage is denied by default (UK GDPR / PECR); GA only sends cookieless
 *   pings until the visitor accepts. The choice lives in localStorage and can
 *   be changed from <CookieSettingsLink />.
 * - Page views are sent here, not by GA, with the query string and fragment
 *   stripped (only utm_* campaign tags are kept), so postcodes, coordinates,
 *   tokens and search terms never reach Google.
 * - Pass the CSP nonce from the x-nonce request header; next/script does not
 *   pick it up on its own.
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const GA_MEASUREMENT_ID = "G-ER8RTTJ040";
const CONSENT_KEY = "analytics-consent";
/** Path prefixes whose next segment is a secret (e.g. an email token); it is replaced with ":token". */
const SECRET_PATHS: string[] = [];
const REOPEN_EVENT = "analytics-consent:reopen";

type Choice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** origin + path, plus any utm_* tags; everything else in the URL is dropped. */
function cleanPath(pathname: string): string {
  for (const prefix of SECRET_PATHS) {
    if (pathname.startsWith(prefix)) return prefix + pathname.slice(prefix.length).replace(/^[^/]+/, ":token");
  }
  return pathname;
}

function cleanLocation(): string {
  const { origin, search } = window.location;
  const pathname = cleanPath(window.location.pathname);
  const utm = new URLSearchParams();
  new URLSearchParams(search).forEach((value, key) => {
    if (key.startsWith("utm_")) utm.set(key, value);
  });
  const qs = utm.toString();
  return `${origin}${pathname}${qs ? `?${qs}` : ""}`;
}

const BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
try { if (localStorage.getItem('${CONSENT_KEY}') === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' }); } catch (e) {}
gtag('js', new Date());
var gaPath=(function(p){var s=${JSON.stringify(SECRET_PATHS)};for(var i=0;i<s.length;i++){if(p.indexOf(s[i])===0)return s[i]+p.slice(s[i].length).replace(/^[^/]+/,':token')}return p})(location.pathname);
var gaLoc=(function(){var l=window.location,u=new URLSearchParams();new URLSearchParams(l.search).forEach(function(v,k){if(k.indexOf('utm_')===0)u.set(k,v)});var q=u.toString();return l.origin+gaPath+(q?'?'+q:'')})();
gtag('set', { page_location: gaLoc, page_path: gaPath });
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false, page_location: gaLoc });
gtag('event', 'page_view', { page_location: gaLoc, page_path: gaPath, page_title: document.title });
`;

export function Analytics({ nonce }: { nonce?: string }) {
  const pathname = usePathname();
  const firstView = useRef(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Storage is only readable on the client, so the banner decision waits for mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(readChoice() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  // The first page view is sent by the bootstrap script; this covers client-side navigations.
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const loc = cleanLocation();
    const path = cleanPath(pathname);
    // Every later event (scroll, outbound click) reports this clean address, not the raw URL.
    window.gtag?.("set", { page_location: loc, page_path: path });
    window.gtag?.("event", "page_view", { page_location: loc, page_path: path, page_title: document.title });
  }, [pathname]);

  const decide = (choice: Choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      /* storage blocked: the choice still applies to this visit */
    }
    window.gtag?.("consent", "update", { analytics_storage: choice });
    setOpen(false);
  };

  return (
    <>
      <Script id="ga-bootstrap" strategy="afterInteractive" nonce={nonce}>
        {BOOTSTRAP}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />

      {open && (
        <div
          role="region"
          aria-label="Cookie choice"
          className="fixed inset-x-3 bottom-3 z-[1000] rounded-xl border border-white/10 bg-[#16130f] p-4 text-[#f3eee6] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] sm:inset-x-auto sm:left-5 sm:max-w-sm sm:p-5"
        >
          <p className="text-[15px] font-semibold leading-snug">Can I count your visit?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#bdb5a8]">
            Google Analytics tells me how many people visit and which pages they use. No ads, nothing sold, and nothing
            you type or search is sent.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => decide("granted")}
              className="h-10 flex-1 rounded-lg bg-[#f3eee6] px-4 text-sm font-medium text-[#16130f] transition-opacity hover:opacity-85"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              className="h-10 flex-1 rounded-lg border border-white/20 px-4 text-sm font-medium text-[#f3eee6] transition-colors hover:border-white/60"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Reopens the banner so visitors can change their choice. Style it to match the footer it sits in. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}

import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

// Feed iframed on the trust page https://www.sath.nhs.uk/wards-services/ed-waiting-times/
const DATA_URL = "https://sath.chilli-is.co.uk/times";
const PAGE_URL = "https://www.sath.nhs.uk/wards-services/ed-waiting-times/";

const IDS: Record<string, string> = {
  "princess royal|adults": "princess-royal-telford-ae",
  "princess royal|children": "princess-royal-telford-childrens-ae",
  "royal shrewsbury|adults": "royal-shrewsbury-ae",
  "royal shrewsbury|children": "royal-shrewsbury-childrens-ae",
};

const METRIC =
  "Average time it will take for a doctor or nurse to see a patient (after triage on arrival); the trust's current ED wait";

export const sath: Adapter = {
  id: "sath",
  name: "Shrewsbury and Telford Hospital",
  sourceUrl: PAGE_URL,
  async fetch(signal) {
    const html = await fetchText(DATA_URL, signal);
    const ctx = { sourceName: "The Shrewsbury and Telford Hospital NHS Trust", sourceUrl: PAGE_URL, fetchedAt: new Date().toISOString() };
    const text = htmlToText(html);
    const upd = text.match(/last updated on\s+(.{0,60}?\d{1,2}[:.]\d{2})/i);
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd[1]) : null;

    const out: LiveSite[] = [];
    const re = /(Princess Royal|Royal Shrewsbury) Hospital Emergency Department \(A&E\) - (adults|children)\s+((?:\d+\s*hours?,?\s*)?(?:\d+\s*minutes?)?)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const id = IDS[`${m[1].toLowerCase()}|${m[2].toLowerCase()}`];
      if (!id || out.some((s) => s.id === id)) continue;
      out.push(liveSite(id, { waitMinutes: parseDuration(m[3]), metric: METRIC, sourceUpdatedAt }, ctx));
    }
    return requireSites(out, "sath", 2);
  },
};

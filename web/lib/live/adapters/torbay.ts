import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseIntSafe, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://www.torbayandsouthdevon.nhs.uk/services/urgent-and-emergency-care/ed-miu-waiting-times/";

const MATCHERS: [RegExp, string][] = [
  [/newton abbot/i, "newton-abbot-utc"],
  [/totnes/i, "totnes-miu"],
  [/torbay hospital/i, "torbay-hospital-ae"],
];

// Definition published on the page.
const METRIC =
  "Current longest waiting time to be seen: the longest time a patient is currently waiting to be fully assessed by a nurse, paramedic or urgent care clinician";

export const torbay: Adapter = {
  id: "torbay",
  name: "Torbay and South Devon",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const ctx = { sourceName: "Torbay and South Devon NHS Foundation Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const pageText = htmlToText(html);
    const upd = pageText.match(/last updated at\s+(.{0,60}?\d{1,2}[:.]\d{2}\s*(?:am|pm)?)/i);
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd[1]) : null;

    const out: LiveSite[] = [];
    const seen = new Set<string>();
    for (const seg of html.split(/<div class="hospital\b/i).slice(1)) {
      const t = htmlToText("<div " + seg.split(/<div class="row"/i)[0]);
      const head = t.split(/Current longest waiting time/i)[0];
      const id = MATCHERS.find(([re]) => re.test(head))?.[1];
      if (!id || seen.has(id)) continue;
      const m = t.match(/Current longest waiting time to be seen\s+(.+?)\s+Current number of patients waiting to be seen\s+(.+?)\s+Total number/i);
      if (!m) continue;
      seen.add(id);
      const closed = /\bclosed\b/i.test(head);
      const hours = head.match(/(\d{1,2}(?:[.:]\d{2})?\s*(?:am|pm)\s+to\s+\d{1,2}(?:[.:]\d{2})?\s*(?:am|pm)[^.]*|24 hours[^.]*)/i)?.[1];
      out.push(
        liveSite(
          id,
          {
            waitMinutes: closed ? null : parseDuration(m[1]),
            metric: METRIC,
            patientsWaiting: closed ? null : parseIntSafe(m[2]),
            open: closed ? false : null,
            openingHours: hours?.trim(),
            sourceUpdatedAt,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "torbay", 2);
  },
};

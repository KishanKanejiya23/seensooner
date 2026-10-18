import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseBand, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://whh.nhs.uk/urgent-and-emergency-care-wait-times/";

const MATCHERS: [RegExp, string][] = [
  [/warrington/i, "warrington-ae"],
  [/runcorn/i, "runcorn-utc"],
];

// Page definition: "the current maximum waiting time to be seen and fully
// assessed by a medical or nursing professional", published only in bands
// (less than 2 hours / 2 to 4 hours / over 4 hours).
const DEF = "Current maximum wait to be seen and fully assessed by a medical or nursing professional";

export const whh: Adapter = {
  id: "whh",
  name: "Warrington and Halton (North Cheshire and Mersey)",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const dash = html.match(/class="edmonitor-dashboard"[\s\S]*$/i)?.[0];
    if (!dash) throw new Error("whh: edmonitor dashboard not found");
    const upd = htmlToText(dash.match(/class="edmonitor-updated">([\s\S]*?)<\/p>/i)?.[1] ?? "");
    const sourceUpdatedAt = parseLondonDateTime(upd);
    const ctx = { sourceName: "North Cheshire and Mersey NHS FT", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    for (const seg of dash.split(/<h3 class="nhsuk-panel__title">/i).slice(1)) {
      const title = htmlToText(seg.split("</h3>")[0]);
      const id = MATCHERS.find(([re]) => re.test(title))?.[1];
      if (!id || out.some((s) => s.id === id)) continue;
      const raw = htmlToText(seg.match(/Wait time to be seen:<\/strong>([\s\S]*?)<\/p>/i)?.[1] ?? "");
      const band = parseBand(raw);
      const closed = /closed/i.test(raw);
      out.push(liveSite(id, {
        waitMinutes: closed || !band ? null : band.minutes,
        waitBand: band && band.band !== "exact" ? band.band : undefined,
        waitHigh: band?.high ?? null,
        metric: `${DEF}. Banded: source says "${raw || "no figure"}"${band?.band === "over" ? " (value is the lower bound)" : band?.band === "under" ? " (value is the upper bound)" : band?.band === "range" ? " (value is the lower end)" : ""}`,
        open: closed ? false : null,
        sourceUpdatedAt,
      }, ctx));
    }
    return requireSites(out, "whh");
  },
};

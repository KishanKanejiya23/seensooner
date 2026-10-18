import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

// The table is an iframe on https://www.ncic.nhs.uk/locations/emergency-care-hub
const DATA_URL = "https://www.ncic.nhs.uk/waiting/ncic-live-emergencytimes.html";
const PAGE_URL = "https://www.ncic.nhs.uk/locations/emergency-care-hub";

const MATCHERS: [RegExp, string][] = [
  [/cumberland infirmary/i, "cumberland-infirmary-ae"],
  [/west cumberland/i, "west-cumberland-ae"],
  [/penrith/i, "penrith-utc"],
  [/keswick/i, "keswick-utc"],
];

export const ncic: Adapter = {
  id: "ncic",
  name: "North Cumbria Integrated Care",
  sourceUrl: PAGE_URL,
  async fetch(signal) {
    const html = await fetchText(DATA_URL, signal);
    const ctx = { sourceName: "North Cumbria Integrated Care NHS FT", sourceUrl: PAGE_URL, fetchedAt: new Date().toISOString() };
    const text = htmlToText(html);
    const upd = text.match(/correct as of\s+(.{0,60}?\d{4})/i);
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd[1]) : null;

    const out: LiveSite[] = [];
    const seen = new Set<string>();
    for (const row of html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
      // Some rows omit closing </td>, so split on opening tags instead.
      const cells = row.split(/<td\b[^>]*>/i).slice(1).map((c) => htmlToText(c.replace(/<\/tr>[\s\S]*$/i, "")));
      if (cells.length < 4) continue;
      const [nameCell, inDept, band] = cells;
      const id = MATCHERS.find(([re]) => re.test(nameCell))?.[1];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const closed = /closed/i.test(inDept) || /closed/i.test(band);
      const [lowText, highText] = band.split(/\s+-\s+/);
      const low = parseDuration(lowText);
      const high = parseDuration(highText);
      const hours = nameCell.match(/(24hrs|\d[^A-Z]*\(\d+ days\))/i)?.[1];
      out.push(
        liveSite(
          id,
          {
            waitMinutes: closed ? null : low,
            waitBand: !closed && high != null && high !== low ? "range" : undefined,
            waitHigh: high,
            metric:
              closed || low == null
                ? "Average wait to see a clinician (after first assessment), published as a band"
                : `Average wait to see a clinician (after first assessment). Published as a band ("${band}"); value is the lower end${high != null ? `, upper end ${high} min` : ""}`,
            open: closed ? false : low != null ? true : null,
            openingHours: hours,
            sourceUpdatedAt,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "ncic", 2);
  },
};

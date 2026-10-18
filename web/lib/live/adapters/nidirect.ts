import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://www.nidirect.gov.uk/articles/emergency-department-waiting-times";

// Ordered: first match wins ("Mid Ulster Hospital" must be tested before "Ulster Hospital").
const MATCHERS: [RegExp, string][] = [
  [/\bmater\b/i, "mater-belfast-ae"],
  [/royal victoria/i, "royal-victoria-belfast-ae"],
  [/royal children|sick children/i, "royal-belfast-childrens-ae"],
  [/antrim/i, "antrim-area-ae"],
  [/causeway/i, "causeway-ae"],
  [/mid ulster/i, "mid-ulster-miu"],
  [/craigavon/i, "craigavon-area-ae"],
  [/daisy hill/i, "daisy-hill-ae"],
  [/south tyrone/i, "south-tyrone-miu"],
  [/ulster hospital/i, "ulster-hospital-ae"],
  [/downe/i, "downe-hospital-ucc"],
  [/lagan valley/i, "lagan-valley-ucc"],
  [/altnagelvin/i, "altnagelvin-ae"],
  [/south west acute/i, "south-west-acute-ae"],
  [/omagh/i, "omagh-hospital-utc"],
];

const METRIC =
  "Median time from arrival to being seen by a clinician, across patients currently waiting in the department (HSC Trust figures via nidirect)";

export const nidirect: Adapter = {
  id: "nidirect",
  name: "nidirect (HSC Northern Ireland)",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const fetchedAt = new Date().toISOString();
    const ctx = { sourceName: "nidirect", sourceUrl: URL, fetchedAt };
    const out: LiveSite[] = [];
    const seen = new Set<string>();

    const tableRe = /<table[\s\S]*?<\/table>/gi;
    let t: RegExpExecArray | null;
    while ((t = tableRe.exec(html))) {
      const before = htmlToText(html.slice(Math.max(0, t.index - 3000), t.index));
      const upd = [...before.matchAll(/last updated:?\s*(.{0,60}?\d{4})/gi)].pop();
      const sourceUpdatedAt = upd ? parseLondonDateTime(upd[1]) : null;

      for (const row of t[0].match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => htmlToText(c[1]));
        if (cells.length < 3) continue;
        const [nameCell, hours, waitText] = cells;
        const id = MATCHERS.find(([re]) => re.test(nameCell))?.[1];
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const mins = parseDuration(waitText);
        const closed = /closed/i.test(waitText);
        out.push(
          liveSite(
            id,
            {
              waitMinutes: closed ? null : mins,
              metric: mins == null && !closed ? `${METRIC}. Source currently says: "${waitText}"` : METRIC,
              open: closed ? false : mins != null ? true : null,
              openingHours: hours || undefined,
              sourceUpdatedAt,
            },
            ctx,
          ),
        );
      }
    }
    return requireSites(out, "nidirect", 5);
  },
};

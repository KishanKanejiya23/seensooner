import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, parseDuration, parseIntSafe } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";
import { item, parseVerseOne } from "./verseone.ts";

const URL = "https://www.kmhealthandcare.uk/utc-waiting-times";

// Only blocks with a machine timestamp are used. Faversham and Herne Bay are
// currently hand-typed static text on the page (no "Last updated"), so they are
// deliberately not matched.
const MATCHERS: [RegExp, string][] = [
  [/ashford|william harvey/i, "ashford-william-harvey-utc"],
  [/canterbury utc/i, "kent-canterbury-utc"],
  [/darent valley/i, "darent-valley-utc"],
  [/deal/i, "deal-victoria-utc"],
  [/dover|buckland/i, "dover-buckland-utc"],
  [/folkestone/i, "folkestone-rvh-utc"],
  [/gravesham/i, "gravesham-utc"],
  [/maidstone/i, "maidstone-utc"],
  [/margate|queen elizabeth the queen mother/i, "margate-qeqm-utc"],
  [/tunbridge wells/i, "tunbridge-wells-utc"],
  [/whitstable|estuary view/i, "whitstable-estuary-view-utc"],
];

const METRIC = "Longest waiting time (longest current wait at the UTC); updated about every 30 minutes";

export const kentMedway: Adapter = {
  id: "kent-medway",
  name: "NHS Kent and Medway UTCs",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const ctx = { sourceName: "NHS Kent and Medway", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    const seen = new Set<string>();
    for (const b of parseVerseOne(html)) {
      const id = MATCHERS.find(([re]) => re.test(b.title))?.[1];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const waitText = item(b, /longest waiting time/i);
      out.push(
        liveSite(
          id,
          {
            // A blank "Longest waiting time" means the source published no figure.
            waitMinutes: parseDuration(waitText),
            metric: METRIC,
            patientsWaiting: parseIntSafe(item(b, /number of patients waiting/i)),
            sourceUpdatedAt: b.updatedAt,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "kent-medway", 4);
  },
};

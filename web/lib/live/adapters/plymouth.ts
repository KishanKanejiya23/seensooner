import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, parseDuration, parseIntSafe } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";
import { item, parseVerseOne } from "./verseone.ts";

const URL = "https://www.plymouthhospitals.nhs.uk/urgent-waiting-times/";

const MATCHERS: [RegExp, string][] = [
  [/dartmoor/i, "derriford-dartmoor-utc"],
  [/cumberland/i, "cumberland-centre-plymouth-utc"],
  [/tavistock/i, "tavistock-miu"],
  [/kingsbridge|south hams/i, "kingsbridge-miu"],
  [/derriford/i, "derriford-plymouth-ae"],
];

const METRIC = "Current longest waiting time to see a practitioner";

export const plymouth: Adapter = {
  id: "plymouth",
  name: "University Hospitals Plymouth",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const ctx = { sourceName: "University Hospitals Plymouth NHS Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    const seen = new Set<string>();
    for (const b of parseVerseOne(html)) {
      const id = MATCHERS.find(([re]) => re.test(b.title))?.[1];
      if (!id || seen.has(id)) continue;
      const waitText = item(b, /longest waiting time/i);
      if (waitText == null) continue;
      seen.add(id);
      out.push(
        liveSite(
          id,
          {
            waitMinutes: parseDuration(waitText),
            metric: METRIC,
            patientsWaiting: parseIntSafe(item(b, /number of patients waiting/i)),
            sourceUpdatedAt: b.updatedAt,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "plymouth", 2);
  },
};

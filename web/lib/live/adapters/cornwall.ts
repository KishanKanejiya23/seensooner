import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseIntSafe, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

// Royal Cornwall Hospitals Trust's waiting-times feed, embedded (iframe) on both
// royalcornwallhospitals.nhs.uk and cornwallft.nhs.uk. Covers the Truro ED,
// West Cornwall UTC and all Cornwall Partnership MIUs.
const DATA_URL =
  "https://doclibrary-rcht.cornwall.nhs.uk/RoyalCornwallHospitalsTrust/Internet/DocumentsLibrary/MinorInjuryUnit/MIUWaits.aspx";
const PAGE_URL = "https://royalcornwallhospitals.nhs.uk/waiting-times/urgent-care/";

const MATCHERS: [RegExp, string][] = [
  [/west cornwall|penzance/i, "west-cornwall-penzance-utc"],
  [/royal cornwall|truro/i, "royal-cornwall-truro-ae"],
  [/bodmin/i, "bodmin-miu"],
  [/camborne|redruth/i, "camborne-redruth-miu"],
  [/falmouth/i, "falmouth-miu"],
  [/helston/i, "helston-miu"],
  [/launceston/i, "launceston-miu"],
  [/liskeard/i, "liskeard-miu"],
  [/newquay/i, "newquay-miu"],
  [/st\.? austell/i, "st-austell-miu"],
  [/scilly/i, "isles-of-scilly-miu"],
  [/stratton|bude/i, "stratton-bude-miu"],
];

const METRIC = "Current longest waiting time to be seen (the longest any patient now in the queue has waited)";

function span(seg: string, idSuffix: string): { attrs: string; text: string } | null {
  const m = seg.match(new RegExp(`<span[^>]*id="[^"]*${idSuffix}"([^>]*)>([\\s\\S]*?)</span>`, "i"));
  return m ? { attrs: m[1], text: htmlToText(m[2]) } : null;
}

export const cornwall: Adapter = {
  id: "cornwall",
  name: "Royal Cornwall Hospitals / Cornwall Partnership",
  sourceUrl: PAGE_URL,
  async fetch(signal) {
    const html = await fetchText(DATA_URL, signal);
    const fetchedAt = new Date().toISOString();
    const ctx = { sourceName: "Royal Cornwall Hospitals NHS Trust", sourceUrl: PAGE_URL, fetchedAt };
    const text = htmlToText(html);
    const upd = text.match(/last updated\s+(.{0,40}?\d{1,2}[:.]\d{2})/i);
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd[1]) : null;

    const out: LiveSite[] = [];
    const seen = new Set<string>();
    for (const seg of html.split(/class="MIUWaits_Row"/i).slice(1)) {
      const nameM = seg.match(/_divDepartment"[^>]*>([\s\S]*?)<\/div>/i);
      if (!nameM) continue;
      const name = htmlToText(nameM[1]);
      const id = MATCHERS.find(([re]) => re.test(name))?.[1];
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const wait = span(seg, "lblLongestWaitingTime");
      const status = span(seg, "lblStatus");
      const hours = span(seg, "lblOpeningTimes");
      const waiting = span(seg, "lblPatientsWaiting");
      const titleMins = wait?.attrs.match(/title="(\d+)"/)?.[1];
      const mins = titleMins != null ? parseInt(titleMins, 10) : parseDuration(wait?.text);
      const closed = status ? /closed/i.test(status.text) : false;
      const open = status ? !closed : null;

      out.push(
        liveSite(
          id,
          {
            waitMinutes: closed ? null : mins,
            metric: METRIC,
            patientsWaiting: closed ? null : parseIntSafe(waiting?.text),
            open,
            openingHours: hours?.text || undefined,
            sourceUpdatedAt,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "cornwall", 5);
  },
};

import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseBand, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://www.uhcw.nhs.uk/live-waiting-times/";

// Ordered; first match wins. Items with a blank name and the Emergency
// Gynaecology Unit are skipped (blank items cannot be attributed safely).
const MATCHERS: [RegExp, string][] = [
  [/children/i, "university-hospital-coventry-childrens-ae"],
  [/gynaecology/i, ""],
  [/university hospital coventry emergency department/i, "university-hospital-coventry-ae"],
  [/rugby/i, "rugby-st-cross-utc"],
  [/^minor injuries unit/i, "university-hospital-coventry-miu"],
];

export const uhcw: Adapter = {
  id: "uhcw",
  name: "University Hospitals Coventry and Warwickshire",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const upd = htmlToText(html.match(/class="live_waiting_time_update_time">([\s\S]*?)<\/span>/i)?.[1] ?? "");
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd) : null;
    const ctx = { sourceName: "University Hospitals Coventry and Warwickshire NHS Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    for (const seg of html.split(/<div class="live_waiting_time_item\b/i).slice(1)) {
      const name = htmlToText(seg.match(/live_waiting_time_item_hospital_name">([\s\S]*?)<\/div>/i)?.[1] ?? "");
      const raw = htmlToText(seg.match(/<div>\s*WAIT TIME\s*([\s\S]*?)<\/div>/i)?.[1] ?? "");
      if (!name || !raw) continue;
      const id = MATCHERS.find(([re]) => re.test(name))?.[1];
      if (!id || out.some((s) => s.id === id)) continue;
      const band = parseBand(raw);
      const hours = htmlToText(seg.match(/live_waiting_time_item_open_message">([\s\S]*?)<\/div>/i)?.[1] ?? "");
      out.push(liveSite(id, {
        waitMinutes: band ? band.minutes : null,
        waitBand: band && band.band !== "exact" ? band.band : undefined,
        waitHigh: band?.high ?? null,
        metric: `Current wait time, published in bands only: source says "${raw}"${band?.band === "over" ? " (value is the lower bound)" : band?.band === "under" ? " (value is the upper bound)" : ""}`,
        openingHours: hours || undefined,
        sourceUpdatedAt,
      }, ctx));
    }
    return requireSites(out, "uhcw", 2);
  },
};

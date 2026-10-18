import type { Adapter } from "../types.ts";
import { fetchText, htmlToText, londonTodayAt, parseClock, parseDuration, parseIntSafe } from "../util.ts";
import { liveSite } from "../sites.ts";

const URL = "https://www.wyevalley.nhs.uk/waiting-times.aspx";

export const wyeValley: Adapter = {
  id: "wye-valley",
  name: "Wye Valley NHS Trust",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const text = htmlToText(html);
    const wait = text.match(/Current longest waiting time to be seen by a doctor in ED\s+(.{1,60}?)\s+(?:Current number|Total number|Accessibility|$)/i);
    if (!wait) throw new Error("wye-valley: longest wait not found on page");
    const mins = parseDuration(wait[1]);
    if (mins == null) throw new Error(`wye-valley: could not parse "${wait[1]}"`);
    const waiting = text.match(/Current number of patients waiting to be seen in ED\s+(\d+)/i)?.[1];
    const los = text.match(/Average length of stay\s+(.{1,60}?)\s+Current longest/i)?.[1];
    // The page gives only a time of day ("last updated at 6.10pm"); date assumed today (London).
    const clockText = text.match(/last updated at\s+(\d{1,2}[.:]\d{2}\s*(?:am|pm)?)/i)?.[1];
    const clock = clockText ? parseClock(clockText) : null;
    const losMins = parseDuration(los);
    return [
      liveSite(
        "hereford-county-ae",
        {
          waitMinutes: mins,
          metric:
            "Current longest waiting time to be seen by a doctor in ED" +
            (losMins != null ? ` (average length of stay ${losMins} min)` : ""),
          patientsWaiting: parseIntSafe(waiting),
          sourceUpdatedAt: clock ? londonTodayAt(clock.h, clock.mi) : null,
        },
        { sourceName: "Wye Valley NHS Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() },
      ),
    ];
  },
};

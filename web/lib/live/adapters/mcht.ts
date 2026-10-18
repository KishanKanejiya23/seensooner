import type { Adapter } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseIntSafe } from "../util.ts";
import { liveSite } from "../sites.ts";

const URL = "https://www.mcht.nhs.uk/patients-and-visitors/waiting-times-feed";

export const mcht: Adapter = {
  id: "mcht",
  name: "Mid Cheshire Hospitals (Leighton)",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const items = new Map<string, string>();
    const re = /waiting-times__list__item__heading">([\s\S]*?)<\/strong>\s*<span class="waiting-times__list__item__result">([\s\S]*?)<\/span>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) items.set(htmlToText(m[1]).toLowerCase(), htmlToText(m[2]));
    const majors = parseDuration(items.get("majors wait time"));
    const minors = parseDuration(items.get("minor injuries wait time"));
    if (majors == null && minors == null) throw new Error("mcht: no wait times found on page");
    const inDept = parseIntSafe(items.get("patients in the department"));
    return [
      liveSite(
        "leighton-crewe-ae",
        {
          // Headline = majors (the general ED stream); minors given in the metric text.
          waitMinutes: majors ?? minors,
          metric:
            majors != null
              ? `Majors wait time${minors != null ? ` (minor injuries wait: ${minors} min)` : ""}${inDept != null ? `; ${inDept} patients in the department` : ""}`
              : "Minor injuries wait time",
          sourceUpdatedAt: null, // page publishes no timestamp
        },
        { sourceName: "Mid Cheshire Hospitals NHS FT", sourceUrl: URL, fetchedAt: new Date().toISOString() },
      ),
    ];
  },
};

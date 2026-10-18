import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://www.pah.nhs.uk/patients-visitors/waiting-times/urgent-and-emergency-care-waiting-times/";

const SECTIONS: [RegExp, string, string][] = [
  [/^emergency department \(adults\)/i, "princess-alexandra-harlow-ae", "Current longest waiting time to be seen by an Emergency Department doctor"],
  [/^children'?s emergency department/i, "princess-alexandra-harlow-childrens-ae", "Current longest waiting time to be seen by a Children's Emergency Department doctor"],
];

export const pah: Adapter = {
  id: "pah",
  name: "Princess Alexandra Hospital, Harlow",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const ctx = { sourceName: "The Princess Alexandra Hospital NHS Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    for (const seg of html.split(/<div class="ed-section">/i).slice(1)) {
      const title = htmlToText(seg.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "");
      const sec = SECTIONS.find(([re]) => re.test(title));
      if (!sec) continue;
      const pairs = [...seg.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)].map((m) => [htmlToText(m[1]), htmlToText(m[2])]);
      const doctor = pairs.find(([k]) => /longest waiting time to be seen by an? .*doctor/i.test(k));
      const triage = pairs.find(([k]) => /triage nurse/i.test(k));
      if (!doctor) continue;
      const triageMins = parseDuration(triage?.[1]);
      out.push(
        liveSite(
          sec[1],
          {
            waitMinutes: parseDuration(doctor[1]),
            metric: sec[2] + (triageMins != null ? ` (longest wait for triage nurse: ${triageMins} min)` : ""),
            // Source publishes no timestamp; it states the data refreshes every five minutes.
            sourceUpdatedAt: null,
          },
          ctx,
        ),
      );
    }
    return requireSites(out, "pah", 1);
  },
};

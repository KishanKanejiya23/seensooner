import type { Adapter, LiveSite } from "../types.ts";
import { fetchText, htmlToText, parseDuration, parseLondonDateTime } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

const URL = "https://www.swbh.nhs.uk/patients-visitors/live-ae-wait-times/";

const BASE = "Estimated longest length of time a patient will wait for treatment or admission";

export const swbh: Adapter = {
  id: "swbh",
  name: "Sandwell and West Birmingham (Midland Met)",
  sourceUrl: URL,
  async fetch(signal) {
    const html = await fetchText(URL, signal);
    const sec = html.match(/class="page-block ed-wait-times"[\s\S]*?<\/section>/i)?.[0];
    if (!sec) throw new Error("swbh: wait-times section not found");
    const upd = htmlToText(sec.match(/correct as of<\/p>\s*<h4[^>]*>([\s\S]*?)<\/h4>/i)?.[1] ?? "");
    const sourceUpdatedAt = upd ? parseLondonDateTime(upd) : null;
    const vals = new Map<string, number | null>();
    for (const m of sec.matchAll(/<h4>\s*([^<:]+):\s*<strong>([\s\S]*?)<\/strong>/gi)) vals.set(m[1].trim().toLowerCase(), parseDuration(htmlToText(m[2])));

    const ctx = { sourceName: "Sandwell and West Birmingham NHS Trust", sourceUrl: URL, fetchedAt: new Date().toISOString() };
    const out: LiveSite[] = [];
    const majors = vals.get("majors emergency dept");
    const minors = vals.get("minors emergency dept");
    if (majors != null || minors != null) {
      out.push(liveSite("midland-metropolitan-ae", {
        waitMinutes: majors ?? minors ?? null,
        metric: majors != null ? `${BASE} (Majors ED${minors != null ? `; Minors ED: ${minors} min` : ""})` : `${BASE} (Minors ED)`,
        sourceUpdatedAt,
      }, ctx));
    }
    const kids = vals.get("children's emergency dept") ?? vals.get("children’s emergency dept");
    if (kids != null) out.push(liveSite("midland-metropolitan-childrens-ae", { waitMinutes: kids, metric: `${BASE} (Children's ED)`, sourceUpdatedAt }, ctx));
    return requireSites(out, "swbh");
  },
};

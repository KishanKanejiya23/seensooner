import type { Adapter, LiveSite } from "../types.ts";
import { fetchJson } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

// JSON API the trust page calls from /scripts/emergency-department-waiting-times.js
const DATA_URL = "https://trustmigration.uhbdev.co.uk/AE_API/api.php";
const PAGE_URL = "https://www.uhb.nhs.uk/services/emergency-department/live-emergency-department-a-and-e-waiting-times/";

const IDS: Record<string, string> = {
  "good hope": "good-hope-ae",
  heartlands: "heartlands-ae",
  "queen elizabeth": "queen-elizabeth-birmingham-ae",
  solihull: "solihull-utc",
};

interface Row { Site?: string; WTBS?: number; "HH:MM"?: string }

export const uhb: Adapter = {
  id: "uhb",
  name: "University Hospitals Birmingham",
  sourceUrl: PAGE_URL,
  async fetch(signal) {
    const rows = await fetchJson<Row[]>(DATA_URL, signal);
    if (!Array.isArray(rows)) throw new Error("uhb: unexpected response shape");
    const ctx = { sourceName: "University Hospitals Birmingham NHS FT", sourceUrl: PAGE_URL, fetchedAt: new Date().toISOString() };
    const metric = "Longest wait time to be seen";
    const out: LiveSite[] = [];
    for (const r of rows) {
      const id = IDS[(r.Site ?? "").trim().toLowerCase()];
      if (!id || typeof r.WTBS !== "number" || !Number.isFinite(r.WTBS)) continue;
      // API publishes no timestamp (the page shows the viewer's clock).
      out.push(liveSite(id, { waitMinutes: r.WTBS, metric, open: true, sourceUpdatedAt: null }, ctx));
    }
    requireSites(out, "uhb", 2);
    // The trust page treats a missing Solihull row as "UTC currently closed (open 08:00-20:00)".
    if (!out.some((s) => s.id === "solihull-utc")) {
      out.push(liveSite("solihull-utc", { waitMinutes: null, metric, open: false, sourceUpdatedAt: null }, ctx));
    }
    return out;
  },
};

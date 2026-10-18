import type { Adapter, LiveSite } from "../types.ts";
import { fetchJson } from "../util.ts";
import { liveSite, requireSites } from "../sites.ts";

// JSON endpoint polled by the trust's own page (edwaitingtimes.mkuh.nhs.uk).
const DATA_URL = "https://edwaitingtimes.mkuh.nhs.uk/Home/GetData2";
const PAGE_URL = "https://edwaitingtimes.mkuh.nhs.uk/Home/IndexCorp/";

interface Stat {
  DateStamp?: string;
  AllPatientCount?: number; AllTriageWait?: number; AllAverageWaitTime?: number;
  AllPaedsCount?: number; PaedsTriageWait?: number; PaedsAverageWaitTime?: number;
  AdultTimeInDepartment?: number; PaedsTimeInDepartment?: number;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export const mkuh: Adapter = {
  id: "mkuh",
  name: "Milton Keynes University Hospital",
  sourceUrl: PAGE_URL,
  async fetch(signal) {
    const data = await fetchJson<{ WaitingTimeStats?: Stat[] }>(DATA_URL, signal);
    const s = data.WaitingTimeStats?.[0];
    if (!s || num(s.AllAverageWaitTime) == null) throw new Error("mkuh: no WaitingTimeStats in response");
    const ms = s.DateStamp?.match(/\/Date\((\d+)\)\//)?.[1];
    const sourceUpdatedAt = ms ? new Date(parseInt(ms, 10)).toISOString() : null;
    const ctx = { sourceName: "Milton Keynes University Hospital NHS FT", sourceUrl: PAGE_URL, fetchedAt: new Date().toISOString() };
    const base = "Average waiting time for initial assessment (triage) in the last hour";
    const out: LiveSite[] = [
      liveSite("milton-keynes-ae", {
        waitMinutes: num(s.AllAverageWaitTime),
        metric: `${base} (whole department)` + (num(s.AdultTimeInDepartment) != null ? `; average adult time in department ${s.AdultTimeInDepartment} min` : ""),
        patientsWaiting: num(s.AllTriageWait),
        sourceUpdatedAt,
      }, ctx),
    ];
    if (num(s.PaedsAverageWaitTime) != null) {
      out.push(liveSite("milton-keynes-childrens-ae", {
        waitMinutes: num(s.PaedsAverageWaitTime),
        metric: `${base} (paediatric)` + (num(s.PaedsTimeInDepartment) != null ? `; average paediatric time in department ${s.PaedsTimeInDepartment} min` : ""),
        patientsWaiting: num(s.PaedsTriageWait),
        sourceUpdatedAt,
      }, ctx));
    }
    return requireSites(out, "mkuh");
  },
};

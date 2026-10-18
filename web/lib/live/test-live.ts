// Run: node --experimental-strip-types web/lib/live/test-live.ts
// Hits every live source once and prints what each adapter returned.
import { getLiveSites } from "./index.ts";

function pad(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n);
}

function fmtWait(m: number | null): string {
  if (m == null) return "—";
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
}

const t0 = Date.now();
const { sites, sources } = await getLiveSites();
const ms = Date.now() - t0;

console.log("\nSOURCES");
console.log(pad("source", 16), pad("ok", 4), pad("count", 6), "error");
for (const s of sources) console.log(pad(s.id, 16), pad(s.ok ? "yes" : "NO", 4), pad(String(s.count), 6), s.error ?? "");

for (const src of sources.filter((s) => s.ok)) {
  console.log(`\n== ${src.name} (${src.sourceUrl})`);
  for (const x of sites.filter((s) => s.sourceUrl === src.sourceUrl)) {
    const upd = x.sourceUpdatedAt ? new Date(x.sourceUpdatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "no source timestamp";
    const extra = [x.patientsWaiting != null ? `${x.patientsWaiting} waiting` : "", x.open === false ? "CLOSED" : ""].filter(Boolean).join(", ");
    console.log("  ", pad(`${x.name}${x.unit ? ` – ${x.unit}` : ""}`, 62), pad(x.kind, 12), pad(fmtWait(x.waitMinutes), 7), pad(upd, 22), extra);
  }
}

const ok = sources.filter((s) => s.ok).length;
const withWait = sites.filter((s) => s.waitMinutes != null).length;
const byNation = sites.reduce<Record<string, number>>((acc, s) => ((acc[s.nation] = (acc[s.nation] ?? 0) + 1), acc), {});
console.log(`\nTOTAL: ${sites.length} sites (${withWait} with a wait figure) from ${ok}/${sources.length} sources in ${ms} ms`);
console.log("By nation:", byNation);

// Sanity checks: fail the run if anything looks fabricated or malformed.
const problems: string[] = [];
for (const s of sites) {
  if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng)) problems.push(`${s.id}: bad coordinates`);
  if (s.waitMinutes != null && (s.waitMinutes < 0 || s.waitMinutes > 48 * 60)) problems.push(`${s.id}: implausible wait ${s.waitMinutes}`);
  if (s.sourceUpdatedAt && Math.abs(Date.now() - Date.parse(s.sourceUpdatedAt)) > 7 * 86400_000) problems.push(`${s.id}: source timestamp >7 days off (${s.sourceUpdatedAt})`);
  if (!s.metric) problems.push(`${s.id}: empty metric`);
}
if (problems.length) {
  console.log("\nPROBLEMS:\n  " + problems.join("\n  "));
  process.exitCode = 1;
}
if (ok < sources.length) process.exitCode = 1;

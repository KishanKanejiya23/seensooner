import type { Adapter, LiveSite } from "./types.ts";
import { nidirect } from "./adapters/nidirect.ts";
import { cornwall } from "./adapters/cornwall.ts";
import { plymouth } from "./adapters/plymouth.ts";
import { torbay } from "./adapters/torbay.ts";
import { kentMedway } from "./adapters/kent-medway.ts";
import { ncic } from "./adapters/ncic.ts";
import { pah } from "./adapters/pah.ts";
import { mkuh } from "./adapters/mkuh.ts";
import { sath } from "./adapters/sath.ts";
import { wyeValley } from "./adapters/wye-valley.ts";
import { mcht } from "./adapters/mcht.ts";
import { swbh } from "./adapters/swbh.ts";
import { uhb } from "./adapters/uhb.ts";
import { whh } from "./adapters/whh.ts";
import { uhcw } from "./adapters/uhcw.ts";

export type { Adapter, LiveSite, SiteKind } from "./types.ts";

export const ADAPTERS: Adapter[] = [
  nidirect,
  cornwall,
  plymouth,
  torbay,
  kentMedway,
  ncic,
  pah,
  mkuh,
  sath,
  wyeValley,
  mcht,
  swbh,
  uhb,
  whh,
  uhcw,
];

export interface SourceStatus { id: string; name: string; sourceUrl: string; ok: boolean; count: number; error?: string }

const ADAPTER_TIMEOUT_MS = 8000;

async function runAdapter(a: Adapter): Promise<LiveSite[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error(`${a.id}: timed out after ${ADAPTER_TIMEOUT_MS / 1000}s`)), ADAPTER_TIMEOUT_MS);
  try {
    // Race too, in case an adapter ignores the signal somewhere.
    return await Promise.race([
      a.fetch(ctrl.signal),
      new Promise<never>((_, reject) => ctrl.signal.addEventListener("abort", () => reject(ctrl.signal.reason), { once: true })),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Runs every adapter in parallel. Never throws; failures are reported per source. */
export async function getLiveSites(): Promise<{ sites: LiveSite[]; sources: SourceStatus[] }> {
  const results = await Promise.allSettled(ADAPTERS.map(runAdapter));
  const sites: LiveSite[] = [];
  const ids = new Set<string>();
  const sources: SourceStatus[] = results.map((r, i) => {
    const a = ADAPTERS[i];
    if (r.status === "fulfilled") {
      let count = 0;
      for (const s of r.value) {
        if (ids.has(s.id)) continue; // first adapter wins on a duplicate id
        ids.add(s.id);
        sites.push(s);
        count++;
      }
      return { id: a.id, name: a.name, sourceUrl: a.sourceUrl, ok: true, count };
    }
    const reason = r.reason;
    const error = reason instanceof Error ? reason.message : String(reason);
    return { id: a.id, name: a.name, sourceUrl: a.sourceUrl, ok: false, count: 0, error };
  });
  return { sites, sources };
}

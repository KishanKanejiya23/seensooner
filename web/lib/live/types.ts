export type SiteKind = "AE" | "UTC" | "MIU" | "CHILDREN_AE";

export interface LiveSite {
  id: string;            // stable slug, e.g. "royal-victoria-belfast-ae"
  name: string;          // "Royal Victoria Hospital"
  unit?: string;         // "Emergency Department", "Minor Injuries Unit"
  kind: SiteKind;
  nation: "England" | "Wales" | "Scotland" | "Northern Ireland";
  region?: string;       // "Belfast", "South West", ...
  trust: string;         // operating trust / health board
  lat: number; lng: number;
  postcode?: string;
  waitMinutes: number | null;   // null = source says unavailable/closed
  /** Set when the source only publishes a band: "over" = lower bound, "under" = upper bound, "range" = low..waitHigh. */
  waitBand?: "over" | "under" | "range";
  waitHigh?: number | null;
  metric: string;        // plain English of what the number means, as the source defines it
  patientsWaiting?: number | null;
  open?: boolean | null; // if known
  openingHours?: string;
  sourceUpdatedAt: string | null; // ISO, the SOURCE's own timestamp if it publishes one, else null
  fetchedAt: string;     // ISO, when we fetched
  sourceName: string;    // "nidirect", "NHS Wales"
  sourceUrl: string;     // human-visitable official page to verify
}

export interface Adapter {
  id: string;
  name: string;
  sourceUrl: string;
  fetch(signal: AbortSignal): Promise<LiveSite[]>;
}

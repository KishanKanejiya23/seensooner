import type { LiveSite } from "./types.ts";

// Static metadata for every site an adapter can return. Adapters only parse the
// live numbers and look the rest up here by id.
// Coordinates: hospital postcode looked up via api.postcodes.io (Oct 2026) and
// hardcoded. Exceptions noted inline.

export type SiteMeta = Pick<
  LiveSite,
  "id" | "name" | "unit" | "kind" | "nation" | "region" | "trust" | "lat" | "lng" | "postcode" | "openingHours"
>;

const LIST: SiteMeta[] = [
  // ---------------- Northern Ireland (nidirect) ----------------
  { id: "mater-belfast-ae", name: "Mater Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Belfast", trust: "Belfast Health and Social Care Trust", postcode: "BT14 6AB", lat: 54.608381, lng: -5.939294 },
  { id: "royal-victoria-belfast-ae", name: "Royal Victoria Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Belfast", trust: "Belfast Health and Social Care Trust", postcode: "BT12 6BA", lat: 54.594237, lng: -5.954027 },
  { id: "royal-belfast-childrens-ae", name: "Royal Belfast Hospital for Sick Children", unit: "Children's Emergency Department", kind: "CHILDREN_AE", nation: "Northern Ireland", region: "Belfast", trust: "Belfast Health and Social Care Trust", postcode: "BT12 6BE", lat: 54.592555, lng: -5.958738 },
  // BT41 2RL was terminated in 2025; coordinates from postcodes.io terminated record (same as BT41 2QB).
  { id: "antrim-area-ae", name: "Antrim Area Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Northern", trust: "Northern Health and Social Care Trust", postcode: "BT41 2RL", lat: 54.732963, lng: -6.185875 },
  { id: "causeway-ae", name: "Causeway Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Northern", trust: "Northern Health and Social Care Trust", postcode: "BT52 1HS", lat: 55.124453, lng: -6.65379 },
  { id: "mid-ulster-miu", name: "Mid Ulster Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "Northern Ireland", region: "Northern", trust: "Northern Health and Social Care Trust", postcode: "BT45 5EX", lat: 54.761852, lng: -6.614449 },
  { id: "craigavon-area-ae", name: "Craigavon Area Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Southern", trust: "Southern Health and Social Care Trust", postcode: "BT63 5QQ", lat: 54.434586, lng: -6.409064 },
  { id: "daisy-hill-ae", name: "Daisy Hill Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Southern", trust: "Southern Health and Social Care Trust", postcode: "BT35 8DR", lat: 54.181367, lng: -6.352526 },
  // Hospital address is BT71 4AU (Carland Road).
  { id: "south-tyrone-miu", name: "South Tyrone Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "Northern Ireland", region: "Southern", trust: "Southern Health and Social Care Trust", postcode: "BT71 4AU", lat: 54.510275, lng: -6.770537 },
  { id: "ulster-hospital-ae", name: "Ulster Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "South Eastern", trust: "South Eastern Health and Social Care Trust", postcode: "BT16 1RH", lat: 54.596789, lng: -5.811301 },
  { id: "downe-hospital-ucc", name: "Downe Hospital", unit: "Urgent Care Centre / Minor Injuries", kind: "UTC", nation: "Northern Ireland", region: "South Eastern", trust: "South Eastern Health and Social Care Trust", postcode: "BT30 6RL", lat: 54.324132, lng: -5.692132 },
  { id: "lagan-valley-ucc", name: "Lagan Valley Hospital", unit: "Urgent Care Centre", kind: "UTC", nation: "Northern Ireland", region: "South Eastern", trust: "South Eastern Health and Social Care Trust", postcode: "BT28 1JP", lat: 54.506189, lng: -6.045574 },
  { id: "altnagelvin-ae", name: "Altnagelvin Area Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Western", trust: "Western Health and Social Care Trust", postcode: "BT47 6SB", lat: 54.986589, lng: -7.295332 },
  // BT74 6DN centroid is ~1.5 km off the hospital; coordinates from the HSC ArcGIS hospital layer.
  { id: "south-west-acute-ae", name: "South West Acute Hospital", unit: "Emergency Department", kind: "AE", nation: "Northern Ireland", region: "Western", trust: "Western Health and Social Care Trust", postcode: "BT74 6DN", lat: 54.367, lng: -7.6377 },
  { id: "omagh-hospital-utc", name: "Omagh Hospital and Primary Care Complex", unit: "Urgent Care and Treatment Centre", kind: "UTC", nation: "Northern Ireland", region: "Western", trust: "Western Health and Social Care Trust", postcode: "BT79 0NR", lat: 54.586918, lng: -7.252414 },

  // ---------------- Cornwall (RCHT MIU waits page) ----------------
  { id: "royal-cornwall-truro-ae", name: "Royal Cornwall Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "South West", trust: "Royal Cornwall Hospitals NHS Trust", postcode: "TR1 3LJ", lat: 50.266675, lng: -5.091511 },
  { id: "west-cornwall-penzance-utc", name: "West Cornwall Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South West", trust: "Royal Cornwall Hospitals NHS Trust", postcode: "TR18 2PF", lat: 50.122046, lng: -5.543031 },
  { id: "bodmin-miu", name: "Bodmin Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "PL31 2QT", lat: 50.468561, lng: -4.741998 },
  { id: "camborne-redruth-miu", name: "Camborne Redruth Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "TR15 3ER", lat: 50.229371, lng: -5.244424 },
  { id: "falmouth-miu", name: "Falmouth Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "TR11 2JA", lat: 50.155671, lng: -5.086189 },
  { id: "helston-miu", name: "Helston Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "TR13 8DR", lat: 50.091946, lng: -5.264928 },
  { id: "launceston-miu", name: "Launceston Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "PL15 9JD", lat: 50.6282, lng: -4.359104 },
  { id: "liskeard-miu", name: "Liskeard Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "PL14 3XD", lat: 50.461573, lng: -4.451016 },
  { id: "newquay-miu", name: "Newquay Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "TR7 1RQ", lat: 50.411047, lng: -5.074255 },
  { id: "st-austell-miu", name: "St Austell Community Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "PL26 6AD", lat: 50.327864, lng: -4.772405 },
  { id: "isles-of-scilly-miu", name: "St Mary's Hospital, Isles of Scilly", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "TR21 0LE", lat: 49.913046, lng: -6.309354 },
  { id: "stratton-bude-miu", name: "Stratton Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "Cornwall Partnership NHS Foundation Trust", postcode: "EX23 9BP", lat: 50.83005, lng: -4.516157 },

  // ---------------- Plymouth (UHP) ----------------
  { id: "derriford-plymouth-ae", name: "Derriford Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "South West", trust: "University Hospitals Plymouth NHS Trust", postcode: "PL6 8DH", lat: 50.416707, lng: -4.113712 },
  { id: "derriford-dartmoor-utc", name: "Derriford Hospital, Dartmoor Building", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South West", trust: "University Hospitals Plymouth NHS Trust", postcode: "PL6 8DH", lat: 50.416707, lng: -4.113712 },
  { id: "cumberland-centre-plymouth-utc", name: "Cumberland Centre", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South West", trust: "University Hospitals Plymouth NHS Trust", postcode: "PL1 4JZ", lat: 50.369991, lng: -4.167875 },
  { id: "tavistock-miu", name: "Tavistock Hospital", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "University Hospitals Plymouth NHS Trust", postcode: "PL19 8LD", lat: 50.547167, lng: -4.153604 },
  { id: "kingsbridge-miu", name: "South Hams Hospital, Kingsbridge", unit: "Minor Injury Unit", kind: "MIU", nation: "England", region: "South West", trust: "University Hospitals Plymouth NHS Trust", postcode: "TQ7 1AT", lat: 50.28869, lng: -3.778849 },

  // ---------------- Torbay and South Devon ----------------
  { id: "torbay-hospital-ae", name: "Torbay Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "South West", trust: "Torbay and South Devon NHS Foundation Trust", postcode: "TQ2 7AA", lat: 50.482303, lng: -3.553819 },
  { id: "newton-abbot-utc", name: "Newton Abbot Community Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South West", trust: "Torbay and South Devon NHS Foundation Trust", postcode: "TQ12 2SL", lat: 50.536754, lng: -3.607934 },
  { id: "totnes-miu", name: "Totnes Community Hospital", unit: "Minor Injuries Unit", kind: "MIU", nation: "England", region: "South West", trust: "Torbay and South Devon NHS Foundation Trust", postcode: "TQ9 5GH", lat: 50.432757, lng: -3.684209 },

  // ---------------- Kent and Medway UTCs ----------------
  { id: "ashford-william-harvey-utc", name: "William Harvey Hospital, Ashford", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "East Kent Hospitals University NHS Foundation Trust", postcode: "TN24 0LZ", lat: 51.14149, lng: 0.91624 },
  { id: "kent-canterbury-utc", name: "Kent and Canterbury Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "East Kent Hospitals University NHS Foundation Trust", postcode: "CT1 3NG", lat: 51.266593, lng: 1.087113 },
  { id: "darent-valley-utc", name: "Darent Valley Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "NHS Kent and Medway (UTC provider)", postcode: "DA2 8DA", lat: 51.434952, lng: 0.258673 },
  { id: "deal-victoria-utc", name: "Victoria Hospital, Deal", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "Kent Community Health NHS Foundation Trust", postcode: "CT14 9UA", lat: 51.219401, lng: 1.389511 },
  { id: "dover-buckland-utc", name: "Buckland Hospital, Dover", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "NHS Kent and Medway (UTC provider)", postcode: "CT17 0HD", lat: 51.132061, lng: 1.292412 },
  { id: "folkestone-rvh-utc", name: "Royal Victoria Hospital, Folkestone", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "Kent Community Health NHS Foundation Trust", postcode: "CT19 5BN", lat: 51.086144, lng: 1.171551 },
  { id: "gravesham-utc", name: "Gravesham Community Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "NHS Kent and Medway (UTC provider)", postcode: "DA11 0DG", lat: 51.443184, lng: 0.365674 },
  { id: "maidstone-utc", name: "Maidstone Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "Maidstone and Tunbridge Wells NHS Trust", postcode: "ME16 9QQ", lat: 51.273661, lng: 0.484004 },
  { id: "margate-qeqm-utc", name: "Queen Elizabeth The Queen Mother Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "East Kent Hospitals University NHS Foundation Trust", postcode: "CT9 4AN", lat: 51.378059, lng: 1.389411 },
  { id: "tunbridge-wells-utc", name: "Tunbridge Wells Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "Maidstone and Tunbridge Wells NHS Trust", postcode: "TN2 4QJ", lat: 51.148451, lng: 0.307497 },
  { id: "whitstable-estuary-view-utc", name: "Estuary View, Whitstable", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "South East", trust: "Kent Community Health NHS Foundation Trust", postcode: "CT5 3SB", lat: 51.35776, lng: 1.05773 },

  // ---------------- North Cumbria (NCIC) ----------------
  { id: "cumberland-infirmary-ae", name: "Cumberland Infirmary", unit: "Emergency Department", kind: "AE", nation: "England", region: "North East and Cumbria", trust: "North Cumbria Integrated Care NHS Foundation Trust", postcode: "CA2 7HY", lat: 54.896504, lng: -2.957796 },
  { id: "west-cumberland-ae", name: "West Cumberland Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "North East and Cumbria", trust: "North Cumbria Integrated Care NHS Foundation Trust", postcode: "CA28 8JG", lat: 54.530059, lng: -3.562598 },
  { id: "penrith-utc", name: "Penrith Community Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "North East and Cumbria", trust: "North Cumbria Integrated Care NHS Foundation Trust", postcode: "CA11 8HX", lat: 54.657001, lng: -2.74328 },
  { id: "keswick-utc", name: "Keswick Community Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "North East and Cumbria", trust: "North Cumbria Integrated Care NHS Foundation Trust", postcode: "CA12 5PH", lat: 54.606708, lng: -3.139827 },

  // ---------------- Princess Alexandra, Harlow ----------------
  { id: "princess-alexandra-harlow-ae", name: "Princess Alexandra Hospital", unit: "Emergency Department (Adults)", kind: "AE", nation: "England", region: "East of England", trust: "The Princess Alexandra Hospital NHS Trust", postcode: "CM20 1QX", lat: 51.771322, lng: 0.087315 },
  { id: "princess-alexandra-harlow-childrens-ae", name: "Princess Alexandra Hospital", unit: "Children's Emergency Department", kind: "CHILDREN_AE", nation: "England", region: "East of England", trust: "The Princess Alexandra Hospital NHS Trust", postcode: "CM20 1QX", lat: 51.771322, lng: 0.087315 },

  // ---------------- Milton Keynes ----------------
  { id: "milton-keynes-ae", name: "Milton Keynes University Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "East of England", trust: "Milton Keynes University Hospital NHS Foundation Trust", postcode: "MK6 5LD", lat: 52.026384, lng: -0.73576 },
  { id: "milton-keynes-childrens-ae", name: "Milton Keynes University Hospital", unit: "Paediatric Emergency Department", kind: "CHILDREN_AE", nation: "England", region: "East of England", trust: "Milton Keynes University Hospital NHS Foundation Trust", postcode: "MK6 5LD", lat: 52.026384, lng: -0.73576 },

  // ---------------- Shrewsbury and Telford ----------------
  { id: "royal-shrewsbury-ae", name: "Royal Shrewsbury Hospital", unit: "Emergency Department (Adults)", kind: "AE", nation: "England", region: "Midlands", trust: "The Shrewsbury and Telford Hospital NHS Trust", postcode: "SY3 8XQ", lat: 52.709274, lng: -2.793689 },
  { id: "royal-shrewsbury-childrens-ae", name: "Royal Shrewsbury Hospital", unit: "Emergency Department (Children)", kind: "CHILDREN_AE", nation: "England", region: "Midlands", trust: "The Shrewsbury and Telford Hospital NHS Trust", postcode: "SY3 8XQ", lat: 52.709274, lng: -2.793689 },
  { id: "princess-royal-telford-ae", name: "Princess Royal Hospital", unit: "Emergency Department (Adults)", kind: "AE", nation: "England", region: "Midlands", trust: "The Shrewsbury and Telford Hospital NHS Trust", postcode: "TF1 6TF", lat: 52.712122, lng: -2.511488 },
  { id: "princess-royal-telford-childrens-ae", name: "Princess Royal Hospital", unit: "Emergency Department (Children)", kind: "CHILDREN_AE", nation: "England", region: "Midlands", trust: "The Shrewsbury and Telford Hospital NHS Trust", postcode: "TF1 6TF", lat: 52.712122, lng: -2.511488 },

  // ---------------- Wye Valley ----------------
  { id: "hereford-county-ae", name: "Hereford County Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "Wye Valley NHS Trust", postcode: "HR1 2ER", lat: 52.058529, lng: -2.707776 },

  // ---------------- Mid Cheshire ----------------
  { id: "leighton-crewe-ae", name: "Leighton Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "North West", trust: "Mid Cheshire Hospitals NHS Foundation Trust", postcode: "CW1 4QJ", lat: 53.117701, lng: -2.475863 },

  // ---------------- Sandwell and West Birmingham ----------------
  { id: "midland-metropolitan-ae", name: "Midland Metropolitan University Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "Sandwell and West Birmingham NHS Trust", postcode: "B66 2QT", lat: 52.491258, lng: -1.949846 },
  { id: "midland-metropolitan-childrens-ae", name: "Midland Metropolitan University Hospital", unit: "Children's Emergency Department", kind: "CHILDREN_AE", nation: "England", region: "Midlands", trust: "Sandwell and West Birmingham NHS Trust", postcode: "B66 2QT", lat: 52.491258, lng: -1.949846 },

  // ---------------- University Hospitals Birmingham ----------------
  { id: "good-hope-ae", name: "Good Hope Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "University Hospitals Birmingham NHS Foundation Trust", postcode: "B75 7RR", lat: 52.567382, lng: -1.812036 },
  { id: "heartlands-ae", name: "Heartlands Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "University Hospitals Birmingham NHS Foundation Trust", postcode: "B9 5SS", lat: 52.480233, lng: -1.829961 },
  { id: "queen-elizabeth-birmingham-ae", name: "Queen Elizabeth Hospital Birmingham", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "University Hospitals Birmingham NHS Foundation Trust", postcode: "B15 2GW", lat: 52.451833, lng: -1.942563 },
  { id: "solihull-utc", name: "Solihull Hospital", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "Midlands", trust: "University Hospitals Birmingham NHS Foundation Trust", postcode: "B91 2JL", lat: 52.417138, lng: -1.774358, openingHours: "08:00 to 20:00 daily" },


  // ---------------- Warrington and Halton (North Cheshire and Mersey) ----------------
  { id: "warrington-ae", name: "Warrington Hospital", unit: "Emergency Department", kind: "AE", nation: "England", region: "North West", trust: "North Cheshire and Mersey NHS Foundation Trust", postcode: "WA5 1QG", lat: 53.393989, lng: -2.610717 },
  { id: "runcorn-utc", name: "Runcorn Urgent Treatment Centre (Halton Hospital)", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "North West", trust: "North Cheshire and Mersey NHS Foundation Trust", postcode: "WA7 2DA", lat: 53.323281, lng: -2.694682 },

  // ---------------- Coventry and Warwickshire ----------------
  { id: "university-hospital-coventry-ae", name: "University Hospital Coventry", unit: "Emergency Department", kind: "AE", nation: "England", region: "Midlands", trust: "University Hospitals Coventry and Warwickshire NHS Trust", postcode: "CV2 2DX", lat: 52.421229, lng: -1.438395 },
  { id: "university-hospital-coventry-childrens-ae", name: "University Hospital Coventry", unit: "Children's Emergency Department", kind: "CHILDREN_AE", nation: "England", region: "Midlands", trust: "University Hospitals Coventry and Warwickshire NHS Trust", postcode: "CV2 2DX", lat: 52.421229, lng: -1.438395 },
  { id: "university-hospital-coventry-miu", name: "University Hospital Coventry", unit: "Minor Injuries Unit", kind: "MIU", nation: "England", region: "Midlands", trust: "University Hospitals Coventry and Warwickshire NHS Trust", postcode: "CV2 2DX", lat: 52.421229, lng: -1.438395 },
  { id: "rugby-st-cross-utc", name: "Hospital of St Cross, Rugby", unit: "Urgent Treatment Centre", kind: "UTC", nation: "England", region: "Midlands", trust: "University Hospitals Coventry and Warwickshire NHS Trust", postcode: "CV22 5PX", lat: 52.365291, lng: -1.259018 },
];

export const SITES: Record<string, SiteMeta> = Object.fromEntries(LIST.map((s) => [s.id, s]));

export function siteMeta(id: string): SiteMeta {
  const s = SITES[id];
  if (!s) throw new Error(`Unknown site id "${id}" (add it to lib/live/sites.ts)`);
  return s;
}

export type LiveFields = Pick<LiveSite, "waitMinutes" | "metric" | "sourceUpdatedAt"> &
  Partial<Pick<LiveSite, "patientsWaiting" | "open" | "openingHours" | "waitBand" | "waitHigh">>;

export interface SourceCtx { sourceName: string; sourceUrl: string; fetchedAt: string }

/** Merge static metadata with parsed live numbers. */
export function liveSite(id: string, live: LiveFields, ctx: SourceCtx): LiveSite {
  const meta = siteMeta(id);
  const out: LiveSite = {
    ...meta,
    waitMinutes: live.waitMinutes,
    metric: live.metric,
    sourceUpdatedAt: live.sourceUpdatedAt,
    fetchedAt: ctx.fetchedAt,
    sourceName: ctx.sourceName,
    sourceUrl: ctx.sourceUrl,
  };
  if (live.patientsWaiting !== undefined) out.patientsWaiting = live.patientsWaiting;
  if (live.open !== undefined) out.open = live.open;
  if (live.openingHours) out.openingHours = live.openingHours;
  if (live.waitBand) {
    out.waitBand = live.waitBand;
    out.waitHigh = live.waitHigh ?? null;
  }
  return out;
}

/** Throw if an adapter parsed nothing, so it fails loudly instead of returning []. */
export function requireSites(sites: LiveSite[], adapterId: string, min = 1): LiveSite[] {
  if (sites.length < min) throw new Error(`${adapterId}: parsed ${sites.length} sites (expected at least ${min}); page layout may have changed`);
  return sites;
}

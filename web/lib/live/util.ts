// Shared helpers for live adapters. Node built-ins only (global fetch, Intl).

export const USER_AGENT = "SeenSooner/0.1 (+independent NHS wait-time aggregator)";

type NextInit = RequestInit & { next?: { revalidate: number } };

const DEFAULT_TIMEOUT_MS = 8000;

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const t = AbortSignal.timeout(ms);
  return signal ? AbortSignal.any([signal, t]) : t;
}

async function doFetch(url: string, signal?: AbortSignal, init: NextInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const req: NextInit = {
    ...init,
    signal: withTimeout(signal, timeoutMs),
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/json;q=0.9,*/*;q=0.8", ...(init.headers as Record<string, string> | undefined) },
    next: { revalidate: 600 },
  };
  let res: Response;
  try {
    res = await fetch(url, req);
  } catch (err) {
    const e = err as Error;
    if (e.name === "TimeoutError" || e.name === "AbortError") throw new Error(`Timed out fetching ${url}`);
    throw new Error(`Network error fetching ${url}: ${e.message}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res;
}

export async function fetchText(url: string, signal?: AbortSignal, init?: NextInit, timeoutMs?: number): Promise<string> {
  const res = await doFetch(url, signal, init, timeoutMs);
  const text = await res.text();
  if (!text.trim()) throw new Error(`Empty response from ${url}`);
  return text;
}

export async function fetchJson<T = unknown>(url: string, signal?: AbortSignal, init?: NextInit, timeoutMs?: number): Promise<T> {
  const text = await fetchText(url, signal, init, timeoutMs);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

// ---------- text helpers ----------

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", hellip: "…",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Strip scripts/styles/comments and tags, decode entities, collapse whitespace. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseIntSafe(s: string | null | undefined): number | null {
  if (s == null) return null;
  const m = String(s).replace(/,/g, "").match(/-?\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/**
 * Parse a human duration into whole minutes. Returns null when the text has no
 * duration (e.g. "N/A", "Not Available", "Currently Closed", "-", "").
 * Handles: "1 hour 24 minutes", "84 mins", "2h 5m", "2 hrs 13 mins", "1hr 21min",
 * "0 hours 43 minutes", "3 hours & 14 minutes", "6 Hours, 40 Minutes, 25 Seconds",
 * "9 hours", "01 hour 42 minutes", "04:43" (HH:MM), "60 minutes", "1.5 hours".
 * Seconds are truncated (floor) so we never overstate.
 */
export function parseDuration(input: string | null | undefined): number | null {
  if (input == null) return null;
  const s = decodeEntities(String(input)).toLowerCase().replace(/\s+/g, " ").trim();
  if (!s || !/\d/.test(s)) return null;

  const hhmm = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);

  let total = 0;
  let matched = false;
  const re = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = parseFloat(m[1]);
    const unit = m[2];
    matched = true;
    if (unit.startsWith("h")) total += n * 60;
    else if (unit.startsWith("m")) total += n;
    // seconds ignored (floored)
  }
  if (matched) return Math.floor(total);

  // bare number: assume minutes ("84")
  const bare = s.match(/^(\d+)$/);
  if (bare) return parseInt(bare[1], 10);
  return null;
}

/**
 * Banded waits ("Over 4 hours", "more than 2 hours", "less than 1 hour",
 * "2 to 4 hours", "2 hours - 2 hours 30 minutes"). Returns the threshold number
 * the source itself quotes: the lower bound for "over"/ranges, the upper bound
 * for "less than". Callers must describe the band in `metric`.
 */
export function parseBand(input: string | null | undefined): { minutes: number; band: "over" | "under" | "range" | "exact"; high?: number } | null {
  if (!input) return null;
  const s = input.toLowerCase().replace(/\s+/g, " ").trim();
  const over = s.match(/^(?:wait time )?(?:over|more than|greater than|at least|\+)\s*(.+)$/);
  if (over) { const m = parseDuration(over[1]); return m == null ? null : { minutes: m, band: "over" }; }
  const under = s.match(/^(?:wait time )?(?:under|less than|below|up to)\s*(.+)$/);
  if (under) { const m = parseDuration(under[1]); return m == null ? null : { minutes: m, band: "under" }; }
  const range = s.match(/^(.+?)\s*(?:-|–|to)\s*(.+)$/);
  if (range) {
    const hi = parseDuration(range[2]);
    let lo: number | null;
    if (/^\d+(?:\.\d+)?$/.test(range[1].trim())) {
      // "2 to 4 hours": unit only on the right-hand side
      lo = hi == null ? null : /hour|hr|\dh\b/.test(range[2]) ? Math.round(parseFloat(range[1]) * 60) : parseFloat(range[1]);
    } else {
      lo = parseDuration(range[1]);
    }
    if (lo != null) return { minutes: lo, band: "range", high: hi ?? undefined };
  }
  const exact = parseDuration(s);
  return exact == null ? null : { minutes: exact, band: "exact" };
}

// ---------- time helpers (Europe/London) ----------

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

export function monthFromName(name: string): number | null {
  return MONTHS[name.slice(0, 4).toLowerCase()] ?? MONTHS[name.slice(0, 3).toLowerCase()] ?? null;
}

const londonFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  hourCycle: "h23",
});

function londonParts(d: Date): { y: number; mo: number; d: number; h: number; mi: number } {
  const p: Record<string, string> = {};
  for (const part of londonFmt.formatToParts(d)) p[part.type] = part.value;
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
}

/** Convert a wall-clock time in Europe/London to an ISO UTC string. */
export function londonToIso(y: number, mo: number, d: number, h: number, mi: number): string | null {
  if (![y, mo, d, h, mi].every(Number.isFinite)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // London is UTC+0 or UTC+1; find the offset that round-trips.
  for (const offsetH of [0, 1]) {
    const t = guess - offsetH * 3600_000;
    const p = londonParts(new Date(t));
    if (p.y === y && p.mo === mo && p.d === d && p.h === h && p.mi === mi) return new Date(t).toISOString();
  }
  return new Date(guess - 3600_000).toISOString();
}

/** Convert "6.10pm" / "18:10" / "6:09PM" / "6.00 pm" to 24h hours+minutes. */
export function parseClock(s: string): { h: number; mi: number } | null {
  const m = s.trim().toLowerCase().match(/^(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mi = m[2] ? parseInt(m[2], 10) : 0;
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 23 || mi > 59) return null;
  return { h, mi };
}

/**
 * Find a "day month-name year" date and a clock time anywhere in a snippet and
 * convert to ISO (London local -> UTC). E.g. "6.00 pm, Sunday 18 October 2026",
 * "18:10 on 18th October 2026", "18 October 2026 at 6:05pm", "18 Oct 2026 18:10".
 */
export function parseLondonDateTime(snippet: string): string | null {
  const s = snippet.replace(/\s+/g, " ");
  const date = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i);
  const time = s.match(/(\d{1,2}[.:]\d{2})\s*(am|pm)?/i);
  if (!date || !time) return null;
  const clock = parseClock(time[1] + (time[2] ?? ""));
  const mo = monthFromName(date[2]);
  if (!clock || !mo) return null;
  return londonToIso(parseInt(date[3], 10), mo, parseInt(date[1], 10), clock.h, clock.mi);
}

/**
 * A source that publishes only a time of day ("last updated at 6.10pm"):
 * attach today's London date, or yesterday's if that would be in the future.
 */
export function londonTodayAt(h: number, mi: number, now = new Date()): string | null {
  const p = londonParts(now);
  let iso = londonToIso(p.y, p.mo, p.d, h, mi);
  if (iso && new Date(iso).getTime() - now.getTime() > 10 * 60_000) {
    const y = new Date(now.getTime() - 86_400_000);
    const q = londonParts(y);
    iso = londonToIso(q.y, q.mo, q.d, h, mi);
  }
  return iso;
}

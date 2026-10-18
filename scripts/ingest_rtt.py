#!/usr/bin/env python3
"""Build web/data/rtt.json from NHS England's monthly RTT full-extract CSVs.

Stdlib only, so it runs as-is in a GitHub Action. Downloads are cached in
data-raw/cache, so re-runs only fetch new months.

    python3 scripts/ingest_rtt.py            # latest 13 months
    MONTHS=6 python3 scripts/ingest_rtt.py

Source: NHS England, Consultant-led Referral to Treatment Waiting Times,
Open Government Licence v3.0. Locations: NHS ODS (ORD API) + postcodes.io.
"""
import csv
import io
import json
import os
import re
import sys
import time
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data-raw", "cache")
OUT = os.path.join(ROOT, "web", "data", "rtt.json")
UA = "SeenSooner/0.1 (+independent NHS wait-time comparison)"
INDEX = "https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/rtt-data-{}/"
MONTHS = int(os.environ.get("MONTHS", "13"))
MIN_PATHWAYS = 20  # below this a median is noise

MON = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}

# Plain-English names. The official name stays alongside for SEO and honesty.
SPECIALTIES = {
    "C_100": ("general-surgery", "General surgery", "Hernias, gallbladder, appendix and other abdominal operations"),
    "C_101": ("urology", "Urology", "Kidneys, bladder and prostate"),
    "C_110": ("orthopaedics", "Orthopaedics", "Bones and joints, including hip and knee replacements"),
    "C_120": ("ent", "Ear, nose and throat", "Hearing, sinuses, tonsils and voice"),
    "C_130": ("ophthalmology", "Eyes", "Cataracts, glaucoma and other eye conditions"),
    "C_140": ("oral-surgery", "Oral surgery", "Wisdom teeth and mouth surgery"),
    "C_150": ("neurosurgery", "Neurosurgery", "Brain and spine surgery"),
    "C_160": ("plastic-surgery", "Plastic surgery", "Reconstructive surgery, skin lesions and hands"),
    "C_170": ("cardiothoracic-surgery", "Heart and chest surgery", "Heart bypass, valves and lung operations"),
    "C_300": ("general-medicine", "General medicine", "Adult medical conditions not covered elsewhere"),
    "C_301": ("gastroenterology", "Gastroenterology", "Stomach, bowel and liver"),
    "C_320": ("cardiology", "Cardiology", "Heart conditions"),
    "C_330": ("dermatology", "Dermatology", "Skin conditions"),
    "C_340": ("respiratory", "Respiratory medicine", "Lungs and breathing"),
    "C_400": ("neurology", "Neurology", "Brain and nerves, including migraine, epilepsy and MS"),
    "C_410": ("rheumatology", "Rheumatology", "Arthritis and autoimmune joint conditions"),
    "C_430": ("elderly-medicine", "Elderly medicine", "Care of older people"),
    "C_502": ("gynaecology", "Gynaecology", "Women's reproductive health"),
    "X04": ("paediatrics", "Children's services", "Paediatric specialties combined"),
    "X03": ("mental-health", "Mental health", "Consultant-led mental health services"),
    "C_999": ("all", "All specialties", "Every consultant-led specialty combined"),
}


def get(url, binary=False, tries=3):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception:
            if attempt == tries - 1:
                raise
            time.sleep(2 * (attempt + 1))


def financial_years(now):
    start = now.year if now.month >= 4 else now.year - 1
    return [f"{y}-{str(y + 1)[2:]}" for y in (start, start - 1)]


def month_links():
    links = {}
    for fy in financial_years(datetime.now(timezone.utc)):
        try:
            html = get(INDEX.format(fy))
        except Exception as e:
            print(f"warn: index {fy}: {e}", file=sys.stderr)
            continue
        for m in re.finditer(r'(https://[^"\']+Full-CSV-data-file-([A-Z][a-z]{2})(\d{2})[^"\']*\.zip)', html):
            url, mon, yy = m.groups()
            key = f"20{yy}-{MON[mon]:02d}"
            # Revised files are re-uploaded later; prefer the newest upload path.
            if key not in links or url > links[key]:
                links[key] = url
    return dict(sorted(links.items())[-MONTHS:])


def load_month(key, url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, os.path.basename(url))
    if not os.path.exists(path):
        print(f"download {key}", file=sys.stderr)
        with open(path + ".part", "wb") as f:
            f.write(get(url, binary=True))
        os.replace(path + ".part", path)
    return path


def buckets_from(header):
    return [i for i, c in enumerate(header) if c.startswith("Gt ")]


def stats(b):
    """b: 105 weekly bucket counts (0-1 wk ... 103-104, 104+)."""
    total = sum(b)
    if total <= 0:
        return None

    def pct(p):
        target, run = total * p, 0.0
        for i, v in enumerate(b):
            if v and run + v >= target:
                # linear interpolation inside the week
                return round(i + (target - run) / v, 1)
            run += v
        return 104.0

    return {
        "total": int(round(total)),
        "median": pct(0.5),
        "p92": pct(0.92),
        "within18": round(100 * sum(b[:18]) / total, 1),
        "over52": int(round(sum(b[52:]))),
    }


def parse_month(path):
    """Return {(provider, tf): {"inc": [...], "done": [...]}} and provider names."""
    agg, names = {}, {}
    with zipfile.ZipFile(path) as z:
        name = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        with z.open(name) as raw:
            r = csv.reader(io.TextIOWrapper(raw, encoding="utf-8-sig", newline=""))
            h = next(r)
            col = {c: i for i, c in enumerate(h)}
            bi = buckets_from(h)
            for row in r:
                part = row[col["RTT Part Type"]]
                kind = "inc" if part == "Part_2" else "done" if part in ("Part_1A", "Part_1B") else None
                tf = row[col["Treatment Function Code"]]
                if not kind or tf not in SPECIALTIES:
                    continue
                code = row[col["Provider Org Code"]]
                names[code] = (row[col["Provider Org Name"]], row[col["Provider Parent Name"]])
                slot = agg.setdefault((code, tf), {"inc": [0.0] * len(bi), "done": [0.0] * len(bi)})[kind]
                for j, i in enumerate(bi):
                    v = row[i]
                    if v:
                        slot[j] += float(v)
    return agg, names


def ods_lookup(codes):
    cache_path = os.path.join(CACHE, "ods.json")
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    todo = [c for c in codes if c not in cache]

    def one(code):
        try:
            d = json.loads(get(f"https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations/{code}"))
            org = d["Organisation"]
            loc = org.get("GeoLoc", {}).get("Location", {})
            roles = org.get("Roles", {}).get("Role", [])
            primary = next((x["id"] for x in roles if x.get("primaryRole")), None)
            return code, {"postcode": loc.get("PostCode"), "town": loc.get("Town"), "role": primary}
        except Exception as e:
            return code, {"postcode": None, "error": str(e)[:80]}

    with ThreadPoolExecutor(8) as ex:
        for code, info in ex.map(one, todo):
            cache[code] = info
    json.dump(cache, open(cache_path, "w"))
    return cache


def geocode(postcodes):
    cache_path = os.path.join(CACHE, "geo.json")
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    todo = sorted({p for p in postcodes if p and p not in cache})
    for i in range(0, len(todo), 100):
        chunk = todo[i : i + 100]
        req = urllib.request.Request(
            "https://api.postcodes.io/postcodes",
            data=json.dumps({"postcodes": chunk}).encode(),
            headers={"Content-Type": "application/json", "User-Agent": UA},
        )
        res = json.loads(urllib.request.urlopen(req, timeout=60).read())["result"]
        for item in res:
            q, r = item["query"], item["result"]
            if r:
                cache[q] = {"lat": r["latitude"], "lng": r["longitude"], "region": r.get("region") or r.get("country")}
    # Terminated postcodes: fall back to the outcode centroid.
    for p in todo:
        if p in cache:
            continue
        try:
            r = json.loads(get(f"https://api.postcodes.io/outcodes/{p.split()[0]}"))["result"]
            cache[p] = {"lat": r["latitude"], "lng": r["longitude"], "region": (r.get("country") or [None])[0], "approx": True}
        except Exception:
            cache[p] = None
    json.dump(cache, open(cache_path, "w"))
    return cache


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


TITLE_KEEP = {"NHS", "UK", "ENT", "BMI", "KIMS", "MSK", "BUPA", "HCA", "SMH", "UCLH", "CIC", "LLP", "PPG"}


def tidy(name):
    words = []
    for w in name.split():
        if w.upper() in TITLE_KEEP:
            words.append(w.upper())
        elif w.lower() in ("and", "of", "for", "in", "at", "on"):
            words.append(w.lower())
        else:
            words.append(w.capitalize())
    out = " ".join(words)
    return out[0].upper() + out[1:] if out else out


def main():
    links = month_links()
    if not links:
        sys.exit("no RTT months found")
    months = list(links)
    print("months:", months[0], "→", months[-1], file=sys.stderr)

    series = {}  # (provider, tf) -> {month: stats}
    names = {}
    for key in months:
        agg, nm = parse_month(load_month(key, links[key]))
        names.update(nm)
        for k, v in agg.items():
            inc, done = stats(v["inc"]), stats(v["done"])
            if inc or done:
                series.setdefault(k, {})[key] = {"inc": inc, "done": done}

    latest = months[-1]
    live = {k: s for k, s in series.items() if s.get(latest, {}).get("inc") and s[latest]["inc"]["total"] >= MIN_PATHWAYS}
    codes = sorted({p for p, _ in live})
    ods = ods_lookup(codes)
    geo = geocode([ods[c].get("postcode") for c in codes])

    providers, slugs = [], set()
    for c in codes:
        raw_name, parent = names[c]
        pc = ods[c].get("postcode")
        g = geo.get(pc) if pc else None
        nice = tidy(raw_name)
        slug = slugify(nice)
        if slug in slugs:
            slug = f"{slug}-{c.lower()}"
        slugs.add(slug)
        providers.append({
            "code": c,
            "slug": slug,
            "name": nice,
            "nhs": c.startswith("R") or "NHS" in raw_name.upper(),
            "icb": tidy(parent),
            "postcode": pc,
            "town": tidy(ods[c].get("town") or "") or None,
            "lat": g["lat"] if g else None,
            "lng": g["lng"] if g else None,
            "region": g.get("region") if g else None,
        })

    waits = []
    for (p, tf), s in sorted(live.items()):
        cur = s[latest]
        waits.append({
            "p": p,
            "s": tf,
            "total": cur["inc"]["total"],
            "median": cur["inc"]["median"],
            "p92": cur["inc"]["p92"],
            "within18": cur["inc"]["within18"],
            "over52": cur["inc"]["over52"],
            # median wait of people who started treatment that month
            "treatedMedian": cur["done"]["median"] if cur["done"] and cur["done"]["total"] >= MIN_PATHWAYS else None,
            "treated": cur["done"]["total"] if cur["done"] else 0,
            "trend": [(s.get(m) or {}).get("inc", {}).get("median") if (s.get(m) or {}).get("inc") else None for m in months],
        })

    specs = [{"code": k, "slug": v[0], "name": v[1], "blurb": v[2]} for k, v in SPECIALTIES.items()]
    out = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "period": latest,
        "months": months,
        "source": {
            "name": "NHS England, Consultant-led Referral to Treatment Waiting Times",
            "url": "https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/",
            "file": links[latest],
            "licence": "Open Government Licence v3.0",
        },
        "specialties": specs,
        "providers": providers,
        "waits": waits,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    located = sum(1 for p in providers if p["lat"] is not None)
    print(f"wrote {OUT}: {len(providers)} providers ({located} located), {len(waits)} waits, {os.path.getsize(OUT)//1024} KB", file=sys.stderr)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Fetch DOL OFLC official prevailing wages for H1B (7/2025 - 6/2026) and produce wages.json.

Source: flag.dol.gov/wage-data/wage-data-downloads
  OFLC_Wages_2025-26.zip → ALC_Export.csv  (official L1/L2/L3/L4, hourly)
                          → Geography.csv   (area code → name mapping)

Output: public/data/wages.json
  { msaCode: { socCode: { L1, L2, L3, L4, area_title, soc_title } } }

L1-L4 are annual wages (hourly × 2080). Area codes are 5-digit CBSA FIPS codes,
same as the Census CBSAFP field in msas.geojson — no additional join needed.
"""

import csv
import io
import json
import zipfile
import requests
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "wages.json"

OFLC_URL = "https://flag.dol.gov/sites/default/files/wages/OFLC_Wages_2025-26.zip"

# Must stay in sync with lib/constants.ts SOC_CODES
SOC_CODES: dict[str, str] = {
    "15-1252": "Software Developer",
    "15-2051": "Data Scientist / AI Engineer",
    "15-1212": "Security Engineer",
    "15-1243": "Data Engineer / DB Architect",
    "15-1244": "DevOps / SRE",
    "15-1241": "Network / Infrastructure",
    "15-1255": "Frontend / Web Developer",
    "17-2061": "Hardware Engineer",
    "15-1299": "Compiler / Platform Eng",
    "15-2041": "Data Analyst",
    "15-1211": "Systems Analyst",
    "15-1251": "Computer Programmer",
}

HOURS_PER_YEAR = 2080  # DOL standard for hourly → annual conversion


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"Downloading OFLC wage data from {OFLC_URL}...")
    resp = requests.get(OFLC_URL, timeout=120, headers={"User-Agent": "h1b-compass/1.0"})
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024 / 1024:.1f} MB")

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        # Load Geography.csv: area code → area name (deduplicated)
        geo_file = next(n for n in zf.namelist() if n.endswith("Geography.csv"))
        area_names: dict[str, str] = {}
        with zf.open(geo_file) as f:
            for row in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")):
                code = row["Area"].strip().zfill(5)
                if code not in area_names:
                    state = row.get("StateAb", "").strip()
                    name = row.get("AreaName", "").strip()
                    area_names[code] = f"{name}, {state}" if state else name

        print(f"Loaded {len(area_names)} geographic areas")

        # Load ALC_Export.csv: official prevailing wages
        alc_file = next(n for n in zf.namelist() if n.endswith("ALC_Export.csv"))
        result: dict[str, dict[str, dict]] = {}
        skipped = 0

        with zf.open(alc_file) as f:
            for row in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")):
                soc = row["SocCode"].strip()
                if soc not in SOC_CODES:
                    continue

                area = row["Area"].strip().zfill(5)

                try:
                    l1 = round(float(row["Level1"]) * HOURS_PER_YEAR)
                    l2 = round(float(row["Level2"]) * HOURS_PER_YEAR)
                    l3 = round(float(row["Level3"]) * HOURS_PER_YEAR)
                    l4 = round(float(row["Level4"]) * HOURS_PER_YEAR)
                except (ValueError, KeyError):
                    skipped += 1
                    continue

                if area not in result:
                    result[area] = {}

                result[area][soc] = {
                    "L1": l1,
                    "L2": l2,
                    "L3": l3,
                    "L4": l4,
                    "area_title": area_names.get(area, area),
                    "soc_title": SOC_CODES[soc],
                }

    print(f"Processed {sum(len(v) for v in result.values())} entries across {len(result)} MSAs")
    if skipped:
        print(f"Skipped {skipped} rows with invalid wage data")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, separators=(",", ":"))
    print(f"Saved → {OUTPUT_PATH}")

    # Spot-check SF
    sf = result.get("41860", {}).get("15-1252")
    if sf:
        print(f"\nSpot-check SF Software Developer (7/2025-6/2026):")
        print(f"  L1=${sf['L1']:,}  L2=${sf['L2']:,}  L3=${sf['L3']:,}  L4=${sf['L4']:,}")


if __name__ == "__main__":
    main()

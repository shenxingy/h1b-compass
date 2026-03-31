#!/usr/bin/env python3
"""
Fetch HUD FY2026 Fair Market Rents and produce rent.json.

Source: HUD Exchange FY26 FMR County Level Data
  https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY26_FMRs.xlsx

Output: public/data/rent.json
  { cbsaCode: { area_name, fmr_0, fmr_1, fmr_2, fmr_3, fmr_4, metro } }

The hud_area_code field encodes the 5-digit CBSA code:
  METROnnnnnMnnnnn  → metro CBSA nnnnn
  NCNTYnnnnnNnnnnn  → non-metro county (skip, no CBSA)

For MSAs with multiple counties we take the MAX 2BR FMR (most conservative
housing cost estimate for the metro area).
"""

import io
import json
import re
import zipfile
from pathlib import Path

import requests
import openpyxl

# ─── Config ───────────────────────────────────────────────────────────────────

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "rent.json"
FMR_URL = "https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY26_FMRs.xlsx"


def extract_cbsa(code: str) -> str | None:
    """Extract 5-digit CBSA code from hud_area_code like METRO47900M47900 or METRO47900Nxxxxx."""
    # CBSA code is the first 5-digit number in the string
    m = re.search(r'(\d{5})', code)
    if m:
        return m.group(1)
    return None


def main() -> None:
    print(f"Downloading FY26 FMR data from {FMR_URL}...")
    resp = requests.get(FMR_URL, timeout=60, headers={"User-Agent": "h1b-compass/1.0"})
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024:.0f} KB")

    wb = openpyxl.load_workbook(io.BytesIO(resp.content), read_only=True, data_only=True)
    ws = wb["FY26_FMRs"]

    # Aggregate: cbsa → dict of all FMR bedroom types + area_name + metro
    # We'll take MAX each FMR per CBSA as the representative rent
    cbsa_rents: dict[str, dict] = {}

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            # Header: stusps, state, hud_area_code, countyname, county_town_name,
            #         metro, hud_area_name, fips, pop2023, fmr_0, fmr_1, fmr_2, fmr_3, fmr_4
            header = row
            continue

        if len(row) < 13:
            continue

        hud_code = str(row[2]) if row[2] else ""
        cbsa = extract_cbsa(hud_code)
        if not cbsa:
            continue

        try:
            fmr_0 = float(row[9]) if row[9] else 0
            fmr_1 = float(row[10]) if row[10] else 0
            fmr_2 = float(row[11]) if row[11] else 0
            fmr_3 = float(row[12]) if row[12] else 0
            fmr_4 = float(row[13]) if row[13] else 0
        except (ValueError, TypeError):
            fmr_0 = fmr_1 = fmr_2 = fmr_3 = fmr_4 = 0

        area_name = str(row[6]) if row[6] else ""
        metro = int(row[5]) if row[5] else 0

        if cbsa not in cbsa_rents:
            cbsa_rents[cbsa] = {
                "area_name": area_name,
                "fmr_0": fmr_0,
                "fmr_1": fmr_1,
                "fmr_2": fmr_2,
                "fmr_3": fmr_3,
                "fmr_4": fmr_4,
                "metro": metro,
            }
        else:
            # Take max each bedroom type across counties in the same CBSA
            cbsa_rents[cbsa]["fmr_0"] = max(cbsa_rents[cbsa]["fmr_0"], fmr_0)
            cbsa_rents[cbsa]["fmr_1"] = max(cbsa_rents[cbsa]["fmr_1"], fmr_1)
            cbsa_rents[cbsa]["fmr_2"] = max(cbsa_rents[cbsa]["fmr_2"], fmr_2)
            cbsa_rents[cbsa]["fmr_3"] = max(cbsa_rents[cbsa]["fmr_3"], fmr_3)
            cbsa_rents[cbsa]["fmr_4"] = max(cbsa_rents[cbsa]["fmr_4"], fmr_4)

    wb.close()

    # Convert to dict with CBSA as key (same format as wages.json)
    result = {}
    for cbsa, data in cbsa_rents.items():
        result[cbsa] = {
            "area_name": data["area_name"],
            "fmr_0": data["fmr_0"],
            "fmr_1": data["fmr_1"],
            "fmr_2": data["fmr_2"],
            "fmr_3": data["fmr_3"],
            "fmr_4": data["fmr_4"],
            "metro": data["metro"],
        }

    print(f"Processed {len(result)} CBSA areas with FMR data")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, separators=(",", ":"))
    print(f"Saved → {OUTPUT_PATH}")

    # Spot-check a few MSAs
    for cbsa in ["47900", "41860", "31084"]:  # Houston, SF, LA
        entry = result.get(cbsa)
        if entry:
            print(f"  CBSA {cbsa} ({entry['area_name']}): 0BR=${entry['fmr_0']} 1BR=${entry['fmr_1']} 2BR=${entry['fmr_2']} 3BR=${entry['fmr_3']} 4BR=${entry['fmr_4']}")


if __name__ == "__main__":
    main()

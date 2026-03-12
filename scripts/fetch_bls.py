#!/usr/bin/env python3
"""
Fetch BLS OEWS MSA-level wage data and produce wages.json.

Output: public/data/wages.json
  { msaCode: { socCode: { L1, L2, L3, L4, area_title, soc_title } } }

Wage level approximation (DOL methodology):
  L1 ≈ A_PCT10   (17th percentile)
  L2 ≈ A_PCT25   (34th percentile)
  L3 ≈ A_MEDIAN  (50th percentile)
  L4 ≈ midpoint(A_MEDIAN, A_PCT75)  (~67th percentile)

BLS OEWS 2024 MSA-level Excel:
  https://www.bls.gov/oes/special.requests/oesm24ma.zip
"""

import os
import json
import zipfile
import requests
import io
from pathlib import Path

import pandas as pd

# ─── Config ───────────────────────────────────────────────────────────────────

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "wages.json"

BLS_URL = "https://www.bls.gov/oes/special.requests/oesm24ma.zip"

SOC_CODES = {
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

WAGE_COLS = ["A_PCT10", "A_PCT25", "A_MEDIAN", "A_PCT75"]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_wage(val) -> float | None:
    """Convert BLS wage string to float. Returns None for '#', '*', or NaN."""
    if pd.isna(val):
        return None
    s = str(val).strip().replace(",", "")
    if s in ("#", "*", "**", ""):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def compute_levels(row) -> dict | None:
    p10 = parse_wage(row.get("A_PCT10"))
    p25 = parse_wage(row.get("A_PCT25"))
    med = parse_wage(row.get("A_MEDIAN"))
    p75 = parse_wage(row.get("A_PCT75"))

    # Need at least median
    if med is None:
        return None

    l1 = p10 if p10 is not None else (med * 0.68)   # fallback estimate
    l2 = p25 if p25 is not None else (med * 0.82)
    l3 = med
    l4 = ((med + p75) / 2) if p75 is not None else (med * 1.18)

    return {
        "L1": round(l1),
        "L2": round(l2),
        "L3": round(l3),
        "L4": round(l4),
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"Downloading BLS OEWS MSA data from {BLS_URL}...")
    resp = requests.get(BLS_URL, timeout=120, headers={"User-Agent": "h1b-compass/1.0"})
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024 / 1024:.1f} MB")

    # The zip contains one MSA Excel file
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        names = zf.namelist()
        print("Files in zip:", names)
        # Find the main data file (MSA_M20XX_dl.xlsx or similar)
        # Prefer the national MSA file (MSA_M20XX_dl.xlsx)
        xlsx_name = next(
            (n for n in names if n.endswith(".xlsx") and "MSA_M" in n),
            None,
        )
        if not xlsx_name:
            xlsx_name = next(
                (n for n in names if n.endswith(".xlsx") and "M20" in n and "dl" in n.lower()),
                None,
            )
        if not xlsx_name:
            xlsx_name = next((n for n in names if n.endswith(".xlsx")), None)
        if not xlsx_name:
            raise ValueError(f"No xlsx found in zip: {names}")
        print(f"Reading {xlsx_name}...")
        with zf.open(xlsx_name) as f:
            df = pd.read_excel(f, dtype=str)

    print(f"Loaded {len(df)} rows, columns: {list(df.columns)}")

    # Normalize column names (BLS uses mixed case)
    df.columns = [c.strip().upper() for c in df.columns]

    # Required columns
    area_col = next((c for c in df.columns if "AREA" in c and "CODE" in c), "AREA")
    title_col = next((c for c in df.columns if "AREA" in c and "TITLE" in c), "AREA_TITLE")
    occ_col = next((c for c in df.columns if "OCC_CODE" in c or "OCC CODE" in c), "OCC_CODE")
    occ_title_col = next((c for c in df.columns if "OCC_TITLE" in c), "OCC_TITLE")

    # Filter to tech SOC codes
    target_socs = set(SOC_CODES.keys())
    df_tech = df[df[occ_col].isin(target_socs)].copy()
    print(f"Filtered to {len(df_tech)} tech rows across {df_tech[area_col].nunique()} MSAs")

    # Build output dict
    result = {}
    for _, row in df_tech.iterrows():
        msa_code = str(row[area_col]).strip().zfill(5)
        soc_code = str(row[occ_col]).strip()
        area_title = str(row.get(title_col, "")).strip()
        soc_title = SOC_CODES.get(soc_code, str(row.get(occ_title_col, soc_code)).strip())

        levels = compute_levels(row)
        if levels is None:
            continue

        if msa_code not in result:
            result[msa_code] = {}

        result[msa_code][soc_code] = {
            **levels,
            "area_title": area_title,
            "soc_title": soc_title,
        }

    print(f"Output: {len(result)} MSAs with wage data")

    # Save
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, separators=(",", ":"))
    print(f"Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

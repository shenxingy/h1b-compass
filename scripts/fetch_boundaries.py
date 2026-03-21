#!/usr/bin/env python3
"""
Fetch Census CBSA cartographic boundary GeoJSON (simplified) and save as msas.geojson.

Source: Census Cartographic Boundary Files (CBSA, 1:5M scale for compact size)
  https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_cbsa_5m.zip

Output: public/data/msas.geojson
  GeoJSON FeatureCollection with properties: CBSAFP (5-digit code), NAME, NAMELSAD
"""

import json
import zipfile
import requests
import io
import subprocess
import sys
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "msas.geojson"

# 1:5M scale CBSA shapefile (compact, ~3MB zip)
CBSA_URL = "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_cbsa_5m.zip"


def check_fiona():
    """Check if fiona/shapefile libs are available."""
    try:
        import fiona
        return "fiona"
    except ImportError:
        pass
    try:
        import shapefile
        return "pyshp"
    except ImportError:
        pass
    return None


def convert_with_fiona(shp_bytes: bytes) -> dict:
    import fiona
    import fiona.io

    with fiona.io.MemoryFile(shp_bytes) as memfile:
        with memfile.open() as src:
            features = []
            for feat in src:
                props = dict(feat["properties"])
                # Keep only what we need
                simplified_props = {
                    "CBSAFP": props.get("CBSAFP", ""),
                    "NAME": props.get("NAME", ""),
                    "NAMELSAD": props.get("NAMELSAD", ""),
                    "LSAD": props.get("LSAD", ""),
                }
                features.append({
                    "type": "Feature",
                    "properties": simplified_props,
                    "geometry": feat["geometry"],
                })
    return {"type": "FeatureCollection", "features": features}


def convert_with_pyshp(shp_content: bytes, dbf_content: bytes, _prj_content: bytes | None) -> dict:
    # prj not passed to Reader — Census shapefiles use WGS84 matching GeoJSON natively
    import shapefile

    sf = shapefile.Reader(
        shp=io.BytesIO(shp_content),
        dbf=io.BytesIO(dbf_content),
    )
    fields = [f[0] for f in sf.fields[1:]]  # skip DeletionFlag

    features = []
    for shape_rec in sf.shapeRecords():
        props = dict(zip(fields, shape_rec.record))
        simplified_props = {
            "CBSAFP": str(props.get("CBSAFP", "")),
            "NAME": str(props.get("NAME", "")),
            "NAMELSAD": str(props.get("NAMELSAD", "")),
            "LSAD": str(props.get("LSAD", "")),
        }
        geojson_geom = shape_rec.shape.__geo_interface__
        features.append({
            "type": "Feature",
            "properties": simplified_props,
            "geometry": geojson_geom,
        })
    return {"type": "FeatureCollection", "features": features}


def main():
    print(f"Downloading CBSA boundaries from {CBSA_URL}...")
    resp = requests.get(CBSA_URL, timeout=120, headers={"User-Agent": "h1b-compass/1.0"})
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024:.0f} KB")

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        names = zf.namelist()
        print("Files:", names)

        shp_name = next((n for n in names if n.endswith(".shp")), None)
        dbf_name = next((n for n in names if n.endswith(".dbf")), None)
        prj_name = next((n for n in names if n.endswith(".prj")), None)

        if not shp_name:
            raise ValueError("No .shp file found in zip")

        shp_bytes = zf.read(shp_name)
        dbf_bytes = zf.read(dbf_name) if dbf_name else None
        prj_bytes = zf.read(prj_name) if prj_name else None

    lib = check_fiona()
    print(f"Using: {lib or 'none (will try ogr2ogr)'}")

    if lib == "fiona":
        # Fiona needs the full zip context; re-read the zip bytes
        print("Converting with fiona...")
        resp2 = requests.get(CBSA_URL, timeout=120, headers={"User-Agent": "h1b-compass/1.0"})
        geojson = convert_with_fiona(resp2.content)
    elif lib == "pyshp":
        print("Converting with pyshp...")
        geojson = convert_with_pyshp(shp_bytes, dbf_bytes, prj_bytes)
    else:
        # Try ogr2ogr (GDAL)
        import tempfile
        print("Trying ogr2ogr...")
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            shp_path = tmpdir / shp_name
            shp_path.write_bytes(shp_bytes)
            if dbf_bytes:
                (tmpdir / shp_name.replace(".shp", ".dbf")).write_bytes(dbf_bytes)
            if prj_bytes:
                (tmpdir / shp_name.replace(".shp", ".prj")).write_bytes(prj_bytes)
            out_path = tmpdir / "out.geojson"
            result = subprocess.run(
                ["ogr2ogr", "-f", "GeoJSON", str(out_path), str(shp_path)],
                capture_output=True, text=True
            )
            if result.returncode != 0:
                print("ogr2ogr failed:", result.stderr)
                sys.exit(1)
            with open(out_path) as f:
                raw = json.load(f)
        # Simplify properties
        features = []
        for feat in raw["features"]:
            props = feat["properties"]
            features.append({
                "type": "Feature",
                "properties": {
                    "CBSAFP": props.get("CBSAFP", ""),
                    "NAME": props.get("NAME", ""),
                    "NAMELSAD": props.get("NAMELSAD", ""),
                    "LSAD": props.get("LSAD", ""),
                },
                "geometry": feat["geometry"],
            })
        geojson = {"type": "FeatureCollection", "features": features}

    print(f"Features: {len(geojson['features'])}")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    size_mb = OUTPUT_PATH.stat().st_size / 1024 / 1024
    print(f"Saved to {OUTPUT_PATH} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()

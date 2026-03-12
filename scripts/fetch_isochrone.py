#!/usr/bin/env python3
"""
Fetch 5-hour drive isochrone from San Francisco.

Strategy: ORS free tier max = 1h. We stitch 1h isochrones at 5 intermediate
waypoints arranged on a ring ~200 miles from SF, then union them into a single
covering polygon. This approximates a real 5h drive zone without the API limit.

Waypoints at ~200 miles from SF (covers ~4h + city driving overhead):
  N: Redding CA, NE: Reno NV, E: Fresno CA, S: Bakersfield CA, SW: Monterey CA

Output: public/data/isochrone_5h_sf.geojson
"""

import json
import math
import os
import sys
import requests
from pathlib import Path


def convex_hull(points: list) -> list:
    """Graham scan convex hull. Returns closed ring [[lon,lat], ..., [lon,lat]]."""
    pts = [tuple(p[:2]) for p in points]
    pts = list(set(pts))  # deduplicate
    if len(pts) < 3:
        return [list(p) for p in pts]

    # Find bottom-most (then left-most) point
    pivot = min(pts, key=lambda p: (p[1], p[0]))

    def polar_angle(p):
        dx, dy = p[0] - pivot[0], p[1] - pivot[1]
        return math.atan2(dy, dx)

    def dist2(p):
        return (p[0] - pivot[0]) ** 2 + (p[1] - pivot[1]) ** 2

    sorted_pts = sorted(pts, key=lambda p: (polar_angle(p), dist2(p)))

    hull = []
    for p in sorted_pts:
        while len(hull) >= 2:
            o, a, b = hull[-2], hull[-1], p
            cross = (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
            if cross <= 0:
                hull.pop()
            else:
                break
        hull.append(p)

    # Close the ring
    closed = [list(p) for p in hull]
    closed.append(closed[0])
    return closed

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "isochrone_5h_sf.geojson"

# [lon, lat]
SF_COORDS = [-122.4194, 37.7749]

# Waypoints ~200-250 miles from SF along major corridors
WAYPOINTS = [
    [-122.3917, 40.5865],  # Redding CA (I-5 N)
    [-119.8138, 39.5296],  # Reno NV (I-80 E)
    [-119.7871, 36.7378],  # Fresno CA (Hwy 99 S-SE)
    [-119.0187, 35.3733],  # Bakersfield CA (I-5 S)
    [-121.8947, 36.6002],  # Salinas CA (Hwy 101 S)
    [-120.8585, 38.7296],  # Stockton/Modesto area (I-5 SE)
]

ORS_URL = "https://api.openrouteservice.org/v2/isochrones/driving-car"
# 1h in seconds (ORS free tier max)
RANGE_SEC = 3600


def fetch_isochrone(lon: float, lat: float, api_key: str) -> list:
    """Return list of coordinate rings for a 1h isochrone centered at [lon, lat]."""
    resp = requests.post(
        ORS_URL,
        json={"locations": [[lon, lat]], "range": [RANGE_SEC], "range_type": "time"},
        headers={"Authorization": api_key, "Content-Type": "application/json"},
        timeout=30,
    )
    if not resp.ok:
        print(f"  Warning: {resp.status_code} for ({lon},{lat}): {resp.text[:100]}")
        return []
    features = resp.json().get("features", [])
    rings = []
    for f in features:
        geom = f.get("geometry", {})
        if geom.get("type") == "Polygon":
            rings.append(geom["coordinates"][0])
        elif geom.get("type") == "MultiPolygon":
            for poly in geom["coordinates"]:
                rings.append(poly[0])
    return rings


def approximate_circle(lon: float, lat: float, radius_deg_lon: float, radius_deg_lat: float, n: int = 32) -> list:
    """Fallback: generate a rough elliptical polygon."""
    pts = []
    for i in range(n):
        angle = 2 * math.pi * i / n
        pts.append([lon + radius_deg_lon * math.cos(angle),
                    lat + radius_deg_lat * math.sin(angle)])
    pts.append(pts[0])
    return pts


def main():
    api_key = os.environ.get("ORS_API_KEY")
    if not api_key:
        print("ERROR: Set ORS_API_KEY environment variable")
        sys.exit(1)

    all_rings = []

    # 1h from SF itself
    print("Fetching 1h isochrone from SF...")
    rings = fetch_isochrone(SF_COORDS[0], SF_COORDS[1], api_key)
    if rings:
        all_rings.extend(rings)
        print(f"  Got {len(rings)} ring(s)")
    else:
        all_rings.append(approximate_circle(SF_COORDS[0], SF_COORDS[1], 0.8, 0.6))
        print("  Used fallback circle")

    # 1h from each waypoint
    for i, (lon, lat) in enumerate(WAYPOINTS):
        print(f"Fetching 1h isochrone from waypoint {i+1}/{len(WAYPOINTS)} ({lon:.2f},{lat:.2f})...")
        rings = fetch_isochrone(lon, lat, api_key)
        if rings:
            all_rings.extend(rings)
            print(f"  Got {len(rings)} ring(s)")
        else:
            # Approx 1h circle: ~50 miles ≈ 0.72 deg lat, 0.9 deg lon at mid-lat
            all_rings.append(approximate_circle(lon, lat, 0.9, 0.72))
            print("  Used fallback circle")

    # Compute convex hull of ALL vertices across all rings.
    # This creates one continuous polygon that covers the full 5h zone
    # without gaps between the 7 individual isochrone bubbles.
    all_pts = [pt for ring in all_rings for pt in ring]
    hull_ring = convex_hull(all_pts)
    print(f"Convex hull: {len(hull_ring)} vertices from {len(all_pts)} total points")

    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"description": "5h drive from SF (convex hull of composite isochrones)"},
                "geometry": {"type": "Polygon", "coordinates": [hull_ring]},
            }
        ],
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    print(f"Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Position } from "geojson";
import { COLOR_STOPS } from "./constants";
import type { MsaFeature } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Wage / Surplus ──────────────────────────────────────────────────────────

export function getColor(surplus: number): string {
  for (const stop of COLOR_STOPS) {
    if (surplus >= stop.threshold) return stop.color;
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1].color;
}

// ─── MSA Name Parsing ────────────────────────────────────────────────────────

/** Extract state abbreviation(s) from NAMELSAD, e.g. "Amarillo, TX Metro Area" → "TX" */
export function parseState(namelsad: string): string {
  // NAMELSAD format: "City, ST Metro Area" or "City, ST-ST2 Micro Area"
  // State codes appear between the last comma and the type descriptor at end.
  const match = namelsad.match(/,\s*([A-Z]{2}(?:-[A-Z]{2})*)\s+(?:Metro|Micro)\s+(?:Area|Division)$/);
  return match ? match[1] : "";
}

/** Short display name (strip Metro/Micro Division suffix) */
export function shortName(name: string): string {
  return name.replace(/ (Metro Division|Micro Area|Metropolitan Statistical Area)$/, "");
}

// ─── Drive Zone (haversine) ───────────────────────────────────────────────────

/** Great-circle distance in miles between two lat/lon points. */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Get centroid [lat, lon] of a GeoJSON Feature geometry (approximate). */
export function getCentroid(feature: MsaFeature): [number, number] | null {
  const geom = feature.geometry;
  if (!geom) return null;

  let rings: Position[][] = [];
  if (geom.type === "Polygon") {
    rings = [geom.coordinates[0]];
  } else if (geom.type === "MultiPolygon") {
    rings = geom.coordinates.map((poly) => poly[0]);
  } else {
    return null;
  }

  let sumLon = 0, sumLat = 0, count = 0;
  for (const ring of rings) {
    for (const pos of ring) {
      sumLon += pos[0];
      sumLat += pos[1];
      count++;
    }
  }
  if (count === 0) return null;
  return [sumLat / count, sumLon / count];
}

export function isWithinRadius(
  feature: MsaFeature,
  originLat: number,
  originLon: number,
  radiusMiles: number,
): boolean {
  const centroid = getCentroid(feature);
  if (!centroid) return false;
  return haversineDistance(centroid[0], centroid[1], originLat, originLon) <= radiusMiles;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatSurplus(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return sign + formatCurrency(n);
}

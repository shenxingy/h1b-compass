import type { WageLevel } from "./types";

// ─── SOC Codes ───────────────────────────────────────────────────────────────

export const SOC_CODES: Record<string, string> = {
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
};

// ─── Wage Level Labels ───────────────────────────────────────────────────────

export const WAGE_LEVEL_LABELS: Record<WageLevel, string> = {
  L1: "L1 (~17th pct)",
  L2: "L2 (~34th pct)",
  L3: "L3 (Median)",
  L4: "L4 (~67th pct)",
};

// ─── Origins ─────────────────────────────────────────────────────────────────

/** Preset origin cities [lat, lon] */
export const ORIGIN_CITIES: Record<string, [number, number]> = {
  "San Francisco, CA": [37.7749, -122.4194],
  "Seattle, WA":       [47.6062, -122.3321],
  "Austin, TX":        [30.2672,  -97.7431],
  "New York, NY":      [40.7128,  -74.0060],
  "Boston, MA":        [42.3601,  -71.0589],
  "Chicago, IL":       [41.8781,  -87.6298],
  "Los Angeles, CA":   [34.0522, -118.2437],
  "Denver, CO":        [39.7392, -104.9903],
  "Atlanta, GA":       [33.7490,  -84.3880],
  "Dallas, TX":        [32.7767,  -96.7970],
  "Washington, DC":    [38.9072,  -77.0369],
  "Portland, OR":      [45.5051, -122.6750],
  "Phoenix, AZ":       [33.4484, -112.0740],
  "Miami, FL":         [25.7617,  -80.1918],
};

export const DEFAULT_ORIGIN = "San Francisco, CA";
export const DEFAULT_RADIUS_MILES = 300;

// ─── Map ─────────────────────────────────────────────────────────────────────

export const MAP_CENTER: [number, number] = [38.5, -97];
export const MAP_ZOOM = 4;

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Surplus tiers → tailwind-compatible hex colors */
export const COLOR_STOPS = [
  { threshold: 40000, color: "#16a34a" },  // green-600 — large surplus
  { threshold: 20000, color: "#65a30d" },  // lime-600
  { threshold: 5000,  color: "#ca8a04" },  // yellow-600
  { threshold: 0,     color: "#ea580c" },  // orange-600
  { threshold: -Infinity, color: "#dc2626" }, // red-600 — below salary
] as const;

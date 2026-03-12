// ─── Data Types ──────────────────────────────────────────────────────────────

import type { Geometry } from "geojson";

export type WageLevel = "L1" | "L2" | "L3" | "L4";

export interface MsaWages {
  L1: number;
  L2: number;
  L3: number;
  L4: number;
  area_title: string;
  soc_title: string;
}

/** wages.json shape: { msaCode: { socCode: MsaWages } } */
export type WagesData = Record<string, Record<string, MsaWages>>;

export interface MsaFeature {
  type: "Feature";
  properties: {
    CBSAFP: string;
    NAME: string;
    NAMELSAD: string;
    LSAD: string;
  };
  geometry: Geometry;
}

export interface MsaGeoJSON {
  type: "FeatureCollection";
  features: MsaFeature[];
}

// ─── UI / Filter Types ───────────────────────────────────────────────────────

export interface Filters {
  salary: number;
  socCode: string;
  wageLevel: WageLevel;
  qualifyingOnly: boolean;
  showDriveZone: boolean;
  radiusMiles: number;
  originName: string;
  originLat: number;
  originLon: number;
}

export interface MsaResult {
  msaCode: string;
  name: string;
  state: string;
  prevailingWage: number;
  surplus: number;
  distanceMiles: number;
  withinDriveZone: boolean;
}

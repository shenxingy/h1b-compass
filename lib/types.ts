// ─── Section Name ───

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

/** rent.json shape: { cbsaCode: { area_name, fmr_0–fmr_4, metro } } */
export interface MsaRent {
  area_name: string;
  fmr_0: number; // Fair Market Rent for Studio/0BR
  fmr_1: number; // 1BR
  fmr_2: number; // 2BR
  fmr_3: number; // 3BR
  fmr_4: number; // 4BR
  metro: number; // 1 = metro, 0 = non-metro
}

export type BedroomCount = 0 | 1 | 2 | 3 | 4;
export type RentData = Record<string, MsaRent>;

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
  showRentLayer: boolean;
  bedroomCount: BedroomCount;
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
  fmr?: number;           // Fair Market Rent for selected bedroom type (always computed when available)
  lotteryLevel?: WageLevel; // highest DOL wage level where salary >= prevailing wage (USCIS FY2027 weighting)
  netSurplus?: number;    // surplus - fmr*12 (annual wage surplus after rent)
}

"use client";

import dynamic from "next/dynamic";
import { parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMemo } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { ResultsList } from "@/components/ResultsList";
import { useWageData } from "@/hooks/useWageData";
import { useRentData } from "@/hooks/useRentData";
import { DEFAULT_ORIGIN, DEFAULT_RADIUS_MILES, ORIGIN_CITIES } from "@/lib/constants";
import type { BedroomCount, Filters, MsaResult, WageLevel } from "@/lib/types";
import { getFmr, haversineDistance, getCentroid, parseState, shortName } from "@/lib/utils";

const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
      Loading map...
    </div>
  ),
});

// ─── URL State ───────────────────────────────────────────────────────────────

const defaultCoords = ORIGIN_CITIES[DEFAULT_ORIGIN];

const queryParams = {
  salary:  parseAsInteger.withDefault(110000),
  soc:     parseAsString.withDefault("15-1252"),
  level:   parseAsString.withDefault("L2"),
  q:       parseAsBoolean.withDefault(false),
  drive:   parseAsBoolean.withDefault(false),
  rent:    parseAsBoolean.withDefault(false),
  br:      parseAsInteger.withDefault(2),
  radius:  parseAsInteger.withDefault(DEFAULT_RADIUS_MILES),
  origin:  parseAsString.withDefault(DEFAULT_ORIGIN),
  olat:    parseAsFloat.withDefault(defaultCoords[0]),
  olon:    parseAsFloat.withDefault(defaultCoords[1]),
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [params, setParams] = useQueryStates(queryParams, { shallow: true });
  const { wages, geojson, loading, error } = useWageData();
  const { rent, loading: rentLoading } = useRentData();

  const filters: Filters = {
    salary:       params.salary,
    socCode:      params.soc,
    wageLevel:    params.level as WageLevel,
    qualifyingOnly: params.q,
    showDriveZone:  params.drive,
    showRentLayer:  params.rent,
    bedroomCount: (Math.max(0, Math.min(4, params.br ?? 2)) as BedroomCount),
    radiusMiles:  params.radius,
    originName:   params.origin,
    originLat:    params.olat,
    originLon:    params.olon,
  };

  function handleFiltersChange(f: Filters) {
    setParams({
      salary:  f.salary,
      soc:     f.socCode,
      level:   f.wageLevel,
      q:       f.qualifyingOnly,
      drive:   f.showDriveZone,
      rent:    f.showRentLayer,
      br:      f.bedroomCount,
      radius:  f.radiusMiles,
      origin:  f.originName,
      olat:    f.originLat,
      olon:    f.originLon,
    });
  }

  // Compute full result list (all MSAs with wage data)
  const allResults: MsaResult[] = useMemo(() => {
    if (!wages || !geojson) return [];

    return geojson.features.flatMap((feature) => {
      const msaCode = feature.properties.CBSAFP;
      const socWages = wages[msaCode]?.[filters.socCode];
      if (!socWages) return [];

      const prevailingWage = socWages[filters.wageLevel];
      const surplus = filters.salary - prevailingWage;
      const centroid = getCentroid(feature);
      const distanceMiles = centroid
        ? haversineDistance(centroid[0], centroid[1], filters.originLat, filters.originLon)
        : Infinity;

      const rentEntry = rent?.[msaCode] ?? null;
      const fmr = getFmr(rentEntry, filters.bedroomCount);

      return [{
        msaCode,
        name:           shortName(feature.properties.NAME),
        state:          parseState(feature.properties.NAMELSAD),
        prevailingWage,
        surplus,
        distanceMiles,
        withinDriveZone: distanceMiles <= filters.radiusMiles,
        ...(filters.showRentLayer && fmr != null ? { fmr } : {}),
      }];
    });
  }, [wages, geojson, rent, filters.socCode, filters.wageLevel, filters.salary, filters.originLat, filters.originLon, filters.radiusMiles, filters.showRentLayer, filters.bedroomCount]);

  // Apply stacked filters for the results list
  const displayResults = useMemo(() => {
    return allResults.filter((r) => {
      if (filters.qualifyingOnly && r.surplus < 0) return false;
      if (filters.showDriveZone && !r.withinDriveZone) return false;
      return true;
    });
  }, [allResults, filters.qualifyingOnly, filters.showDriveZone]);

  const qualifyingCount = allResults.filter((r) => r.surplus >= 0).length;

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 py-2 md:py-3 flex items-center gap-3">
        <div>
          <h1 className="text-base md:text-xl font-bold text-gray-900">H1B Compass</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Find your best worksite by prevailing wage</p>
        </div>
        <div className="ml-auto text-xs text-gray-400 hidden md:block">
          Data: DOL OFLC 7/2025–6/2026 · Official prevailing wages
        </div>
      </header>

      {/* Body: map on top on mobile, sidebar on left on desktop */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* Map — shown first (top) on mobile, right side on desktop */}
        <main className="h-[42dvh] flex-shrink-0 md:h-auto md:flex-1 md:order-2 relative">
          {!loading && !error && wages && geojson ? (
            <Map
              geojson={geojson}
              wages={wages}
              rent={rent}
              salary={filters.salary}
              socCode={filters.socCode}
              wageLevel={filters.wageLevel}
              qualifyingOnly={filters.qualifyingOnly}
              showDriveZone={filters.showDriveZone}
              showRentLayer={filters.showRentLayer}
              bedroomCount={filters.bedroomCount}
              originLat={filters.originLat}
              originLon={filters.originLon}
              radiusMiles={filters.radiusMiles}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              {loading ? "Loading..." : error ? "Data error — check sidebar" : ""}
            </div>
          )}
        </main>

        {/* Sidebar — scrollable panel below map on mobile, fixed left column on desktop */}
        <aside className="flex-1 md:flex-none md:w-80 md:order-1 overflow-y-auto bg-white border-t md:border-t-0 md:border-r border-gray-100 p-4 flex flex-col gap-4">
          {error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error loading data:</strong> {error}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Loading data...
            </div>
          ) : (
            <FilterPanel
              filters={filters}
              onChange={handleFiltersChange}
              qualifyingCount={qualifyingCount}
              totalCount={allResults.length}
              rentLoading={rentLoading}
            />
          )}

          {!loading && !error && (
            <ResultsList
              results={displayResults}
              salary={filters.salary}
              showDriveZone={filters.showDriveZone}
              showRentLayer={filters.showRentLayer}
              bedroomCount={filters.bedroomCount}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

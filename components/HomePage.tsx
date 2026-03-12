"use client";

import dynamic from "next/dynamic";
import { parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMemo } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { ResultsList } from "@/components/ResultsList";
import { useWageData } from "@/hooks/useWageData";
import { DEFAULT_ORIGIN, DEFAULT_RADIUS_MILES, ORIGIN_CITIES } from "@/lib/constants";
import type { Filters, MsaResult, WageLevel } from "@/lib/types";
import { haversineDistance, getCentroid, parseState, shortName } from "@/lib/utils";

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
  radius:  parseAsInteger.withDefault(DEFAULT_RADIUS_MILES),
  origin:  parseAsString.withDefault(DEFAULT_ORIGIN),
  olat:    parseAsFloat.withDefault(defaultCoords[0]),
  olon:    parseAsFloat.withDefault(defaultCoords[1]),
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [params, setParams] = useQueryStates(queryParams, { shallow: true });
  const { wages, geojson, loading, error } = useWageData();

  const filters: Filters = {
    salary:       params.salary,
    socCode:      params.soc,
    wageLevel:    params.level as WageLevel,
    qualifyingOnly: params.q,
    showDriveZone:  params.drive,
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

      return [{
        msaCode,
        name:           shortName(feature.properties.NAME),
        state:          parseState(feature.properties.NAMELSAD),
        prevailingWage,
        surplus,
        distanceMiles,
        withinDriveZone: distanceMiles <= filters.radiusMiles,
      }];
    });
  }, [wages, geojson, filters.socCode, filters.wageLevel, filters.salary, filters.originLat, filters.originLon, filters.radiusMiles]);

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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">H1B Compass</h1>
          <p className="text-xs text-gray-500">Find your best worksite by prevailing wage</p>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Data: BLS OEWS 2024 · DOL wage levels
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex-shrink-0 overflow-y-auto bg-white border-r border-gray-100 p-4 flex flex-col gap-4">
          {error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error loading data:</strong> {error}
              <p className="mt-1 text-xs text-red-500">
                Run <code>python scripts/fetch_bls.py</code> and{" "}
                <code>python scripts/fetch_boundaries.py</code> first.
              </p>
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
            />
          )}

          {!loading && !error && (
            <ResultsList
              results={displayResults}
              salary={filters.salary}
              showDriveZone={filters.showDriveZone}
            />
          )}
        </aside>

        <main className="flex-1 relative">
          {!loading && !error && wages && geojson ? (
            <Map
              geojson={geojson}
              wages={wages}
              salary={filters.salary}
              socCode={filters.socCode}
              wageLevel={filters.wageLevel}
              qualifyingOnly={filters.qualifyingOnly}
              showDriveZone={filters.showDriveZone}
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
      </div>
    </div>
  );
}

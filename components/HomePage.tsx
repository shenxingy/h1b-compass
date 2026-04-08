"use client";

import dynamic from "next/dynamic";
import { parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { ResultsList } from "@/components/ResultsList";
import { SearchBox } from "@/components/SearchBox";
import type { MsaOption } from "@/components/SearchBox";
import { useWageData } from "@/hooks/useWageData";
import { useRentData } from "@/hooks/useRentData";
import { DEFAULT_ORIGIN, DEFAULT_RADIUS_MILES, LOTTERY_WEIGHTS, ORIGIN_CITIES } from "@/lib/constants";
import type { BedroomCount, Filters, MsaResult, WageLevel } from "@/lib/types";
import { getFmr, getLotteryLevel, haversineDistance, getCentroid, parseState, shortName } from "@/lib/utils";

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

  // Transient UI state: which MSA is focused (search jump)
  const [focusMsaCode, setFocusMsaCode] = useState<string | null>(null);
  // Copy link feedback
  const [copied, setCopied] = useState(false);

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

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // MSA list for SearchBox (sorted alphabetically, stable)
  const msaList = useMemo<MsaOption[]>(() => {
    if (!geojson) return [];
    return geojson.features
      .map((f) => ({ msaCode: f.properties.CBSAFP, name: shortName(f.properties.NAME) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [geojson]);

  // Compute full result list — always includes fmr + netSurplus + lotteryLevel when data available
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

      // Always compute rent data when available (needed for netSurplus)
      const rentEntry = rent?.[msaCode] ?? null;
      const fmr = getFmr(rentEntry, filters.bedroomCount);
      const netSurplus = fmr != null ? surplus - fmr * 12 : undefined;

      // Lottery level: highest wage level where salary >= prevailing wage
      const lotteryLevel = getLotteryLevel(socWages, filters.salary) ?? undefined;

      return [{
        msaCode,
        name:           shortName(feature.properties.NAME),
        state:          parseState(feature.properties.NAMELSAD),
        prevailingWage,
        surplus,
        distanceMiles,
        withinDriveZone: distanceMiles <= filters.radiusMiles,
        ...(fmr != null ? { fmr } : {}),
        ...(netSurplus != null ? { netSurplus } : {}),
        ...(lotteryLevel ? { lotteryLevel } : {}),
      }];
    });
  }, [wages, geojson, rent, filters.socCode, filters.wageLevel, filters.salary, filters.originLat, filters.originLon, filters.radiusMiles, filters.bedroomCount]);

  // Apply stacked filters for the results list
  const displayResults = useMemo(() => {
    return allResults.filter((r) => {
      if (filters.qualifyingOnly && r.surplus < 0) return false;
      if (filters.showDriveZone && !r.withinDriveZone) return false;
      return true;
    });
  }, [allResults, filters.qualifyingOnly, filters.showDriveZone]);

  const qualifyingCount = allResults.filter((r) => r.surplus >= 0).length;

  // Lottery weight summary for header hint
  const lotteryWeightLabel = useMemo(() => {
    if (!allResults.length) return null;
    // Show the majority/dominant lottery level across qualifying MSAs
    const levels = allResults.filter((r) => r.surplus >= 0 && r.lotteryLevel).map((r) => r.lotteryLevel!);
    if (!levels.length) return null;
    const counts = levels.reduce((acc, l) => { acc[l] = (acc[l] ?? 0) + 1; return acc; }, {} as Record<WageLevel, number>);
    const top = (Object.entries(counts) as [WageLevel, number][]).sort((a, b) => b[1] - a[1])[0][0];
    return `${LOTTERY_WEIGHTS[top]}x lottery`;
  }, [allResults]);

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 py-2 md:py-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-base md:text-xl font-bold text-gray-900">H1B Compass</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Find your best worksite by prevailing wage</p>
        </div>

        {/* MSA search — center of header */}
        {geojson && (
          <div className="flex-1 min-w-0 max-w-xs md:max-w-sm">
            <SearchBox
              options={msaList}
              onSelect={(code) => setFocusMsaCode(code)}
              placeholder="Jump to metro area..."
            />
          </div>
        )}

        {/* Right side: lottery hint + data attribution + copy link */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {lotteryWeightLabel && (
            <span className="hidden lg:inline-flex text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 font-medium">
              {lotteryWeightLabel}
            </span>
          )}
          <span className="text-xs text-gray-400 hidden md:block">
            DOL OFLC 7/2025–6/2026
          </span>
          <button
            onClick={copyLink}
            title="Copy shareable link"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 transition-colors"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
              </svg>
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
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
              focusMsaCode={focusMsaCode}
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
              focusMsaCode={focusMsaCode}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

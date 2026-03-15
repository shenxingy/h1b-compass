"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";
import type { Circle, Map as LeafletMap, GeoJSON as LeafletGeoJSON } from "leaflet";
import type { MsaGeoJSON, MsaWages, WagesData, WageLevel } from "@/lib/types";
import { getColor, isWithinRadius, formatCurrency, formatSurplus } from "@/lib/utils";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";

interface Props {
  geojson: MsaGeoJSON;
  wages: WagesData;
  salary: number;
  socCode: string;
  wageLevel: WageLevel;
  qualifyingOnly: boolean;
  showDriveZone: boolean;
  originLat: number;
  originLon: number;
  radiusMiles: number;
}

export function Map({
  geojson,
  wages,
  salary,
  socCode,
  wageLevel,
  qualifyingOnly,
  showDriveZone,
  originLat,
  originLon,
  radiusMiles,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const circleLayerRef = useRef<Circle | null>(null);
  const activeFeatureRef = useRef<L.Path | null>(null);

  // Initialize map once, destroy on unmount
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    async function init() {
      const L = (await import("leaflet")).default;
      const container = containerRef.current!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) return;
      if (destroyed) return;

      const map = L.map(container, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Create a pane below the overlayPane so the drive-zone circle
      // is always rendered under the GeoJSON choropleth layer.
      map.createPane("driveZonePane");
      map.getPane("driveZonePane")!.style.zIndex = "350"; // overlayPane = 400

      // Tap on empty map area deselects the active feature (touch devices)
      map.on("click", () => {
        if (activeFeatureRef.current && layerRef.current) {
          layerRef.current.resetStyle(activeFeatureRef.current);
          activeFeatureRef.current = null;
        }
      });

      mapRef.current = map;
      renderLayer();
    }

    init();
    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render choropleth when any wage/filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    renderLayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson, wages, salary, socCode, wageLevel, qualifyingOnly, showDriveZone, originLat, originLon, radiusMiles]);

  // Render/remove drive-zone circle
  useEffect(() => {
    if (!mapRef.current) return;
    renderCircle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDriveZone, originLat, originLon, radiusMiles]);

  async function renderLayer() {
    if (!mapRef.current) return;
    const L = (await import("leaflet")).default;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    activeFeatureRef.current = null;

    const layer = L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0], {
      style: (feature) => {
        if (!feature) return {};
        const msaCode = feature.properties?.CBSAFP ?? "";
        const socWages: MsaWages | undefined = wages[msaCode]?.[socCode];

        if (!socWages) {
          return { fillColor: "#d1d5db", weight: 0.5, color: "#9ca3af", fillOpacity: 0.3 };
        }

        const surplus = salary - socWages[wageLevel];

        // Qualifying filter: hide non-qualifying MSAs entirely
        if (qualifyingOnly && surplus < 0) {
          return { fillColor: "transparent", weight: 0, fillOpacity: 0 };
        }

        // Drive zone filter: dim MSAs outside radius (visual #2, independent of color)
        const inZone =
          !showDriveZone ||
          isWithinRadius(
            feature as Parameters<typeof isWithinRadius>[0],
            originLat,
            originLon,
            radiusMiles,
          );

        return {
          fillColor: getColor(surplus),
          fillOpacity: inZone ? 0.75 : 0.18,
          weight: 0.8,
          color: "#ffffff",
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const msaCode = feature.properties?.CBSAFP ?? "";
        const name = feature.properties?.NAMELSAD ?? msaCode;
        const socWages: MsaWages | undefined = wages[msaCode]?.[socCode];

        const tooltipContent = !socWages
          ? `<strong>${name}</strong><br><em>No data</em>`
          : (() => {
              const prevailing = socWages[wageLevel];
              const surplus = salary - prevailing;
              return `<div style="font-size:13px;line-height:1.6">
                <strong>${name}</strong><br>
                Prevailing: <strong>${formatCurrency(prevailing)}</strong><br>
                Your salary: ${formatCurrency(salary)}<br>
                Surplus: <strong style="color:${getColor(surplus)}">${formatSurplus(surplus)}</strong>
              </div>`;
            })();

        featureLayer.bindTooltip(tooltipContent, { sticky: true });

        // Desktop: mouseover/mouseout for hover highlight
        featureLayer.on("mouseover", function (this: L.Path) {
          this.setStyle({ weight: 2, color: "#1d4ed8" });
        });
        featureLayer.on("mouseout", function () {
          layer.resetStyle(featureLayer);
        });

        // Touch: tap to highlight + show tooltip, tap elsewhere to deselect
        featureLayer.on("click", function (this: L.Path) {
          if (activeFeatureRef.current && activeFeatureRef.current !== this) {
            layer.resetStyle(activeFeatureRef.current);
          }
          this.setStyle({ weight: 2, color: "#1d4ed8" });
          activeFeatureRef.current = this;
        });
      },
    });

    layer.addTo(mapRef.current);
    layerRef.current = layer;
  }

  async function renderCircle() {
    if (!mapRef.current) return;
    const L = (await import("leaflet")).default;

    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
      circleLayerRef.current = null;
    }

    if (!showDriveZone) return;

    const radiusMeters = radiusMiles * 1609.34;
    const circle = L.circle([originLat, originLon], {
      radius: radiusMeters,
      color: "#2563eb",
      weight: 2.5,
      dashArray: "8 5",
      fillColor: "#3b82f6",
      fillOpacity: 0.04,
      interactive: false,
      pane: "driveZonePane",
    });
    circle.addTo(mapRef.current);
    circleLayerRef.current = circle;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "200px" }}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import type { MsaGeoJSON, WagesData } from "@/lib/types";

interface WageDataState {
  wages: WagesData | null;
  geojson: MsaGeoJSON | null;
  loading: boolean;
  error: string | null;
}

export function useWageData(): WageDataState {
  const [state, setState] = useState<WageDataState>({
    wages: null,
    geojson: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const [wagesRes, geojsonRes] = await Promise.all([
          fetch("/data/wages.json"),
          fetch("/data/msas.geojson"),
        ]);

        if (!wagesRes.ok) throw new Error(`wages.json: ${wagesRes.status}`);
        if (!geojsonRes.ok) throw new Error(`msas.geojson: ${geojsonRes.status}`);

        const wages: WagesData = await wagesRes.json();
        const geojson: MsaGeoJSON = await geojsonRes.json();

        setState({ wages, geojson, loading: false, error: null });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    }
    load();
  }, []);

  return state;
}

"use client";

import { useEffect, useState } from "react";
import type { RentData } from "@/lib/types";

interface RentDataState {
  rent: RentData | null;
  loading: boolean;
  error: string | null;
}

export function useRentData(): RentDataState {
  const [state, setState] = useState<RentDataState>({
    rent: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/rent.json");
        if (!res.ok) throw new Error(`rent.json: ${res.status}`);
        const data: RentData = await res.json();
        setState({ rent: data, loading: false, error: null });
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

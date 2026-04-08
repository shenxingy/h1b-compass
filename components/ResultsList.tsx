"use client";

import { useEffect } from "react";
import type { BedroomCount, MsaResult, WageLevel } from "@/lib/types";
import { LOTTERY_WEIGHTS } from "@/lib/constants";
import { bedroomLabel, formatCurrency, formatSurplus, getColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  results: MsaResult[];   // pre-filtered by HomePage
  salary: number;
  showDriveZone: boolean;
  showRentLayer: boolean;
  bedroomCount: BedroomCount;
  focusMsaCode?: string | null;
}

const LOTTERY_BADGE: Record<WageLevel, string> = {
  L4: "bg-green-100 text-green-700",
  L3: "bg-blue-100 text-blue-700",
  L2: "bg-amber-100 text-amber-700",
  L1: "bg-gray-100 text-gray-500",
};

export function ResultsList({ results, salary, showDriveZone, showRentLayer, bedroomCount, focusMsaCode }: Props) {
  const brLabel = bedroomLabel(bedroomCount);

  // Scroll focused MSA into view
  useEffect(() => {
    if (!focusMsaCode) return;
    document.getElementById(`msa-row-${focusMsaCode}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusMsaCode]);

  const sorted = [...results].sort((a, b) => {
    if (showRentLayer) {
      // sort by net surplus (wage headroom after rent), fallback to FMR descending
      if (a.netSurplus != null && b.netSurplus != null) return b.netSurplus - a.netSurplus;
      return (b.fmr ?? 0) - (a.fmr ?? 0);
    }
    return b.surplus - a.surplus;
  });

  const hasNetSurplus = showRentLayer && sorted.some((r) => r.netSurplus != null);

  function exportCSV() {
    const headers = showRentLayer
      ? ["MSA Name", "State", `${brLabel} FMR ($/mo)`, "Net Surplus/yr", "Lottery", "Distance (mi)", "Within Drive Zone"]
      : ["MSA Name", "State", "Prevailing Wage", "Surplus", "Lottery", "Distance (mi)", "Within Drive Zone"];
    const rows = sorted.map((r) => {
      const lottery = r.lotteryLevel ? `${LOTTERY_WEIGHTS[r.lotteryLevel]}x (${r.lotteryLevel})` : "";
      if (showRentLayer) {
        return [
          `"${r.name}"`, r.state, r.fmr ?? "", r.netSurplus ?? "",
          lottery, Math.round(r.distanceMiles), r.withinDriveZone ? "Yes" : "No",
        ];
      }
      return [
        `"${r.name}"`, r.state, r.prevailingWage, r.surplus,
        lottery, Math.round(r.distanceMiles), r.withinDriveZone ? "Yes" : "No",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = showRentLayer
      ? `h1b-msas-rent-${brLabel.toLowerCase().replace(" ", "-")}-${salary}.csv`
      : `h1b-msas-${salary}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (sorted.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No areas match current filters. Try adjusting salary, wage level, or drive zone.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-green-700">{sorted.length}</span>{" "}
          {showRentLayer ? "areas" : "areas, by surplus"}
        </p>
        <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs">
          Export CSV
        </Button>
      </div>

      <div className="overflow-auto md:max-h-[500px] rounded-lg border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 font-semibold">Area</th>
              {showRentLayer ? (
                <>
                  <th className="px-3 py-2 font-semibold text-right">{brLabel} FMR</th>
                  {hasNetSurplus && <th className="px-3 py-2 font-semibold text-right">Net/yr</th>}
                </>
              ) : (
                <>
                  <th className="px-3 py-2 font-semibold text-right">Wage</th>
                  <th className="px-3 py-2 font-semibold text-right">Surplus</th>
                </>
              )}
              {showDriveZone && (
                <th className="px-3 py-2 font-semibold text-right">Dist</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                id={`msa-row-${r.msaCode}`}
                key={r.msaCode}
                className={`border-t border-gray-50 transition-colors ${
                  r.msaCode === focusMsaCode
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 max-w-[140px] sm:max-w-none">
                  <div className="font-medium text-gray-800 leading-tight truncate">{r.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{r.state}</span>
                    {r.lotteryLevel && (
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded leading-none ${LOTTERY_BADGE[r.lotteryLevel]}`}>
                        {LOTTERY_WEIGHTS[r.lotteryLevel]}x
                      </span>
                    )}
                  </div>
                </td>
                {showRentLayer ? (
                  <>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-gray-700 whitespace-nowrap">
                      {r.fmr != null ? `${formatCurrency(r.fmr)}/mo` : "—"}
                    </td>
                    {hasNetSurplus && (
                      <td
                        className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap"
                        style={{ color: r.netSurplus != null ? getColor(r.netSurplus) : "#9ca3af" }}
                      >
                        {r.netSurplus != null ? formatSurplus(r.netSurplus) : "—"}
                      </td>
                    )}
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 text-right font-mono text-gray-700 whitespace-nowrap">
                      {formatCurrency(r.prevailingWage)}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap"
                      style={{ color: getColor(r.surplus) }}
                    >
                      {formatSurplus(r.surplus)}
                    </td>
                  </>
                )}
                {showDriveZone && (
                  <td className="px-3 py-2 text-right font-mono text-xs text-gray-500">
                    {Math.round(r.distanceMiles)}mi
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

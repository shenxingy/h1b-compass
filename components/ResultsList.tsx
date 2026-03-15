"use client";

import type { MsaResult } from "@/lib/types";
import { formatCurrency, formatSurplus, getColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  results: MsaResult[];   // pre-filtered by HomePage
  salary: number;
  showDriveZone: boolean;
}

export function ResultsList({ results, salary, showDriveZone }: Props) {
  const sorted = [...results].sort((a, b) => b.surplus - a.surplus);

  function exportCSV() {
    const headers = ["MSA Name", "State", "Prevailing Wage", "Surplus", "Distance (mi)", "Within Drive Zone"];
    const rows = sorted.map((r) => [
      `"${r.name}"`,
      r.state,
      r.prevailingWage,
      r.surplus,
      Math.round(r.distanceMiles),
      r.withinDriveZone ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `h1b-msas-${salary}.csv`;
    a.click();
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
          <span className="font-semibold text-green-700">{sorted.length}</span> areas, sorted by surplus
        </p>
        <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs">
          Export CSV
        </Button>
      </div>

      <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 font-semibold">Area</th>
              <th className="px-3 py-2 font-semibold text-right">Wage</th>
              <th className="px-3 py-2 font-semibold text-right">Surplus</th>
              {showDriveZone && (
                <th className="px-3 py-2 font-semibold text-right">Dist</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.msaCode}
                className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 max-w-[140px] sm:max-w-none">
                  <div className="font-medium text-gray-800 leading-tight truncate">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.state}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono text-gray-700 whitespace-nowrap">
                  {formatCurrency(r.prevailingWage)}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap"
                  style={{ color: getColor(r.surplus) }}
                >
                  {formatSurplus(r.surplus)}
                </td>
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

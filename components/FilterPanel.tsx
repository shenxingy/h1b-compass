"use client";

import { useState } from "react";
import { ORIGIN_CITIES, SOC_CODES, WAGE_LEVEL_LABELS } from "@/lib/constants";
import type { Filters, WageLevel } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  qualifyingCount: number;
  totalCount: number;
}

export function FilterPanel({ filters, onChange, qualifyingCount, totalCount }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function setOriginCity(name: string) {
    const coords = ORIGIN_CITIES[name];
    if (!coords) return;
    onChange({ ...filters, originName: name, originLat: coords[0], originLon: coords[1] });
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-5 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header — mobile: tap to expand/collapse, desktop: always open */}
      <button
        className="flex items-center justify-between w-full text-left md:cursor-default"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
            {qualifyingCount} qualifying
          </Badge>
          <Badge variant="outline" className="text-gray-500 hidden sm:inline-flex">
            {totalCount} total
          </Badge>
          {/* Chevron: mobile only */}
          <span className="md:hidden text-gray-400 text-xs ml-1">
            {mobileOpen ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Compact summary chips — mobile collapsed state only */}
      {!mobileOpen && (
        <div className="md:hidden flex flex-wrap gap-2 -mt-3">
          <span className="text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-600 font-mono">
            {formatCurrency(filters.salary)}
          </span>
          <span className="text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-600">
            {SOC_CODES[filters.socCode]?.split(" ")[0]}
          </span>
          <span className="text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-600">
            {filters.wageLevel}
          </span>
        </div>
      )}

      {/* Full filter body — hidden on mobile when collapsed */}
      <div className={`${mobileOpen ? "flex" : "hidden"} md:flex flex-col gap-5`}>

      {/* Salary Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="font-medium text-gray-700">Your Salary</label>
          <span className="font-mono font-semibold text-blue-700">
            {formatCurrency(filters.salary)}
          </span>
        </div>
        <Slider
          min={60000}
          max={300000}
          step={5000}
          value={[filters.salary]}
          onValueChange={(vals) => set("salary", (vals as number[])[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$60K</span>
          <span>$300K</span>
        </div>
      </div>

      {/* SOC Code */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Job Category</label>
        <Select value={filters.socCode} onValueChange={(v) => v && set("socCode", v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SOC_CODES).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wage Level */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Wage Level</label>
        <Select
          value={filters.wageLevel}
          onValueChange={(v) => v && set("wageLevel", v as WageLevel)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(WAGE_LEVEL_LABELS) as [WageLevel, string][]).map(([level, label]) => (
              <SelectItem key={level} value={level}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">H1B requires prevailing wage ≤ your salary</p>
      </div>

      {/* Qualifying Only */}
      <Toggle
        checked={filters.qualifyingOnly}
        onChange={(v) => set("qualifyingOnly", v)}
        label="Qualifying areas only"
        hint="Hides MSAs where prevailing wage exceeds your salary"
        color="green"
      />

      {/* ─── Drive Zone ─────────────────────────────── */}
      <div className="space-y-3 pt-1 border-t border-gray-100">
        <Toggle
          checked={filters.showDriveZone}
          onChange={(v) => set("showDriveZone", v)}
          label="Drive zone filter"
          hint="Dims and filters MSAs outside radius"
          color="blue"
        />

        {filters.showDriveZone && (
          <div className="space-y-3 pl-1">
            {/* Origin city */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Origin city</label>
              <Select value={filters.originName} onValueChange={(v) => v && setOriginCity(v)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ORIGIN_CITIES).map((city) => (
                    <SelectItem key={city} value={city} className="text-xs">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Radius slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-gray-600">Max distance</label>
                <span className="font-mono font-semibold text-blue-600">
                  {filters.radiusMiles} mi
                </span>
              </div>
              <Slider
                min={50}
                max={600}
                step={25}
                value={[filters.radiusMiles]}
                onValueChange={(vals) => set("radiusMiles", (vals as number[])[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>50 mi</span>
                <span>600 mi</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">Visualization guide</p>
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">Fill color = wage surplus</p>
          {[
            { color: "#16a34a", label: "> $40K surplus" },
            { color: "#65a30d", label: "$20K–$40K surplus" },
            { color: "#ca8a04", label: "$5K–$20K surplus" },
            { color: "#ea580c", label: "$0–$5K surplus" },
            { color: "#dc2626", label: "Below your salary" },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 bg-blue-200 border border-blue-400" />
            <span className="text-xs text-gray-600">Opacity = within drive zone</span>
          </div>
        </div>
      </div>
      </div> {/* end collapsible body */}
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  hint,
  color = "blue",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  color?: "blue" | "green";
}) {
  const activeColor = color === "green" ? "bg-green-600" : "bg-blue-600";
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
          checked ? activeColor : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

# H1B Compass — Claude Code Context

## What This Is
Interactive choropleth map for exploring H1B prevailing wages across US metro areas (MSAs). Users filter by salary, job category, wage level, and optional drive-zone radius to find qualifying worksites.

## Tech Stack
- **Framework**: Next.js 16 (App Router, `"use client"` for interactive components)
- **UI**: React 19, Tailwind v4, `@base-ui/react` (headless Select/Slider/Button)
- **Map**: Leaflet 1.9 (dynamically imported, SSR disabled)
- **State**: `nuqs` for URL query params; local `useState` for slider buffering
- **Data**: Static JSON/GeoJSON served from `public/data/`
- **Deploy**: Vercel

## Project Structure
```
app/              Next.js App Router (layout, page, globals.css)
components/       React components
  ui/             Headless UI wrappers (select, slider, button, badge)
  FilterPanel.tsx Filter sidebar (salary slider, SOC/level dropdowns, toggles)
  Map.tsx         Leaflet choropleth + drive zone circle
  ResultsList.tsx Sorted MSA table with CSV export
  HomePage.tsx    Layout + URL state + data wiring
hooks/
  useWageData.ts  Fetches wages.json + msas.geojson on mount
lib/
  constants.ts    SOC codes, wage levels, origin cities, color stops, map config
  types.ts        TypeScript types (Filters, MsaResult, MsaWages, etc.)
  utils.ts        getColor, haversine, centroid, formatCurrency, parseState
public/data/
  wages.json      DOL OFLC prevailing wages by MSA + SOC code
  msas.geojson    US MSA boundaries (GeoJSON FeatureCollection)
scripts/          Python data pipeline (fetch_bls.py, fetch_boundaries.py)
```

## Commands
```bash
npm run dev      # Dev server — MUST use -H 127.0.0.1 (port-allocation policy)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```

## Port Binding Rule

**Dev server MUST bind to `127.0.0.1` — never `0.0.0.0`**

- Use `npm run dev` which already includes `-H 127.0.0.1 -p 3004`
- If starting manually: `npx next dev -H 127.0.0.1 -p 3004`
- Access via VPN: https://h1b-compass.internal.scam.ai
- This is enforced by server-infra port-allocation policy

## Key Patterns

### Slider local state (prevents URL snap-back during drag)
Sliders use a two-state pattern: `localSalary` for visual feedback + `prevSalary` for
detecting external changes. `onValueChange` updates local only; `onValueCommitted` writes
to URL state. External state changes are detected via "setState during render" (not useEffect).

### Map pane z-indices
- `driveZonePane`: z-index 350 (below choropleth overlayPane at 400)
- Drive zone circle has `interactive: false` to avoid stealing pointer events

### Select dropdowns
All `<Select>` components use `modal={false}` to prevent Base UI's focus trap from
blocking map drag on touch devices.

### Toggle component
The Toggle `<label>` has `onClick` with `e.preventDefault()` to suppress the browser's
label-activation synthesized click (which would double-fire onChange).

## DON'T
- Don't import `useEffect` just to call `setState` — use "setState during render" pattern
- Don't add `modal={true}` or remove `modal={false}` from Select components (breaks mobile)
- Don't use `h-screen` — use `h-dvh` to avoid iOS Safari address bar issues
- Don't make the drive zone circle `interactive: true`
- Don't commit `public/data/` files (wages.json, msas.geojson) — they are large; regenerate with scripts

## Auto-Promoted Rules
<!-- Promoted from .claude/corrections/rules.md via /audit. -->

- **Third-party library error attribution** `[auto-promoted 2026-04-19 from 2026-03-31 console-error-attribution]`: When a console error stack frame points to our component (e.g. `slider.tsx:48`) but our code at that location contains no problematic pattern (no `<script>` tags, no `innerHTML`, etc.), the bug is in the third-party library we call — not in our usage. Investigate the library's source. Example: Base UI `SliderPrimitive.Thumb` internally uses `innerHTML` for a script tag, triggering React 19's "Encountered a script tag" warning at our JSX call site.

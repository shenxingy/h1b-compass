# H1B Compass — Verification Checklist

## Convergence: all ⬜ → ✅ or ⚠ before calling done

---

## Baseline (must always pass)

- [x] **type-check** — `npx tsc --noEmit` exits 0
- [x] **build** — `npm run build` exits 0, no TypeScript errors
- [x] **lint** — `npm run lint` exits 0, no ESLint errors

---

## Interaction (Playwright E2E @ 127.0.0.1:3004 — 12/12 pass)

- [x] **page loads** — HTTP 200, H1B Compass title present
- [x] **map renders** — Leaflet choropleth visible
- [x] **filter panel visible** — Filters, salary slider, SOC select, toggles all present
- [x] **salary slider found** — range input present
- [x] **rent toggle found** — present in FilterPanel
- [x] **drive zone toggle found** — present in FilterPanel
- [x] **qualifying toggle clickable** — toggles without error
- [x] **rent toggle updates URL** — `?rent=true` appended
- [x] **drive zone toggle updates URL** — `?drive=true` appended
- [x] **CSV export button found** — present in ResultsList
- [x] **SOC combobox found** — Select component with role="combobox"
- [x] **no relevant console errors** — only Next.js 16 internal script warning (not our code)

---

## Data Integrity

- [x] **wages.json loads** — 530 MSAs, 393 M1 CBSAs have wage data; 542 M2 areas show "No data" (expected — data source)
- [x] **msas.geojson loads** — 935 features (393 M1 Metro Divisions + 542 M2 Metro Statistical Areas)
- [x] **rent.json loads** — 2353 CBSAs, all 5 bedroom types (fmr_0–fmr_4); 393 M1 geo codes align perfectly; 542 M2 have no FMR (expected)
- [x] **SOC codes** — all 12 SOC codes present in wages.json
- [x] **bedroom count selector** — rent layer shows 0BR (Studio), 1BR, 2BR, 3BR, 4BR options; map + table + CSV all reflect selected bedroom type
- [x] **major MSA spot checks** (2026-04-07, default SOC 15-1252 Software Developer):
  - SF (41860): wage L2=$161,637, Studio=$2,485, 1BR=$2,977, 2BR=$3,604, 3BR=$4,604/mo
  - LA (31080): wage L2=$129,667, 2BR FMR=$3,236/mo
  - DC (47900): wage L2=$126,090, Studio=$1,953, 1BR=$2,015, 2BR=$2,246, 3BR=$2,835/mo
  - Chicago (16980): wage L2=$108,077, 2BR FMR=$2,050/mo
- [x] **surplus color** — green when salary > prevailing, red when salary < prevailing
- [x] **rent color** — green = low FMR (affordable), red = high FMR (expensive)
- [x] **drive zone filter** — haversine distance + dimming (not hiding)

---

## Edge Cases

- [x] **empty wage data** — 542 M2 MSAs show gray fill + "No data" tooltip (expected)
- [x] **empty rent data** — same 542 M2 MSAs show "No rent data" in rent mode (expected)
- [x] **large salary (>$300K)** — slider max 300K, number type prevents overflow
- [x] **zero results** — "No areas match current filters" message shown
- [x] **rent toggle + qualifying filter** — rent mode bypasses qualifying filter (independent views)

---

## VPN Domain Access

- [x] **h1b-compass.internal.scam.ai resolves** — Next.js Turbopack cross-origin blocking resolved via `allowedDevOrigins` in `next.config.ts` (prevents "Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr")

## New Features (2026-04-08)

- [x] **search box present** — SearchBox renders in global header when geojson is loaded
- [x] **search filters MSA list** — input with ≥2 chars shows filtered dropdown (z-[500] clears Leaflet overlayPane at 400)
- [x] **search keyboard nav** — ArrowUp/Down/Enter/Escape handled; outside click closes
- [x] **search → map pan** — onSelect sets `focusMsaCode`, Map `useEffect` calls `setView(centroid, 7)` + 2s blue border highlight
- [x] **search → results scroll** — ResultsList `scrollIntoView` on `id="msa-row-{msaCode}"` row; focused row highlighted blue-50
- [x] **lottery badge data** — `getLotteryLevel(wages, salary)` returns highest level where salary ≥ prevailing wage; 3 MSAs return null at $110K (salary below L1), 66 return L1, 279 L2, 163 L3, 19 L4 (validated against wages.json)
- [x] **lottery badge display** — colored pill in Area column: 4x=green, 3x=blue, 2x=amber, 1x=gray; absent when lotteryLevel undefined
- [x] **lottery header hint** — header shows dominant lottery level for qualifying MSAs (e.g. "2x lottery" at default $110K / L2 / 15-1252)
- [x] **net surplus computed** — `netSurplus = surplus − fmr×12` always computed when rent data available; fmr always included in MsaResult (not gated by showRentLayer)
- [x] **Net/yr column in rent mode** — `hasNetSurplus` guard: column only appears when `showRentLayer=true` AND at least one result has netSurplus; colored by `getColor(netSurplus)`
- [x] **rent mode sort** — sorts by netSurplus descending when data available (livability-first); fallback to FMR desc
- [x] **Net/yr in CSV export** — CSV headers include "Net Surplus/yr" in rent mode
- [x] **share button** — "Share" button in header; `navigator.clipboard.writeText(window.location.href)`; 2s "Copied!" + checkmark feedback
- [x] **share button URL** — nuqs encodes all filter state into URL; copied link fully restores filter state on open

---

## ⚠ Known Limitations

- [ ] FBI UCR crime data layer — not yet integrated (P1)
- [ ] Age/family-structure income guidance — not yet integrated (P2)
- [ ] LLM chat-in-UI — not yet integrated (P3)
- [ ] Dynamic color legend — legend stays on wage colors; rent mode has no legend (P2)
- [ ] **Base UI script warning** — `@base-ui/react` slider Thumb component uses innerHTML for a script tag, triggering React 19 "Encountered a script tag" warning. Does not affect slider functionality. (Persists through v1.3.0 — third-party bug.)

---

_Updated: 2026-04-08_

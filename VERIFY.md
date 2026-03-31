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
- [x] **SOC codes** — all 11 SOC codes present in wages.json
- [x] **bedroom count selector** — rent layer shows 0BR (Studio), 1BR, 2BR, 3BR, 4BR options; map + table + CSV all reflect selected bedroom type
- [x] **major MSA spot checks** (2026-03-31):
  - SF (41860): wage L2=$169,930, Studio=$2,485, 1BR=$2,977, 2BR=$3,604, 3BR=$4,604/mo
  - LA (31080): wage L2=$148,400, 2BR FMR=$3,236/mo
  - DC (47900): wage L2=$147,420, Studio=$1,953, 1BR=$2,015, 2BR=$2,246, 3BR=$2,835/mo
  - Chicago (16980): 2BR FMR=$2,050/mo
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

## ⚠ Known Limitations

- [ ] FBI UCR crime data layer — not yet integrated (P1)
- [ ] Age/family-structure income guidance — not yet integrated (P2)
- [ ] LLM chat-in-UI — not yet integrated (P3)
- [ ] Dynamic color legend — legend stays on wage colors; rent mode has no legend (P2)
- [ ] **Base UI script warning** — `@base-ui/react` slider Thumb component uses innerHTML for a script tag, triggering React 19 "Encountered a script tag" warning. Does not affect slider functionality. (Persists through v1.3.0 — third-party bug.)

---

_Updated: 2026-03-31_

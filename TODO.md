# H1B Compass — Feature Roadmap

## Features in Progress

### P0 · Global Header MSA Search
**Goal**: User types a city/MSA name → map pans there + results list scrolls to that row.

**Files**:
- `components/SearchBox.tsx` — combobox autocomplete over MSA names (new)
- `components/HomePage.tsx` — `focusMsaCode` state, `msaList` from geojson, search + copy-link in header
- `components/Map.tsx` — `focusMsaCode` prop → `setView` to centroid + 2s highlight
- `components/ResultsList.tsx` — `id` on each row, `scrollIntoView` on focus change

### P1 · Wage-Weighted Lottery Multiplier
**Goal**: Show each MSA's H1B lottery weight (1x–4x) based on the highest level where the user's salary qualifies. Reflects USCIS wage-weighted selection (effective FY2027, Feb 2026 rule).

**Background**: L1=1x, L2=2x, L3=3x, L4=4x registrations. No other map tool shows this yet.

**Files**:
- `lib/utils.ts` — `getLotteryLevel(wages, salary)` → highest qualifying WageLevel
- `lib/constants.ts` — `LOTTERY_WEIGHTS: { L1:1, L2:2, L3:3, L4:4 }`
- `lib/types.ts` — `lotteryLevel?: WageLevel` on MsaResult
- `components/HomePage.tsx` — compute in allResults useMemo
- `components/ResultsList.tsx` — colored badge (4x green, 3x blue, 2x amber, 1x gray) in Area column

### P2 · Net Annual Surplus (Surplus − Annual Rent)
**Goal**: "How much breathing room do I have here?" = wage surplus minus annual rent. Converts abstract wage numbers into real purchasing power.

**Files**:
- `lib/types.ts` — `netSurplus?: number` on MsaResult
- `components/HomePage.tsx` — always compute `fmr` and `netSurplus = surplus − fmr×12`
- `components/ResultsList.tsx` — "Net/yr" column in rent mode; always show in rent mode

### P3 · Shareable URL Copy Button
**Goal**: One-click copy of current URL. nuqs already encodes all filter state into the URL.

**Files**:
- `components/HomePage.tsx` — "Copy link" button in header, `navigator.clipboard`, 2s "Copied!" feedback

---

## Backlog (requires new data sources)

### P4 · Employer Sponsor Density per MSA
Count of active H1B sponsors + approval rate per MSA (from DOL H-2 LCA filings).
Requires ingesting MyVisaJobs/DOL H-2 data — significant data pipeline work.

### P5 · 5-Year Wage Trend Sparklines
Historical prevailing wage per MSA/SOC from prior DOL OFLC cycles.
Requires multi-year data pipeline.

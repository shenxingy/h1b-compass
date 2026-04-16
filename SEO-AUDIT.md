# SEO Audit: H1B Compass

**Date:** 2026-04-15
**URL:** https://h1b-compass.internal.scam.ai
**Framework:** Next.js 16 (App Router)

---

## Overall SEO Score: 15/100

| Category | Score | Max | Grade |
|----------|-------|-----|-------|
| Crawlability & Indexability | 3/20 | 20 | F |
| On-Page SEO | 5/20 | 20 | F |
| Technical Performance | 8/20 | 20 | D |
| Mobile & UX | 14/20 | 20 | C |
| Content & Authority | 0/20 | 20 | F |

---

## 1. Crawlability & Indexability (3/20)

### robots.txt: MISSING
- No `public/robots.txt` file
- Crawlers have no directives, no sitemap reference
- **Fix:** Create `public/robots.txt` with explicit Allow rules and Sitemap directive

### Sitemap: MISSING
- No `sitemap.xml` (neither `public/sitemap.xml` nor `app/sitemap.ts`)
- Google, Bing, and other search engines cannot discover pages efficiently
- **Fix:** Add `app/sitemap.ts` using Next.js convention

### Indexable Content: CRITICAL FAILURE
- All components marked `"use client"` — server HTML is just `<div>Loading...</div>`
- Googlebot renders JS, but with a delay and not always completely (Leaflet + 3.3MB JSON)
- Bing, Yandex, and other crawlers may not render JS at all
- **Impact:** Search engines may index the page but see minimal content

### URL Structure
- Single page app: only `/` exists
- Filter state stored in URL query params via `nuqs` (good for sharing, bad for SEO)
- No clean URL routes like `/guide`, `/about`, `/faq`
- No internal links (single page = zero link equity flow)

### Canonical URL: MISSING
- No `<link rel="canonical">` tag
- Query param variations (e.g., `/?salary=150000&soc=15-1252`) could create duplicate content issues
- **Fix:** Add `alternates.canonical` in `app/layout.tsx` metadata

---

## 2. On-Page SEO (5/20)

### Title Tag: OK (partial credit)
```
H1B Compass — Find Your Best Worksite
```
- 40 characters — within 60-char limit
- Contains primary intent but missing high-volume keywords like "prevailing wage"
- **Better:** "H1B Prevailing Wage Map — Find Your Best Worksite | H1B Compass"

### Meta Description: OK (partial credit)
```
Visualize DOL prevailing wages across US metro areas to find the optimal H1B worksite.
Filter by job category, wage level, and drive distance.
```
- 155 characters — good length
- Contains keywords but reads more like a feature list than a compelling snippet
- **Better:** Include a call-to-action and differentiation ("Free interactive map...")

### Keywords Meta: PRESENT
```
H1B prevailing wage, H1B worksite, DOL prevailing wage map, H1B visa, BLS OEWS wages
```
- Google ignores `<meta keywords>`, but present for other engines

### Heading Hierarchy: BROKEN (for crawlers)
What crawlers see:
```
<h1> — NONE (H1 is inside "use client" component, not rendered server-side)
```

What JavaScript renders:
```
<h1> H1B Compass
<h2> Filters (inside FilterPanel)
```
- Only 1 H1, 1 H2 — extremely thin heading structure
- No H2/H3 content headings about H1B wages, methodology, etc.
- **Fix:** Add server-rendered content section with proper H2/H3 hierarchy

### Open Graph Tags: INCOMPLETE

| Tag | Status |
|-----|--------|
| og:title | Present |
| og:description | Present |
| og:type | Present ("website") |
| og:url | **MISSING** |
| og:image | **MISSING** |
| og:site_name | **MISSING** |

### Twitter Card: MISSING
- No `twitter:card`, `twitter:title`, `twitter:description`, or `twitter:image`
- Shared links on Twitter/X show no preview card

### Images & Alt Text
- No content images on the page (the map is a Leaflet canvas)
- Only file in `public/`: `next.svg` (Next.js placeholder logo)
- No OG social preview image
- `app/favicon.ico` exists but no `apple-touch-icon` or `manifest.json`

---

## 3. Technical Performance (8/20)

### JavaScript Payload
- **3.3 MB of JSON data** loaded on every visit:
  - `wages.json`: 873 KB
  - `msas.geojson`: 2.4 MB
- Both fetched client-side by `useWageData` and `useRentData` hooks
- No compression, no chunking, no lazy loading of data
- **Impact:** Slow initial load, especially on mobile/3G. Googlebot may time out before rendering.

### Code Splitting: PARTIAL
- Map component uses `dynamic(() => import(...), { ssr: false })` — good, code-splits Leaflet
- But all 3.3MB of JSON data is still fetched immediately on mount

### Third-Party Resources
- Google Fonts (Geist, Geist Mono) — loaded via `next/font` (optimized)
- OpenStreetMap tiles — loaded on map init
- Leaflet CSS — imported in globals.css

### No Web Vitals Optimization
- No `next/image` usage (no images to optimize)
- No explicit `loading="lazy"` on any elements
- GeoJSON rendering is render-blocking for the map (2.4MB parse + paint)

### HTTPS: YES
- Site served via HTTPS (internal domain with TLS)

### Compression
- Next.js default: gzip/brotli on responses — OK for HTML/JS
- JSON data files: served as static files, should be compressed by the CDN/server
- **Note:** 2.4MB GeoJSON could be simplified (reduce coordinate precision, remove unused properties)

---

## 4. Mobile & UX (14/20)

### Viewport: OK
- Next.js auto-injects `<meta name="viewport" content="width=device-width, initial-scale=1">`

### Mobile Layout: GOOD
- Uses `h-dvh` (avoids iOS Safari address bar issue)
- Responsive flex layout: map on top (42dvh), sidebar below on mobile; side-by-side on desktop
- Collapsible filter panel on mobile with summary chips
- `md:` breakpoints throughout components (21 occurrences across 5 files)

### Touch Interactions: GOOD
- `modal={false}` on all Select dropdowns (prevents focus trap on mobile)
- Drive zone circle `interactive: false` (no pointer event stealing)
- Tap-to-highlight on map features
- Toggle labels with `e.preventDefault()` to prevent double-fire

### Issues
- No `apple-touch-icon` — iOS home screen bookmark shows blank icon
- No `manifest.json` / `theme-color` — no PWA support
- Map tooltip on mobile relies on tap — discoverability could be better
- `overflow-hidden` on map container may cause scroll issues on some Android browsers

---

## 5. Content & Authority (0/20)

### Textual Content: NONE
- Zero paragraphs of prose content
- No explanatory text about H1B prevailing wages
- No FAQ section
- No methodology/data source explanation
- No guide or how-to content
- **This is the single biggest SEO gap.** Google needs text to understand what the page is about.

### E-E-A-T Signals: NONE
- No author information
- No "About" page
- No organization/team info
- No publication or last-updated date (visible to crawlers)
- No data source citations (the "DOL OFLC 7/2025-6/2026" text is inside a client component)
- No privacy policy / terms of service

### Schema / Structured Data: NONE
- No JSON-LD markup
- Missing: WebApplication, Dataset, Organization, BreadcrumbList

### Internal Linking: IMPOSSIBLE
- Single-page app with zero routes
- No content pages to link to/from
- No footer links
- Zero link equity distribution

### External Signals
- Open-source on GitHub (potential authority signal)
- No known Reddit, Wikipedia, or social media presence
- No backlink profile analysis possible (internal domain)

---

## Priority Fix List

### Tier 1: Critical (do these first)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Add server-rendered content section below the tool | 2-4h | Gives crawlers actual text to index |
| 2 | Create `public/robots.txt` | 5 min | Enables proper crawling |
| 3 | Add `app/sitemap.ts` | 15 min | Enables page discovery |
| 4 | Add canonical URL in metadata | 5 min | Prevents query-param duplicates |
| 5 | Complete OG + Twitter Card meta tags | 30 min | Social sharing previews |

### Tier 2: High Priority

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 6 | Add JSON-LD structured data (WebApplication + Dataset) | 1h | Rich results, AI discoverability |
| 7 | Create `/about` page with methodology + data sources | 1-2h | E-E-A-T signal, indexable content |
| 8 | Create `/guide` page — H1B worksite selection guide | 2-3h | Keyword-targeted content page |
| 9 | Create OG image / social preview | 1h | Visual presence on social shares |
| 10 | Add `apple-touch-icon` + `manifest.json` | 30 min | Mobile bookmark + PWA basics |

### Tier 3: Performance & Polish

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 11 | Compress/simplify `msas.geojson` (2.4MB is huge) | 2h | Faster load, better Googlebot rendering |
| 12 | Add `<noscript>` fallback with text summary | 30 min | Non-JS crawler fallback |
| 13 | Optimize title tag for search volume keywords | 5 min | Better CTR from SERPs |
| 14 | Add footer with data attribution + links | 1h | E-E-A-T + internal linking |
| 15 | Create `public/llms.txt` | 15 min | AI search visibility |

---

## Quick Win Checklist

These can all be done in under 1 hour total:

- [ ] Create `public/robots.txt`
- [ ] Add canonical URL to metadata (`alternates: { canonical: "https://..." }`)
- [ ] Add Twitter Card metadata
- [ ] Add `og:image`, `og:url`, `og:site_name`
- [ ] Add `<noscript>` block in `app/page.tsx`
- [ ] Create `public/llms.txt`
- [ ] Optimize `<title>` to include "prevailing wage"

---

## Competitor Keyword Opportunities

Based on the tool's functionality, these are high-intent keywords with likely low competition:

| Keyword | Search Intent | Current Coverage |
|---------|--------------|-----------------|
| h1b prevailing wage by city | Informational | No content |
| h1b prevailing wage map | Informational | Title only |
| h1b worksite selection | Transactional | Meta description only |
| prevailing wage level 1 vs level 2 | Informational | No content |
| h1b wage surplus calculator | Transactional | No content |
| dol prevailing wage lookup | Transactional | No content |
| h1b lottery wage level multiplier | Informational | No content |
| fair market rent by metro area | Informational | No content |

Each of these could be a dedicated content section or page targeting that query.

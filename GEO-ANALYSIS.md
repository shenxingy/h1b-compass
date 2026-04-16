# GEO Analysis: H1B Compass

**Date:** 2026-04-15
**URL:** https://h1b-compass.internal.scam.ai
**Tool:** H1B prevailing wage choropleth map

---

## GEO Readiness Score: 8/100

| Category | Score | Max | Grade |
|----------|-------|-----|-------|
| Citability | 0/25 | 25 | F |
| Structural Readability | 2/20 | 20 | F |
| Multi-Modal Content | 5/15 | 15 | F |
| Authority & Brand Signals | 1/20 | 20 | F |
| Technical Accessibility | 0/20 | 20 | F |

---

## 1. AI Crawler Access Status

### robots.txt: MISSING

No `public/robots.txt` exists. AI crawlers default to crawling everything, but they receive no guidance, no sitemap pointer, and no explicit allow directives.

### llms.txt: MISSING

No `public/llms.txt` exists. AI systems have no structured content guide.

### Sitemap: MISSING

No `sitemap.xml` or `app/sitemap.ts`. Crawlers cannot discover pages.

---

## 2. Server-Side Rendering: CRITICAL FAILURE

**Every component is `"use client"`.** The server returns this to crawlers:

```html
<html lang="en">
  <body>
    <div>Loading...</div>
  </body>
</html>
```

**AI crawlers do NOT execute JavaScript.** GPTBot, ClaudeBot, PerplexityBot, and Google AIO's crawler all see a blank page with "Loading..." text. The entire application — the map, all 380+ MSA wage comparisons, the filter panel, the results table — is invisible to every AI system.

Files affected:
- `components/HomePage.tsx` — `"use client"` (line 1)
- `components/Map.tsx` — `"use client"` (line 1), also `dynamic(() => ..., { ssr: false })`
- `components/ResultsList.tsx` — `"use client"` (line 1)
- `components/FilterPanel.tsx` — `"use client"` (line 1)
- `app/page.tsx` — Server component, but wraps `<Suspense fallback="Loading...">`

This is the single biggest blocker. Without fixing SSR, no other GEO optimization matters.

---

## 3. Passage-Level Citability: 0 citable passages

Optimal passage length for AI citation: 134-167 words of self-contained, quotable text.

**Current state:** Zero static text passages exist anywhere on the page. All content is:
- Dynamically computed wage data (invisible to crawlers)
- UI labels ("Filters", "Qualifying areas only", "Export CSV")
- One meta description (26 words, too short)

**Missing citable content:**
- No "What is H1B prevailing wage?" definition
- No explanation of how DOL OFLC wages work
- No guide on wage level tiers (L1-L4) and their percentile meanings
- No FAQ about H1B worksite selection strategy
- No methodology description (data source, update frequency)

---

## 4. Authority & Brand Signals: Minimal

| Signal | Status |
|--------|--------|
| Author byline | Missing |
| Author credentials | Missing |
| Publication date | Missing |
| Last-updated date | Missing |
| Data source citation | Tiny "DOL OFLC 7/2025-6/2026" in header, not crawlable |
| Organization schema | Missing |
| Person schema | Missing |
| Wikipedia presence | None |
| Reddit mentions | Unknown |
| YouTube presence | None |
| LinkedIn presence | Unknown |
| GitHub README | Exists (open-source), but not linked from the site |

---

## 5. Meta Tags Audit

| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | Present | "H1B Compass -- Find Your Best Worksite" |
| `meta description` | Present | 155 chars, decent |
| `og:title` | Present | Same as title |
| `og:description` | Present | Shorter variant |
| `og:type` | Present | "website" |
| `og:image` | **Missing** | No social preview image |
| `og:url` | **Missing** | No canonical OG URL |
| `twitter:card` | **Missing** | No Twitter Card |
| `twitter:image` | **Missing** | No Twitter preview |
| Canonical URL | **Missing** | No `<link rel="canonical">` |
| `lang` attribute | Present | `en` |
| Keywords | Present | 5 keywords, good |
| Viewport | Present (Next.js default) | OK |

---

## 6. Structured Data / Schema: NONE

Zero JSON-LD or schema markup detected. Recommended schemas:

- **WebApplication** — describes the tool itself (name, description, category, offers)
- **Dataset** — describes the DOL OFLC wage data (source, temporal coverage, spatial coverage)
- **Organization** — publisher/maintainer info
- **FAQPage** — if FAQ content is added
- **BreadcrumbList** — navigation context

---

## 7. Platform Breakdown

| Platform | Readiness | Why |
|----------|-----------|-----|
| Google AI Overviews | 2/100 | No SSR content to index. No schema. Good meta description helps minimally. |
| ChatGPT Web Search | 0/100 | GPTBot sees "Loading..." No Wikipedia or Reddit entity. |
| Perplexity | 0/100 | PerplexityBot sees blank page. No Reddit threads to reference. |
| Bing Copilot | 2/100 | Same SSR problem. No IndexNow. |

---

## Top 10 Highest-Impact Changes

### CRITICAL (must fix first)

**1. Add server-rendered static content below the interactive tool**

The single highest-impact change. Add a server component section below the map that renders static HTML visible to all crawlers. This section should contain:

- "What is H1B Prevailing Wage?" definition (134-167 words)
- How wage levels (L1-L4) work
- Data source and methodology
- FAQ: "How do I choose a worksite?" / "What wage level should I target?"

Implementation: Create a new server component `components/StaticContent.tsx` (no `"use client"`) and render it in `app/page.tsx` below `<HomePage />`.

**2. Create `public/robots.txt`**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://h1b-compass.internal.scam.ai/sitemap.xml
```

**3. Create `public/llms.txt`**

```
# H1B Compass
> Interactive tool for exploring DOL prevailing wages across 380+ US metro areas (MSAs). Helps H1B visa applicants find optimal worksites by comparing their salary against prevailing wage requirements.

## Features
- Choropleth wage map with surplus visualization
- Filter by job category (12 SOC codes), wage level (L1-L4)
- Drive zone radius filter from 14 origin cities
- HUD Fair Market Rent overlay with net surplus calculation
- H1B lottery multiplier display (FY2027 wage-weighted system)
- CSV export of filtered results

## Data Sources
- DOL OFLC Prevailing Wages (July 2025-June 2026)
- BLS OEWS wage survey data
- HUD FY2026 Fair Market Rents
- USCIS FY2027 wage-weighted lottery multipliers

## Key Facts
- Covers 380+ Metropolitan Statistical Areas
- 12 tech job categories (SOC codes)
- 4 wage levels: L1 (17th percentile) through L4 (67th percentile)
- H1B requires employer to pay at or above the prevailing wage for the worksite location
```

### HIGH PRIORITY

**4. Add JSON-LD structured data to `app/layout.tsx`**

Add WebApplication + Dataset schema so AI systems understand what this tool is.

**5. Complete meta tags**

Add to `app/layout.tsx`:
- `twitter` card metadata
- `og:image` (create a social preview image)
- `canonical` URL via `alternates`
- `authors` metadata

**6. Create a sitemap**

Add `app/sitemap.ts` (Next.js convention) or static `public/sitemap.xml`.

### MEDIUM PRIORITY

**7. Add a `<noscript>` fallback**

In `app/page.tsx`, add a `<noscript>` block with a text summary of what the tool does, key data points, and links. This is what JS-disabled crawlers see.

**8. Create content pages**

Add routes like:
- `/about` — methodology, data sources, team
- `/guide` — H1B worksite selection guide (highly citable)
- `/faq` — common H1B prevailing wage questions

Each page = a new citable surface for AI.

**9. Add visible data attribution**

Move "DOL OFLC 7/2025-6/2026" from a tiny header span to a proper footer with full source citations and last-updated date, rendered server-side.

**10. Build external brand signals**

- Post tool on Reddit r/h1b, r/immigration
- Create a GitHub README with clear project description
- Submit to Product Hunt / Hacker News
- Write a LinkedIn post about the tool

---

## Content Reformatting Suggestions

Since there is currently zero static prose, the entire content layer needs to be created. Priority passages to write (each 134-167 words, self-contained):

1. **"What is H1B Prevailing Wage?"** — Define it, cite DOL, explain why it matters for visa approval
2. **"How Wage Levels Work"** — L1 through L4 percentile mapping, which level most H1B petitions use
3. **"How to Choose a Worksite"** — Explain the surplus concept, why lower-cost MSAs can be strategic
4. **"FY2027 Lottery Changes"** — Wage-weighted lottery system, multiplier tiers
5. **"About the Data"** — OFLC source, BLS OEWS methodology, update cycle, coverage

---

## Summary

H1B Compass is an excellent interactive tool with genuinely useful data, but it is **completely invisible to AI systems**. The 100% client-side rendering means every AI crawler sees a blank page. The fix path is clear:

1. Add server-rendered static content (immediate, highest ROI)
2. Add robots.txt + llms.txt (5 minutes, enables crawling)
3. Add structured data + complete meta tags (1-2 hours)
4. Create citable content pages (ongoing)
5. Build external brand signals (ongoing)

The good news: since the tool already has unique, valuable data (380+ MSA prevailing wage comparisons), even basic static content will be highly citable because no other tool presents this data interactively.

# H1B Compass

Interactive map for finding the best H1B worksite by DOL prevailing wage.

Enter your salary, pick your job category and wage level, and instantly see which metro areas (MSAs) qualify — colored by how much surplus you have over the prevailing wage. Add a drive-zone filter to focus on areas within a given radius of your home city.

**Live:** [h1b-compass.vercel.app](https://h1b-compass.vercel.app)

## Data

- **Wages**: DOL OFLC prevailing wage database (July 2025 – June 2026)
- **Boundaries**: US Census CBSA GeoJSON

Data files are not committed (large generated outputs). Generate them before running the dev server:

```bash
pip install requests        # fiona or pyshp recommended for boundaries
python scripts/fetch_bls.py
python scripts/fetch_boundaries.py
```

## Dev

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type check
```

## Stack

Next.js 16 · React 19 · Tailwind v4 · Leaflet · Base UI · nuqs (URL state) · Vercel

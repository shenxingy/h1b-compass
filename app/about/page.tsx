import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About & Methodology — H1B Compass",
  description:
    "Learn how H1B Compass calculates prevailing wage data. Covers DOL OFLC data sources, BLS OEWS methodology, FY2027 lottery weights, and Fair Market Rent integration.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About & Methodology — H1B Compass",
    description:
      "How H1B Compass works: DOL OFLC data pipeline, wage level methodology, and FY2027 lottery weight calculations.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About & Methodology — H1B Compass",
    description:
      "How H1B Compass works: DOL OFLC data pipeline, wage level methodology, and FY2027 lottery weight calculations.",
    images: ["/og.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://h1b-compass.vercel.app",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About & Methodology",
      item: "https://h1b-compass.vercel.app/about",
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-dvh bg-white">
        <header className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              &larr; Back to Map
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-bold text-gray-900">About & Methodology</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

          {/* ─── What Is H1B Compass ──────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">What Is H1B Compass?</h2>
            <p className="text-gray-700 leading-relaxed">
              H1B Compass is a free, open-source interactive tool that visualizes DOL
              prevailing wages across 380+ US Metropolitan Statistical Areas (MSAs). It
              helps H1B visa applicants and sponsoring employers compare wage requirements
              by location, identify worksites where a given salary provides the most
              favorable margin, and understand how worksite choice affects H1B lottery
              odds under the FY2027 wage-weighted system.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The tool combines multiple federal data sources into a single interactive
              map with filtering, cost-of-living overlays, and CSV export. All code is
              open source and available on{" "}
              <a
                href="https://github.com/shenxingy/h1b-compass"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>.
            </p>
          </section>

          {/* ─── Data Sources ─────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Prevailing Wage Data
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Prevailing wages are sourced from the U.S. Department of Labor, Office of
              Foreign Labor Certification (OFLC). The current dataset covers the July 2025
              through June 2026 prevailing wage period. These wages are derived from the
              Bureau of Labor Statistics (BLS) Occupational Employment and Wage Statistics
              (OEWS) annual survey, which collects wage data from approximately 1.1 million
              establishments across all 50 states.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For each MSA and occupation (identified by Standard Occupational
              Classification code), the DOL publishes wages at four percentile-based
              levels: Level 1 (17th percentile), Level 2 (34th percentile), Level 3
              (50th percentile / median), and Level 4 (67th percentile).
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Fair Market Rent Data
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Rent data comes from the U.S. Department of Housing and Urban Development
              (HUD) FY2026 Fair Market Rent (FMR) estimates. FMRs represent the 40th
              percentile of gross rents (including utilities) for standard-quality rental
              units in each metro area. H1B Compass provides FMR data for studio through
              4-bedroom units, enabling net surplus calculations that account for housing
              costs.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Geographic Boundaries
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Metro area boundaries (GeoJSON polygons) are sourced from U.S. Census Bureau
              Core Based Statistical Area (CBSA) TIGER/Line shapefiles. Each MSA is
              identified by its CBSA FIPS code, which links the geographic boundaries to
              the corresponding wage and rent data.
            </p>
          </section>

          {/* ─── Methodology ──────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Methodology</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Wage Surplus Calculation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              For each MSA, the wage surplus is calculated as: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">Surplus =
              Your Salary - Prevailing Wage</code>. A positive surplus means the salary
              exceeds the prevailing wage at that location (qualifying for H1B filing).
              A negative surplus means the prevailing wage exceeds the salary. The
              choropleth map colors each MSA from green (large surplus) to red (below
              prevailing wage).
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Net Surplus (with Rent)
            </h3>
            <p className="text-gray-700 leading-relaxed">
              When the rent layer is enabled, H1B Compass calculates: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">Net
              Surplus = Wage Surplus - (Annual FMR)</code>. This provides a more
              complete picture by factoring in housing costs. A metro with a $30K wage
              surplus but $36K annual rent yields a -$6K net surplus, while a metro with
              a $15K wage surplus and only $12K annual rent yields a +$3K net surplus.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              FY2027 Lottery Multiplier
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Under the USCIS FY2027 rule (effective February 2026), H1B cap registrations
              are weighted by wage level. H1B Compass determines the highest wage level at
              which a salary qualifies in each MSA and displays the corresponding lottery
              multiplier. For example, if a $130K salary qualifies at Level 3 in MSA A but
              only Level 2 in MSA B, the lottery weight would be 3x versus 2x respectively.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Drive Zone Calculation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Distance from the origin city to each MSA is calculated using the Haversine
              formula applied to the centroid of each MSA polygon. The drive zone circle
              is rendered as a geodesic circle on the map. MSAs whose centroids fall
              outside the specified radius are visually dimmed and can be filtered from
              the results list.
            </p>
          </section>

          {/* ─── SOC Codes ────────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Supported Job Categories
            </h2>
            <p className="text-gray-700 leading-relaxed">
              H1B Compass covers 12 technology occupation codes from the Standard
              Occupational Classification (SOC) system:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">SOC Code</th>
                    <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">Job Title</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[
                    ["15-1252", "Software Developer"],
                    ["15-2051", "Data Scientist / AI Engineer"],
                    ["15-1212", "Security Engineer"],
                    ["15-1243", "Data Engineer / DB Architect"],
                    ["15-1244", "DevOps / SRE"],
                    ["15-1241", "Network / Infrastructure"],
                    ["15-1255", "Frontend / Web Developer"],
                    ["17-2061", "Hardware Engineer"],
                    ["15-1299", "Compiler / Platform Eng"],
                    ["15-2041", "Data Analyst"],
                    ["15-1211", "Systems Analyst"],
                    ["15-1251", "Computer Programmer"],
                  ].map(([code, title], i) => (
                    <tr key={code} className={i % 2 ? "bg-gray-50/50" : ""}>
                      <td className="px-4 py-2 font-mono text-xs">{code}</td>
                      <td className="px-4 py-2">{title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Limitations ──────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Limitations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Prevailing wages are updated annually; actual wages offered in specific
                job postings may differ from OEWS survey averages.
              </li>
              <li>
                Fair Market Rents represent the 40th percentile of rents and may not
                reflect actual rents in specific neighborhoods within a metro area.
              </li>
              <li>
                Drive zone distances are calculated to MSA centroids (straight line), not
                actual driving distances.
              </li>
              <li>
                This tool covers only the 12 tech occupation codes listed above. Other
                occupations may be added in future updates.
              </li>
              <li>
                This tool is for informational purposes only and does not constitute
                legal or immigration advice. Consult an immigration attorney for
                individual case guidance.
              </li>
            </ul>
          </section>

        </main>
      </div>
      <Footer />
    </>
  );
}

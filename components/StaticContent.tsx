// Server component — NO "use client" — rendered as static HTML for crawlers

import Link from "next/link";

export function StaticContent() {
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* ─── What Is H1B Prevailing Wage ─────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            What Is the H1B Prevailing Wage?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The H1B prevailing wage is the minimum salary an employer must pay an H1B visa
            worker based on the job location and occupation. Set by the U.S. Department of
            Labor (DOL) using Bureau of Labor Statistics (BLS) Occupational Employment and
            Wage Statistics (OEWS) survey data, prevailing wages vary significantly across
            Metropolitan Statistical Areas (MSAs). The same Software Developer role can have
            a prevailing wage difference of over $40,000 between high-cost metros like San
            Francisco and lower-cost areas like Des Moines. H1B Compass visualizes these
            differences across 380+ metro areas so applicants and employers can identify
            worksites where a given salary provides the greatest margin above the prevailing
            wage requirement.
          </p>
        </div>

        {/* ─── Wage Levels Explained ──────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            How Do H1B Wage Levels Work?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The DOL defines four prevailing wage levels based on the percentile of wages
            for an occupation within each metro area. Each level corresponds to a different
            experience tier, and the wage level filed on the Labor Condition Application
            (LCA) determines the minimum salary the employer must pay.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">Level</th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">Percentile</th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">Experience</th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">FY2027 Lottery Weight</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">Level 1 (L1)</td>
                  <td className="px-4 py-3">17th percentile</td>
                  <td className="px-4 py-3">Entry-level</td>
                  <td className="px-4 py-3">1x (base)</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">Level 2 (L2)</td>
                  <td className="px-4 py-3">34th percentile</td>
                  <td className="px-4 py-3">Qualified</td>
                  <td className="px-4 py-3">2x</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">Level 3 (L3)</td>
                  <td className="px-4 py-3">50th percentile (median)</td>
                  <td className="px-4 py-3">Experienced</td>
                  <td className="px-4 py-3">3x</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Level 4 (L4)</td>
                  <td className="px-4 py-3">67th percentile</td>
                  <td className="px-4 py-3">Fully competent / supervisory</td>
                  <td className="px-4 py-3">4x</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Starting with FY2027 (effective February 2026), USCIS uses a wage-weighted H1B
            lottery system. Petitions filed at higher wage levels receive proportionally
            higher selection probability — a Level 4 petition is 4 times more likely to be
            selected than a Level 1 petition. This makes worksite choice strategically
            important: filing at a lower-cost metro may allow a higher wage level filing
            for the same salary.
          </p>
        </div>

        {/* ─── How to Use This Tool ───────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            How to Choose the Best H1B Worksite
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed">
            <li>
              <strong>Set your salary</strong> — Enter the annual compensation your
              employer will pay. The map highlights metro areas where this salary exceeds
              the prevailing wage (green) versus where it falls short (red).
            </li>
            <li>
              <strong>Select your job category</strong> — Choose the SOC code that matches
              your occupation. H1B Compass covers 12 tech categories including Software
              Developer, Data Scientist, Security Engineer, and DevOps/SRE.
            </li>
            <li>
              <strong>Compare wage levels</strong> — Check whether your salary qualifies
              at L2, L3, or L4 in each metro area. Higher levels mean better lottery odds
              under the FY2027 wage-weighted system.
            </li>
            <li>
              <strong>Use the drive zone filter</strong> — If your employer requires
              on-site presence, set an origin city and maximum commute radius to find
              qualifying metros within driving distance.
            </li>
            <li>
              <strong>Factor in cost of living</strong> — Enable the rent layer to see HUD
              Fair Market Rents and calculate your net surplus (wage headroom minus annual
              rent) for a more complete comparison.
            </li>
          </ol>
          <p className="text-gray-600 text-sm">
            For a detailed strategy guide, see{" "}
            <Link href="/guide" className="text-blue-600 hover:underline">
              How to Choose Your H1B Worksite
            </Link>.
          </p>
        </div>

        {/* ─── FAQ ────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                What data does H1B Compass use?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                Prevailing wages come from the DOL Office of Foreign Labor Certification
                (OFLC) prevailing wage dataset for July 2025 through June 2026, which is
                derived from BLS OEWS survey data. Rent data comes from HUD FY2026 Fair
                Market Rents. Metro area boundaries are US Census Bureau CBSA shapefiles.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                How often is the data updated?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                The DOL publishes new prevailing wage data annually, typically effective
                July 1. H1B Compass updates its dataset each year to reflect the latest
                wage determinations. The current dataset covers the July 2025 to June 2026
                prevailing wage period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                What is the wage surplus?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                Wage surplus is the difference between your salary and the prevailing wage
                for your job category and wage level in a given metro area. A positive
                surplus means your salary exceeds the prevailing wage (qualifying for H1B).
                A negative surplus means the prevailing wage is higher than your salary,
                and the employer would need to increase compensation to file at that
                location.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                What is the FY2027 wage-weighted lottery?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                Starting with FY2027 H1B cap season, USCIS assigns lottery selection
                weights based on the wage level of the petition. Level 1 petitions receive
                a 1x base weight, Level 2 receives 2x, Level 3 receives 3x, and Level 4
                receives 4x. This means a petition filed at Level 4 is four times more
                likely to be selected than one filed at Level 1. Choosing a worksite where
                your salary qualifies at a higher wage level directly improves your lottery
                odds.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Can I change my H1B worksite after filing?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                Yes, but it requires filing an amended H1B petition with USCIS if the new
                worksite is in a different MSA with a different prevailing wage. The
                employer must also file a new Labor Condition Application (LCA) for the
                new location. This is why choosing the right worksite upfront is important.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Is this tool free?
              </h3>
              <p className="text-gray-700 leading-relaxed mt-1">
                Yes. H1B Compass is a free, open-source tool. The source code is available
                on GitHub. No account or payment is required.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Data Sources ───────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Prevailing Wages:</strong>{" "}
              U.S. Department of Labor, Office of Foreign Labor Certification (OFLC)
              — Prevailing Wage Determinations, July 2025 through June 2026
            </li>
            <li>
              <strong>Occupation Wages:</strong>{" "}
              Bureau of Labor Statistics (BLS), Occupational Employment and Wage
              Statistics (OEWS) survey
            </li>
            <li>
              <strong>Fair Market Rents:</strong>{" "}
              U.S. Department of Housing and Urban Development (HUD), FY2026 Fair
              Market Rent data
            </li>
            <li>
              <strong>Metro Area Boundaries:</strong>{" "}
              U.S. Census Bureau, Core Based Statistical Area (CBSA) shapefiles
            </li>
            <li>
              <strong>Lottery Weights:</strong>{" "}
              USCIS FY2027 H1B wage-weighted registration rule (February 2026)
            </li>
          </ul>
          <p className="text-gray-600 text-sm mt-2">
            For full methodology details, see{" "}
            <Link href="/about" className="text-blue-600 hover:underline">
              About & Methodology
            </Link>.
          </p>
        </div>

      </div>
    </section>
  );
}

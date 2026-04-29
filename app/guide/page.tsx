import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "How to Choose Your H1B Worksite — H1B Compass Guide",
  description:
    "Strategic guide to selecting the best H1B worksite. Learn how prevailing wages, wage levels, lottery multipliers, and cost of living affect your H1B petition.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "How to Choose Your H1B Worksite",
    description:
      "Strategic guide to H1B worksite selection: prevailing wages, lottery odds, cost of living, and the FY2027 wage-weighted system.",
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
      name: "How to Choose Your H1B Worksite",
      item: "https://h1b-compass.vercel.app/guide",
    },
  ],
};

export default function GuidePage() {
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
            <h1 className="text-lg font-bold text-gray-900">
              How to Choose Your H1B Worksite
            </h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

          {/* ─── Intro ────────────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Why Worksite Choice Matters for H1B
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The worksite listed on an H1B petition determines the prevailing wage the
              employer must meet. Because prevailing wages vary dramatically by
              geography — the same Software Developer role can require $80,000 in one
              metro and $120,000 in another — worksite selection directly affects whether
              a given salary qualifies, at which wage level it qualifies, and therefore
              the petition&apos;s lottery odds under the FY2027 wage-weighted system.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This guide covers the key factors to consider when choosing an H1B worksite,
              from basic prevailing wage compliance to advanced strategies using lottery
              multipliers and cost-of-living adjustments.
            </p>
          </section>

          {/* ─── Step 1: Understand Prevailing Wage ───────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Step 1: Understand What the Prevailing Wage Means
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The prevailing wage is the minimum salary the Department of Labor requires
              an employer to pay an H1B worker in a specific occupation at a specific
              location. It is designed to prevent H1B employment from adversely affecting
              US workers&apos; wages. The employer files a Labor Condition Application (LCA)
              specifying the worksite, occupation, and wage level, and must pay at least
              the corresponding prevailing wage.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Prevailing wages are published at four levels (L1 through L4), each
              corresponding to a percentile of the local wage distribution for that
              occupation. The employer selects the level that matches the position&apos;s
              requirements and the worker&apos;s qualifications.
            </p>
          </section>

          {/* ─── Step 2: Maximize Wage Level ──────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Step 2: Maximize Your Wage Level for Better Lottery Odds
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Under the FY2027 wage-weighted lottery (effective February 2026), the wage
              level determines your selection probability. A Level 4 petition is four
              times more likely to be selected than Level 1. This creates a strategic
              incentive: if your salary is $130,000, it might qualify at Level 2 in San
              Francisco but Level 4 in a lower-cost metro like Raleigh — giving you 4x
              lottery weight instead of 2x.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Use H1B Compass to compare the lottery multiplier badge across metros.
              The badge shows the highest wage level where your salary meets or exceeds
              the prevailing wage. Targeting metros where you achieve L3 or L4 can
              significantly improve your selection chances.
            </p>
          </section>

          {/* ─── Step 3: Factor in Geography ──────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Step 3: Use the Drive Zone to Find Nearby Options
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If the employer has physical offices or requires on-site work, the H1B
              worksite must be where the employee actually works. H1B Compass&apos;s drive
              zone feature lets you set an origin city and radius to identify qualifying
              metros within commuting or relocation distance.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For remote-eligible positions, the worksite is typically the employee&apos;s
              home address location. This opens up the entire map — you can choose a
              metro with favorable prevailing wages and a higher lottery multiplier
              without being constrained by employer office locations.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Tip:</strong> Many metros just outside expensive coastal cities have
              significantly lower prevailing wages. Check areas 100-200 miles from your
              employer&apos;s primary office — the wage difference can be substantial while
              remaining within reasonable commuting range.
            </div>
          </section>

          {/* ─── Step 4: Cost of Living ───────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Step 4: Compare Cost of Living with the Rent Layer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A large wage surplus means nothing if the cost of living consumes it. H1B
              Compass overlays HUD Fair Market Rent (FMR) data to calculate net surplus:
              the wage headroom remaining after accounting for annual housing costs.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For example, Metro A might have a $40,000 wage surplus but $3,000/month
              rent ($36K/year), leaving only $4K net surplus. Metro B might have a
              $20,000 wage surplus but $1,200/month rent ($14.4K/year), leaving $5.6K
              net surplus — a better financial outcome despite the smaller raw wage
              surplus.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Enable the rent layer and select your target bedroom count to sort metros
              by net surplus. This gives the most realistic picture of financial outcomes
              across locations.
            </p>
          </section>

          {/* ─── Step 5: Common Strategies ────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Common H1B Worksite Strategies
            </h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Strategy A: Maximize Lottery Odds
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Prioritize the highest wage level achievable. Filter for metros where your
              salary reaches L3 or L4. Accept potentially lower net surplus in exchange
              for 3x-4x lottery selection weight. Best for applicants in the H1B cap
              lottery who are primarily concerned with being selected.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Strategy B: Maximize Financial Surplus
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Sort by wage surplus or net surplus to find the metros where your salary
              provides the greatest financial margin. This is relevant for cap-exempt
              petitions (universities, research institutions) or when lottery odds are
              less of a concern.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4">
              Strategy C: Balance Both
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Enable the rent layer and sort by net surplus, but also check the lottery
              multiplier badge. Look for metros that offer L3+ wages with positive net
              surplus — the sweet spot of good lottery odds and reasonable cost of living.
            </p>
          </section>

          {/* ─── Important Considerations ─────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Important Considerations
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Actual work location matters:</strong> The H1B worksite must be
                where the employee actually performs work. Filing a different location
                than where work occurs can result in petition denial or revocation.
              </li>
              <li>
                <strong>Employer must have a legitimate business reason:</strong> USCIS
                may scrutinize worksites that appear chosen solely for wage arbitrage
                without a genuine business need at that location.
              </li>
              <li>
                <strong>Amended petitions for moves:</strong> Changing worksite to a
                different MSA after approval requires a new LCA and an amended H1B
                petition, which takes time and legal fees.
              </li>
              <li>
                <strong>State taxes vary:</strong> Prevailing wage and rent are not the
                only financial factors. States like Texas, Florida, and Washington have
                no state income tax, which can significantly affect take-home pay.
              </li>
              <li>
                <strong>Consult an immigration attorney:</strong> This guide provides
                general information. Individual circumstances vary. Always consult a
                qualified immigration attorney before making worksite decisions.
              </li>
            </ul>
          </section>

          {/* ─── CTA ──────────────────────────────────────────────── */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              Ready to Find Your Best Worksite?
            </h2>
            <p className="text-gray-600">
              Use the interactive map to compare prevailing wages, lottery multipliers,
              and cost of living across 380+ metro areas.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open the Wage Map
            </Link>
          </section>

        </main>
      </div>
      <Footer />
    </>
  );
}

import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import { StaticContent } from "@/components/StaticContent";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center h-dvh text-gray-400">Loading...</div>}>
        <HomePage />
      </Suspense>

      <noscript>
        <div className="max-w-3xl mx-auto px-6 py-12 text-gray-700">
          <h1 className="text-2xl font-bold mb-4">H1B Compass — H1B Prevailing Wage Map</h1>
          <p className="mb-4">
            H1B Compass is a free interactive tool for exploring DOL prevailing wages
            across 380+ US metro areas. It helps H1B visa applicants and sponsoring
            employers find optimal worksites by comparing salary against prevailing wage
            requirements.
          </p>
          <p className="mb-4">
            Features include filtering by 12 tech job categories, 4 wage levels (L1-L4),
            drive zone radius, and HUD Fair Market Rent overlay. The tool displays the
            FY2027 wage-weighted H1B lottery multipliers and supports CSV export.
          </p>
          <p>
            JavaScript is required to use the interactive map. Please enable JavaScript
            in your browser to access all features.
          </p>
        </div>
      </noscript>

      {/* Server-rendered content visible to all crawlers */}
      <StaticContent />
      <Footer />
    </>
  );
}

// Server component — NO "use client" — rendered as static HTML

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          {/* Brand */}
          <div>
            <p className="font-semibold text-gray-900">H1B Compass</p>
            <p className="text-gray-500 mt-1">
              Free interactive H1B prevailing wage map covering 380+ US metro areas.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Resources</p>
            <ul className="space-y-1.5 text-gray-500">
              <li>
                <Link href="/guide" className="hover:text-gray-700 transition-colors">
                  Worksite Selection Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-700 transition-colors">
                  About & Methodology
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/shenxingy/h1b-compass"
                  className="hover:text-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub (Open Source)
                </a>
              </li>
            </ul>
          </div>

          {/* Data */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Data Sources</p>
            <ul className="space-y-1.5 text-gray-500">
              <li>DOL OFLC Prevailing Wages (Jul 2025 — Jun 2026)</li>
              <li>BLS OEWS Wage Survey</li>
              <li>HUD FY2026 Fair Market Rents</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-4 text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
          <span>Last updated: July 2025</span>
          <span>Data period: July 2025 — June 2026</span>
          <span>
            This tool is for informational purposes only and does not constitute legal advice.
          </span>
        </div>
      </div>
    </footer>
  );
}

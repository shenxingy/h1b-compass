import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://h1b-compass.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "H1B Prevailing Wage Map — Find Your Best Worksite | H1B Compass",
  description:
    "Free interactive map of DOL prevailing wages across 380+ US metro areas. Compare H1B wage levels, calculate surplus, and find the optimal worksite for your salary.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "H1B Prevailing Wage Map — Find Your Best Worksite",
    description:
      "Free interactive map of DOL prevailing wages across 380+ US metro areas. Compare wage levels, calculate surplus, and find the best H1B worksite.",
    type: "website",
    url: BASE_URL,
    siteName: "H1B Compass",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "H1B Compass — interactive prevailing wage map covering 380+ US metro areas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "H1B Prevailing Wage Map | H1B Compass",
    description:
      "Compare DOL prevailing wages across 380+ US metro areas. Find the best H1B worksite for your salary.",
    images: ["/og.png"],
  },
  keywords: [
    "H1B prevailing wage",
    "H1B prevailing wage map",
    "H1B worksite",
    "DOL prevailing wage lookup",
    "H1B visa wage level",
    "BLS OEWS wages",
    "H1B wage surplus calculator",
    "prevailing wage by city",
  ],
  authors: [{ name: "H1B Compass" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "H1B Compass",
      url: BASE_URL,
      description:
        "Free interactive map of DOL prevailing wages across 380+ US metro areas. Helps H1B visa applicants and sponsoring employers find optimal worksites.",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Interactive choropleth wage map",
        "12 tech job categories (SOC codes)",
        "4 wage levels (L1-L4)",
        "Drive zone radius filter",
        "HUD Fair Market Rent overlay",
        "H1B lottery multiplier display",
        "CSV export",
      ],
    },
    {
      "@type": "Dataset",
      name: "DOL OFLC Prevailing Wages by Metro Area",
      description:
        "Prevailing wage data from the Department of Labor Office of Foreign Labor Certification, covering 380+ US Metropolitan Statistical Areas across 12 tech occupation codes and 4 wage levels.",
      url: BASE_URL,
      license: "https://www.usa.gov/government-copyright",
      temporalCoverage: "2025-07/2026-06",
      spatialCoverage: {
        "@type": "Place",
        name: "United States",
      },
      creator: {
        "@type": "GovernmentOrganization",
        name: "U.S. Department of Labor",
        url: "https://www.dol.gov",
      },
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        name: "CSV Export",
      },
    },
    {
      "@type": "WebSite",
      name: "H1B Compass",
      url: BASE_URL,
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What data does H1B Compass use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Prevailing wages come from the DOL Office of Foreign Labor Certification (OFLC) prevailing wage dataset for July 2025 through June 2026, which is derived from BLS OEWS survey data. Rent data comes from HUD FY2026 Fair Market Rents. Metro area boundaries are US Census Bureau CBSA shapefiles.",
          },
        },
        {
          "@type": "Question",
          name: "How often is the data updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The DOL publishes new prevailing wage data annually, typically effective July 1. H1B Compass updates its dataset each year to reflect the latest wage determinations. The current dataset covers the July 2025 to June 2026 prevailing wage period.",
          },
        },
        {
          "@type": "Question",
          name: "What is the wage surplus?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Wage surplus is the difference between your salary and the prevailing wage for your job category and wage level in a given metro area. A positive surplus means your salary exceeds the prevailing wage (qualifying for H1B). A negative surplus means the prevailing wage is higher than your salary, and the employer would need to increase compensation to file at that location.",
          },
        },
        {
          "@type": "Question",
          name: "What is the FY2027 wage-weighted lottery?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Starting with FY2027 H1B cap season, USCIS assigns lottery selection weights based on the wage level of the petition. Level 1 petitions receive a 1x base weight, Level 2 receives 2x, Level 3 receives 3x, and Level 4 receives 4x. This means a petition filed at Level 4 is four times more likely to be selected than one filed at Level 1.",
          },
        },
        {
          "@type": "Question",
          name: "Can I change my H1B worksite after filing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, but it requires filing an amended H1B petition with USCIS if the new worksite is in a different MSA with a different prevailing wage. The employer must also file a new Labor Condition Application (LCA) for the new location.",
          },
        },
        {
          "@type": "Question",
          name: "Is this tool free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. H1B Compass is a free, open-source tool. The source code is available on GitHub. No account or payment is required.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}

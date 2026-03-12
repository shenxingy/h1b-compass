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

export const metadata: Metadata = {
  title: "H1B Compass — Find Your Best Worksite",
  description:
    "Visualize DOL prevailing wages across US metro areas to find the optimal H1B worksite. Filter by job category, wage level, and drive distance.",
  openGraph: {
    title: "H1B Compass — Find Your Best Worksite",
    description:
      "Visualize DOL prevailing wages across US metro areas. Find the optimal H1B worksite for your salary.",
    type: "website",
  },
  keywords: [
    "H1B prevailing wage",
    "H1B worksite",
    "DOL prevailing wage map",
    "H1B visa",
    "BLS OEWS wages",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}

import type { MetadataRoute } from "next";

const BASE_URL = "https://h1b-compass.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date("2025-07-01"),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date("2025-07-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2025-07-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

import type { MetadataRoute } from "next";
import { wedding } from "@/data/wedding";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: wedding.site.url,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1
    }
  ];
}

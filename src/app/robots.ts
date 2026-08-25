import type { MetadataRoute } from "next";
import { wedding } from "@/data/wedding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${wedding.site.url}/sitemap.xml`
  };
}

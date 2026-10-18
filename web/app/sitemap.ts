import type { MetadataRoute } from "next";
import { ALL_PROVIDERS, SPECIALTIES } from "@/lib/rtt";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "hourly" | "monthly" | "yearly" = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "hourly"),
    page("/now", 0.9, "hourly"),
    page("/planned", 0.9),
    page("/where-to-go", 0.7, "yearly"),
    page("/right-to-choose", 0.8, "yearly"),
    page("/hospitals", 0.6),
    page("/about", 0.5, "yearly"),
    page("/accessibility", 0.3, "yearly"),
    ...SPECIALTIES.map((s) => page(`/planned/${s.slug}`, 0.7)),
    ...ALL_PROVIDERS.map((p) => page(`/hospital/${p.slug}`, 0.5)),
  ];
}

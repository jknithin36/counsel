import type { MetadataRoute } from "next";
import { attorneys } from "@/lib/content/attorneys";
import { guides } from "@/lib/content/guides";
import { practiceAreas } from "@/lib/content/practice-areas";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/consultation", priority: 0.9 },
    { path: "/practice-areas", priority: 0.9 },
    { path: "/attorneys", priority: 0.9 },
    { path: "/results", priority: 0.8 },
    { path: "/about", priority: 0.8 },
    { path: "/resources", priority: 0.8 },
    { path: "/faq", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/careers", priority: 0.4 },
    { path: "/portal-help", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/disclaimer", priority: 0.3 },
    { path: "/attorney-advertising", priority: 0.3 },
    ...practiceAreas.map((area) => ({ path: area.href, priority: 0.8 })),
    ...attorneys.map((a) => ({ path: `/attorneys/${a.slug}`, priority: 0.7 })),
    ...guides.map((g) => ({ path: `/resources/${g.slug}`, priority: 0.6 })),
  ];

  return routes.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority,
  }));
}

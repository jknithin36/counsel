/*
 * Public site origin for canonical URLs, social cards, the sitemap and
 * robots.txt. Set NEXT_PUBLIC_SITE_URL in production; on Vercel the
 * project's production domain is used when it isn't set, so a fresh
 * "Deploy" works without configuration.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl().replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${siteUrl}${path}`;

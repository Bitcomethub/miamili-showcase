import type { MetadataRoute } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * Varsayılan olarak taramaya KAPALI — bkz. layout.tsx'teki noindex notu.
 * `NEXT_PUBLIC_ALLOW_INDEXING=true` ile açılır.
 */
const indexlemeAcik = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexlemeAcik
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: indexlemeAcik ? `${siteUrl}/sitemap.xml` : undefined,
  };
}

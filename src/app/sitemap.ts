import type { MetadataRoute } from 'next';

import { tumProjeler } from '@/lib/projects';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export default function sitemap(): MetadataRoute.Sitemap {
  return tumProjeler().map((p) => ({
    url: `${siteUrl}/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 1,
  }));
}

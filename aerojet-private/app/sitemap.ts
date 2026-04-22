import { MetadataRoute } from 'next'

const BASE = 'https://aerojet.private'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['milano-londra', 'roma-dubai', 'milano-new-york']
  const now = new Date()

  return [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    ...routes.map(slug => ({
      url: `${BASE}/rotte/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/', '/booking/'] },
    ],
    sitemap: 'https://aerojet.app/sitemap.xml',
  }
}

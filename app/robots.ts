import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifegranted-adventures.co.tz'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/portal', '/account', '/book', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

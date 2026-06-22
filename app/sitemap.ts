import type { MetadataRoute } from 'next'
import { getActiveTours, getAllOperators, getAllBlogPosts } from '@/lib/supabase/queries'
import { DESTINATIONS } from '@/lib/constants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifegrantedadventures.co.tz'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, operators, posts] = await Promise.all([getActiveTours(), getAllOperators(), getAllBlogPosts()])

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/tours',
    '/operators',
    '/destinations',
    '/blog',
    '/about',
    '/for-operators',
    '/how-it-works',
    '/contact',
    '/legal/terms',
    '/legal/privacy',
    '/legal/refunds',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }))

  const tourPages: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${SITE_URL}/tours/${t.slug}`,
    lastModified: new Date(t.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const operatorPages: MetadataRoute.Sitemap = operators.map((o) => ({
    url: `${SITE_URL}/operators/${o.slug}`,
    lastModified: new Date(o.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const destinationPages: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.published_at ?? p.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...tourPages, ...operatorPages, ...destinationPages, ...blogPages]
}

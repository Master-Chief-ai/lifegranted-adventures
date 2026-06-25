import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/supabase/queries'
import { MOCK_BLOG_POSTS } from '@/lib/supabase/mock-data'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export async function generateStaticParams() {
  return MOCK_BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getAllBlogPosts()
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.featured_image,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.published_at,
    dateModified: post.published_at ?? post.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'LifeGranted Adventures',
      logo: { '@type': 'ImageObject', url: 'https://lifegranted-adventures.co.tz/logo.png' },
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lifegranted-adventures.co.tz' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://lifegranted-adventures.co.tz/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://lifegranted-adventures.co.tz/blog/${post.slug}` },
    ],
  }

  return (
    <div className="container-sm py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Badge variant="teal">{post.category}</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-navy">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">
        By {post.author} · {formatDate(post.published_at ?? post.created_at)}
      </p>

      {post.featured_image && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl">
          <Image src={post.featured_image} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <article className="prose mt-8 max-w-none text-navy/90">
        <p className="leading-relaxed">{post.body}</p>
      </article>

      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            #{tag}
          </span>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-navy">Related Articles</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="block rounded-xl border border-border bg-white p-4 shadow-card hover:shadow-card-hover">
                <p className="font-medium text-navy">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

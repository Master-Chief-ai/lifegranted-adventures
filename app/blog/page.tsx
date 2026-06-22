import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Tanzania Safari Blog',
  description: 'Guides, destination deep-dives, and trip-planning tips for traveling Tanzania.',
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const posts = await getAllBlogPosts()
  const categories = Array.from(new Set(posts.map((p) => p.category)))
  const filtered = params.category ? posts.filter((p) => p.category === params.category) : posts

  return (
    <div className="container-lg py-10">
      <h1 className="font-display text-3xl font-bold text-navy">Tanzania Safari Blog</h1>
      <p className="mt-1 text-muted">Guides, destination deep-dives, and trip-planning tips</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !params.category ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              params.category === c ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-card-hover">
            <div className="relative aspect-video">
              {post.featured_image && <Image src={post.featured_image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" />}
            </div>
            <div className="p-4">
              <Badge variant="teal">{post.category}</Badge>
              <h2 className="mt-2 font-display text-lg font-semibold text-navy">{post.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(post.published_at ?? post.created_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

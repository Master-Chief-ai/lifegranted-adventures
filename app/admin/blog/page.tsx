import Link from 'next/link'
import { getAllBlogPostsAdmin } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Blog</h1>
        <Link href="/admin/blog/new" className={cn(buttonVariants({ variant: 'gold' }))}>
          + New Post
        </Link>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-teal-light text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-navy">{post.title}</td>
                <td className="px-4 py-3 text-muted">{post.category}</td>
                <td className="px-4 py-3">
                  <Badge variant={post.is_published ? 'green' : 'gray'}>{post.is_published ? 'Published' : 'Draft'}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{post.author}</td>
                <td className="px-4 py-3 text-muted">{post.published_at ? formatDate(post.published_at) : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs">
                    <Link href={`/admin/blog/${post.id}/edit`} className="font-medium text-teal hover:underline">
                      Edit
                    </Link>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-teal hover:underline">
                      Preview ↗
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

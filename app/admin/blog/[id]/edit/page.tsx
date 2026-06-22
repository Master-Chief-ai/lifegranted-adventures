import { notFound } from 'next/navigation'
import { getBlogPostById } from '@/lib/supabase/queries'
import { BlogPostEditor } from '@/components/admin/BlogPostEditor'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getBlogPostById(id)
  if (!post) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Edit Post</h1>
      <div className="mt-6">
        <BlogPostEditor postId={post.id} initial={post} />
      </div>
    </div>
  )
}

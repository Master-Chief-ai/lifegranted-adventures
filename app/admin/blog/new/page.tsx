import { BlogPostEditor } from '@/components/admin/BlogPostEditor'

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">New Post</h1>
      <div className="mt-6">
        <BlogPostEditor />
      </div>
    </div>
  )
}

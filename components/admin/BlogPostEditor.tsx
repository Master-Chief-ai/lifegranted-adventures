'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'
import type { BlogPost } from '@/types'

const CATEGORIES = ['Guides', 'Wildlife', 'Destinations', 'Tips & Planning', 'News']
const TOOLBAR = [
  { icon: Heading2, insert: '## ' },
  { icon: Heading3, insert: '### ' },
  { icon: Bold, insert: '**bold**' },
  { icon: Italic, insert: '_italic_' },
  { icon: List, insert: '\n- ' },
  { icon: ListOrdered, insert: '\n1. ' },
  { icon: Quote, insert: '\n> ' },
]

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function BlogPostEditor({ postId, initial }: { postId?: string; initial?: BlogPost }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description ?? '')
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '')
  const [author, setAuthor] = useState(initial?.author ?? 'LifeGranted Adventures Team')
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!initial) setSlug(slugify(value))
  }

  function insertAtCursor(text: string) {
    setBody((b) => `${b}${text}`)
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return
    setFeaturedImage(await readFileAsDataURL(file))
  }

  async function save(status: 'draft' | 'published' | 'scheduled') {
    setSaving(true)
    try {
      const payload = {
        title,
        slug: slug || slugify(title),
        body,
        excerpt,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        featured_image: featuredImage,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        author,
        is_published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : status === 'scheduled' ? scheduledAt : null,
      }

      const url = postId ? `/api/admin/blog/${postId}` : '/api/admin/blog'
      const res = await fetch(url, {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'published' ? 'Post published!' : status === 'scheduled' ? 'Post scheduled' : 'Saved as draft')
      router.push('/admin/blog')
    } catch {
      toast.error('Could not save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Input label="Title" placeholder="Your post title" value={title} onChange={(e) => handleTitleChange(e.target.value)} />
        <div>
          <Input label="Slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          <p className="mt-1 text-xs text-muted">/blog/{slug || 'your-post-slug'}</p>
        </div>
        <div className="rounded-xl border border-border bg-white">
          <div className="flex gap-1 border-b border-border p-2">
            {TOOLBAR.map((t, i) => (
              <button key={i} type="button" onClick={() => insertAtCursor(t.insert)} className="rounded p-1.5 text-navy hover:bg-teal-light">
                <t.icon size={15} />
              </button>
            ))}
          </div>
          <textarea
            rows={18}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post…"
            className="w-full resize-none rounded-b-xl p-4 text-sm text-navy focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-display text-sm font-semibold text-navy">Publish</h3>
            <div className="mt-3 space-y-2">
              <Button className="w-full" variant="secondary" disabled={saving} onClick={() => save('draft')}>
                Save as Draft
              </Button>
              <Button className="w-full" disabled={saving} onClick={() => save('published')}>
                Publish Now
              </Button>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-9 w-full rounded-lg border border-border px-2 text-sm" />
              <Button className="w-full" variant="ghost" disabled={saving || !scheduledAt} onClick={() => save('scheduled')}>
                Schedule
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-display text-sm font-semibold text-navy">Meta</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-navy">Excerpt</label>
                <textarea rows={2} maxLength={160} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full rounded-lg border border-border p-2 text-sm" />
                <p className="mt-1 text-xs text-muted">{excerpt.length}/160</p>
              </div>
              <Input label="SEO Title" maxLength={60} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              <div>
                <label className="mb-1 block text-xs font-medium text-navy">SEO Description</label>
                <textarea rows={2} maxLength={155} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full rounded-lg border border-border p-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-display text-sm font-semibold text-navy">Featured Image</h3>
            {featuredImage && (
              <div className="relative mt-2 aspect-video overflow-hidden rounded-lg">
                <Image src={featuredImage} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <label className="mt-2 block cursor-pointer rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-navy hover:border-teal">
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
            </label>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-display text-sm font-semibold text-navy">Categorise</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-navy">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 w-full rounded-lg border border-border px-2 text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="flex flex-wrap gap-1">
                {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="font-display text-sm font-semibold text-navy">Author</h3>
            <Input className="mt-2" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostEditor

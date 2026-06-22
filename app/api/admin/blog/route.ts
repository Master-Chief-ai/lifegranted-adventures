import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getAllBlogPostsAdmin } from '@/lib/supabase/queries'

export async function GET() {
  const posts = await getAllBlogPostsAdmin()
  return NextResponse.json({ data: posts })
}

export async function POST(request: Request) {
  const payload = await request.json()

  if (!adminSupabase) {
    return NextResponse.json({ success: true, mock: true, post: { id: `mock-post-${Date.now()}`, ...payload } })
  }

  try {
    const { data, error } = await adminSupabase.from('blog_posts').insert(payload).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error('Failed to create blog post', error)
    return NextResponse.json({ success: false, error: 'Could not create post' }, { status: 400 })
  }
}

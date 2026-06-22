import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getBlogPostById } from '@/lib/supabase/queries'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getBlogPostById(id)
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  return NextResponse.json({ data: post })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await request.json()

  if (!adminSupabase) {
    return NextResponse.json({ success: true, mock: true, post: { id, ...payload } })
  }

  try {
    const { data, error } = await adminSupabase.from('blog_posts').update(payload).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error('Failed to update blog post', error)
    return NextResponse.json({ success: false, error: 'Could not update post' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!adminSupabase) {
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blog post', error)
    return NextResponse.json({ success: false, error: 'Could not delete post' }, { status: 400 })
  }
}

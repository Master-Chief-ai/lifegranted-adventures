import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getUser } from '@/lib/auth'

const schema = z.object({ tourId: z.string() })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tourId } = schema.parse(body)

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const supabase = await createClient()
    await supabase.from('wishlist').insert({ tourist_id: user.id, tour_id: tourId })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { tourId } = schema.parse(body)

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const supabase = await createClient()
    await supabase.from('wishlist').delete().eq('tourist_id', user.id).eq('tour_id', tourId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

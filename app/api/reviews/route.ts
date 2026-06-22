import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getUser } from '@/lib/auth'

const schema = z.object({
  bookingRef: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = schema.parse(payload)

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const supabase = await createClient()
    const { data: booking } = await supabase.from('bookings').select('*').eq('booking_ref', data.bookingRef).single()
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })

    await supabase.from('reviews').insert({
      booking_id: booking.id,
      tour_id: booking.tour_id,
      operator_id: booking.operator_id,
      tourist_id: user.id,
      tourist_name: booking.tourist_name,
      tourist_country: booking.tourist_nationality,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid review data' }, { status: 400 })
  }
}

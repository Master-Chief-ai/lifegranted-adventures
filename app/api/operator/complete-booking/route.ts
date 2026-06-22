import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({ bookingRef: z.string() })

export async function POST(request: Request) {
  try {
    const { bookingRef } = schema.parse(await request.json())

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true, bookingRef, booking_status: 'completed' })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: 'completed', tour_completed_at: new Date().toISOString() })
      .eq('booking_ref', bookingRef)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, booking: data })
  } catch (error) {
    console.error('Failed to complete booking', error)
    return NextResponse.json({ success: false, error: 'Could not complete booking' }, { status: 400 })
  }
}

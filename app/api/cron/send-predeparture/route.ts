import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getAllBookingsAdmin } from '@/lib/supabase/queries'
import { sendPreDeparture } from '@/lib/email'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await getAllBookingsAdmin()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const targetDate = sevenDaysFromNow.toISOString().split('T')[0]

  const toNotify = bookings.filter((b) => b.travel_date === targetDate && b.booking_status === 'confirmed')

  let processed = 0
  for (const booking of toNotify) {
    await sendPreDeparture(booking, booking.tour, booking.operator)
    processed += 1
    if (adminSupabase) {
      try {
        await adminSupabase.from('bookings').update({ review_reminder_sent: false }).eq('id', booking.id)
      } catch {
        // best-effort
      }
    }
  }

  return NextResponse.json({ processed })
}

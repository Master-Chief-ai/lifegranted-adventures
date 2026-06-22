import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getAllBookingsAdmin } from '@/lib/supabase/queries'
import { sendReviewRequest } from '@/lib/email'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await getAllBookingsAdmin()
  const threeDaysAgo = Date.now() - 3 * 86400000

  const toNotify = bookings.filter(
    (b) => b.booking_status === 'completed' && !b.review_reminder_sent && new Date(b.travel_date).getTime() <= threeDaysAgo
  )

  let processed = 0
  for (const booking of toNotify) {
    await sendReviewRequest(booking, booking.tour, booking.operator.business_name)
    processed += 1
    if (adminSupabase) {
      try {
        await adminSupabase.from('bookings').update({ review_reminder_sent: true }).eq('id', booking.id)
      } catch {
        // best-effort
      }
    }
  }

  return NextResponse.json({ processed })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { flutterwaveEnabled } from '@/lib/flutterwave'
import { adminSupabase } from '@/lib/supabase/admin'
import { getBookingByRef } from '@/lib/supabase/queries'

const schema = z.object({ amount: z.number(), reason: z.string().min(1) })

export async function POST(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const { amount, reason } = schema.parse(await request.json())

  const booking = await getBookingByRef(ref)
  if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })

  if (flutterwaveEnabled && booking.flutterwave_tx_ref) {
    try {
      await fetch(`https://api.flutterwave.com/v3/transactions/${booking.flutterwave_tx_ref}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })
    } catch (error) {
      console.error('Flutterwave refund failed', error)
    }
  } else {
    console.log(`[MOCK REFUND] ${ref}: $${amount} — ${reason}`)
  }

  if (adminSupabase) {
    try {
      await adminSupabase.from('bookings').update({ payment_status: 'refunded' }).eq('booking_ref', ref)
    } catch (error) {
      console.error('Failed to update booking after refund', error)
    }
  }

  return NextResponse.json({ success: true })
}

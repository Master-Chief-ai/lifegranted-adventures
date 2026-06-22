import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

export async function POST(request: Request) {
  if (!secretKey || secretKey.includes('placeholder')) {
    return NextResponse.json({ received: true })
  }

  const signature = request.headers.get('verif-hash')
  if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  try {
    const payload = await request.json()
    if (payload.event === 'charge.completed' && payload.data?.status === 'successful' && isSupabaseConfigured()) {
      const supabase = await createClient()
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', booking_status: 'confirmed' })
        .eq('flutterwave_tx_ref', payload.data.tx_ref)
    }
  } catch (error) {
    console.error('Flutterwave webhook handling failed', error)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

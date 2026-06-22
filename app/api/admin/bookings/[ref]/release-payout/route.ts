import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params

  if (!adminSupabase) {
    console.log(`[MOCK PAYOUT RELEASE] ${ref}`)
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase
      .from('bookings')
      .update({ payout_released: true, payout_released_at: new Date().toISOString() })
      .eq('booking_ref', ref)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to release payout', error)
    return NextResponse.json({ success: false, error: 'Could not release payout' }, { status: 400 })
  }
}

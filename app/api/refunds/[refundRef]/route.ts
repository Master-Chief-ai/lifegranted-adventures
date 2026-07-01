import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

export async function GET(_request: Request, { params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*, bookings(booking_ref, total_usd, travel_date, group_size, tourist_name, tourist_email, tours(title, slug)), operators(business_name, email, whatsapp)')
      .eq('reference_code', refundRef)
      .single()

    if (error || !data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ recoveryRef: string }> }) {
  const { recoveryRef } = await params

  try {
    if (!adminSupabase) {
      return NextResponse.json({ notice: null }, { status: 200 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: notice } = await adminSupabase
      .from('recovery_notices')
      .select('*, bookings(booking_ref, total_usd, tours(title, start_date)), refund_requests(refund_ref, reason_category, tourist_statement, approved_amount_usd)')
      .eq('reference_code', recoveryRef)
      .single()

    return NextResponse.json({ notice: notice ?? null })
  } catch (error) {
    return NextResponse.json({ notice: null })
  }
}

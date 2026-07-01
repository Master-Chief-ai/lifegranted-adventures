import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { sendRefundDecision } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  try {
    const { decisionSummary, adminId } = await req.json()
    if (!decisionSummary) {
      return NextResponse.json({ error: 'decisionSummary required' }, { status: 400 })
    }

    if (!adminSupabase) return NextResponse.json({ success: true })

    const { data: refund } = await adminSupabase
      .from('refund_requests')
      .update({
        status: 'rejected',
        decision_summary: decisionSummary,
        decided_at: new Date().toISOString(),
        decided_by: adminId ?? null,
      })
      .eq('refund_ref', refundRef)
      .select('bookings(tourist_email, tourist_name)')
      .single()

    const touristEmail = (refund as any)?.bookings?.tourist_email ?? ''
    const touristName = (refund as any)?.bookings?.tourist_name ?? 'Traveller'
    await sendRefundDecision(touristEmail, touristName, refundRef, false, undefined, decisionSummary)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

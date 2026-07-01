import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { sendOperatorDisputeNotification } from '@/lib/email'
import type { RefundReason } from '@/types/refunds'

export async function POST(_request: Request, { params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  if (!isSupabaseConfigured() || !adminSupabase) {
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { data: refund } = await adminSupabase
      .from('refund_requests')
      .select('*, bookings(booking_ref, total_usd, travel_date, group_size, tourist_name, tourist_email, tours(title)), operators(business_name, email, whatsapp)')
      .eq('reference_code', refundRef)
      .single()

    if (!refund) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const operator = refund.operators as { business_name: string; email: string | null } | null
    const booking = refund.bookings as { booking_ref: string; total_usd: number; travel_date: string; group_size: number; tourist_name: string; tourist_email: string } | null
    const tour = (booking as unknown as { tours?: { title: string } })?.tours

    const deadline = refund.operator_response_deadline
      ? new Date(refund.operator_response_deadline).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        })
      : '72 hours from submission'

    await sendOperatorDisputeNotification({
      touristName: booking?.tourist_name ?? 'Tourist',
      touristEmail: booking?.tourist_email ?? '',
      operatorEmail: operator?.email ?? null,
      operatorName: operator?.business_name ?? 'Operator',
      refundRef,
      bookingRef: booking?.booking_ref ?? '',
      tourTitle: tour?.title ?? 'Tour',
      travelDate: booking?.travel_date ?? '',
      groupSize: booking?.group_size ?? 1,
      amountPaid: booking?.total_usd ?? 0,
      reasonCategory: refund.reason_category as RefundReason,
      touristStatement: refund.reason_detail,
      operatorDeadline: deadline,
    })

    await adminSupabase
      .from('refund_requests')
      .update({ operator_notified_at: new Date().toISOString(), status: 'operator_notified' })
      .eq('reference_code', refundRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notify operator failed', error)
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

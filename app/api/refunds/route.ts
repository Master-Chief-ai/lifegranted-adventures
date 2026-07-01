import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { sendRefundSubmittedEmails } from '@/lib/email'
import type { RefundReason } from '@/types/refunds'

const schema = z.object({
  bookingRef: z.string(),
  reasonCategory: z.string(),
  reasonDetail: z.string().min(10),
  evidence: z.array(z.string()).default([]),
  qualityIssues: z.array(z.string()).default([]),
  incidentDate: z.string().optional(),
})

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const data = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, operators(business_name, email, whatsapp), tours(title, slug)')
      .eq('booking_ref', data.bookingRef)
      .single()

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    if (booking.tourist_id !== user.id && booking.tourist_email !== user.email) {
      return NextResponse.json({ success: false, error: 'Not your booking' }, { status: 403 })
    }

    // Check no existing open request
    const { data: existing } = await supabase
      .from('refund_requests')
      .select('id, status')
      .eq('booking_id', booking.id)
      .neq('status', 'rejected')
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'An open refund request already exists for this booking' }, { status: 409 })
    }

    const operatorDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000)
    const operatorDeadlineStr = operatorDeadline.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })

    const { data: inserted, error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        booking_id: booking.id,
        tourist_id: user.id,
        operator_id: booking.operator_id,
        reason_category: data.reasonCategory as RefundReason,
        reason_detail: data.reasonDetail,
        tourist_evidence: data.evidence,
        operator_response_deadline: operatorDeadline.toISOString(),
        status: 'submitted',
      })
      .select()
      .single()

    if (insertError || !inserted) {
      console.error('Failed to insert refund request', insertError)
      return NextResponse.json({ success: false, error: 'Failed to create refund request' }, { status: 500 })
    }

    // Calculate policy eligibility via Supabase function
    if (adminSupabase) {
      const { data: eligibility } = await adminSupabase.rpc('calculate_refund_eligibility', {
        p_booking_id: booking.id,
        p_reason: data.reasonCategory,
      })

      if (eligibility?.[0]) {
        await adminSupabase
          .from('refund_requests')
          .update({
            policy_eligible_refund_pct: eligibility[0].eligible_pct,
            policy_eligible_refund_usd: eligibility[0].eligible_usd,
            policy_tier: eligibility[0].tier,
            status: 'operator_notified',
            operator_notified_at: new Date().toISOString(),
          })
          .eq('id', inserted.id)
      }
    }

    const operator = booking.operators as { business_name: string; email: string | null; whatsapp: string | null } | null
    const tour = booking.tours as { title: string } | null

    await sendRefundSubmittedEmails({
      touristName: booking.tourist_name,
      touristEmail: booking.tourist_email,
      operatorEmail: operator?.email ?? null,
      operatorName: operator?.business_name ?? 'Operator',
      refundRef: inserted.reference_code,
      bookingRef: booking.booking_ref,
      tourTitle: tour?.title ?? 'Safari Tour',
      travelDate: booking.travel_date,
      groupSize: booking.group_size,
      amountPaid: booking.total_usd,
      reasonCategory: data.reasonCategory as RefundReason,
      touristStatement: data.reasonDetail,
      operatorDeadline: operatorDeadlineStr,
    })

    return NextResponse.json({ success: true, refundRef: inserted.reference_code })
  } catch (error) {
    console.error('Refund request creation failed', error)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

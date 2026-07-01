import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { payTouristFromFund } from '@/lib/guarantee-fund'
import { initiateRecovery } from '@/lib/recovery'
import { sendRefundDecision, sendRefundPaid, sendRecoveryNotice } from '@/lib/email'
import { formatDate } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  try {
    const { approvedAmount, decisionSummary, adminId } = await req.json()
    if (!approvedAmount || !decisionSummary) {
      return NextResponse.json({ error: 'approvedAmount and decisionSummary required' }, { status: 400 })
    }

    if (!adminSupabase) return NextResponse.json({ success: true })

    // Load the refund request with full context
    const { data: refund, error } = await adminSupabase
      .from('refund_requests')
      .select('*, bookings(id, booking_ref, total_usd, tourist_email, tourist_name, operator_id, tours(title, start_date)), operators(id, business_name, email)')
      .eq('refund_ref', refundRef)
      .single()

    if (error || !refund) return NextResponse.json({ error: 'Refund not found' }, { status: 404 })

    // Mark approved
    await adminSupabase
      .from('refund_requests')
      .update({
        status: 'approved',
        approved_amount_usd: approvedAmount,
        decision_summary: decisionSummary,
        decided_at: new Date().toISOString(),
        decided_by: adminId ?? null,
      })
      .eq('refund_ref', refundRef)

    // Pay tourist from Guarantee Fund
    await payTouristFromFund(refund.booking_id, approvedAmount, adminId ?? 'admin', `Refund ${refundRef} approved`)

    // Mark booking as refunded
    await adminSupabase
      .from('bookings')
      .update({ status: 'refunded' })
      .eq('id', refund.booking_id)

    // Update refund to 'paid' status
    await adminSupabase
      .from('refund_requests')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('refund_ref', refundRef)

    // Initiate operator recovery
    let recovery = null
    if (refund.bookings?.operator_id) {
      recovery = await initiateRecovery({
        refundRequestId: refund.id,
        operatorId: refund.bookings.operator_id,
        bookingId: refund.booking_id,
        totalAmount: approvedAmount,
        adminId: adminId ?? 'admin',
        reason: decisionSummary,
      })
    }

    // Email: tourist decision + paid
    const touristEmail = refund.bookings?.tourist_email ?? ''
    const touristName = refund.bookings?.tourist_name ?? 'Traveller'
    await sendRefundDecision(touristEmail, touristName, refundRef, true, approvedAmount, decisionSummary)
    await sendRefundPaid(touristEmail, touristName, refundRef, approvedAmount, 'original payment method')

    // Email: operator recovery notice
    if (recovery && refund.operators?.email) {
      await sendRecoveryNotice({
        operatorEmail: refund.operators.email,
        operatorName: refund.operators.business_name,
        recoveryRef: (recovery as any).reference_code,
        refundRef,
        bookingRef: refund.bookings?.booking_ref ?? '',
        tourTitle: refund.bookings?.tours?.title ?? '',
        travelDate: formatDate(refund.bookings?.tours?.start_date),
        touristName,
        totalRefunded: approvedAmount,
        securityDepositApplied: (recovery as any).security_deposit_applied ?? 0,
        remainingToRecover: (recovery as any).remaining_to_recover ?? approvedAmount,
        appealDeadline: new Date((recovery as any).appeal_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      })
    }

    return NextResponse.json({ success: true, recoveryRef: (recovery as any)?.reference_code })
  } catch (error) {
    console.error('Refund approve error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

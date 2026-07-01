import { adminSupabase } from '@/lib/supabase/admin'

export type RecoveryStatus =
  | 'notice_sent'
  | 'acknowledged'
  | 'appealing'
  | 'appeal_upheld'
  | 'appeal_rejected'
  | 'recovery_scheduled'
  | 'partially_recovered'
  | 'fully_recovered'
  | 'written_off'
  | 'security_deposit_used'

export interface RecoveryNotice {
  id: string
  reference_code: string
  refund_request_id: string
  operator_id: string
  booking_id: string
  total_recovery_amount: number
  security_deposit_applied: number
  remaining_to_recover: number
  total_recovered_so_far: number
  status: RecoveryStatus
  notice_sent_at: string
  operator_acknowledged_at: string | null
  appeal_deadline: string
  appeal_submitted_at: string | null
  appeal_statement: string | null
  appeal_evidence: string[]
  appeal_decision: string | null
  appeal_decided_at: string | null
  recovery_schedule: { payout_date: string; amount: number; status: 'scheduled' | 'applied' }[]
  notes: string | null
  created_at: string
  updated_at: string
}

export async function initiateRecovery(params: {
  refundRequestId: string
  operatorId: string
  bookingId: string
  totalAmount: number
  adminId: string
  reason: string
}): Promise<RecoveryNotice | null> {
  if (!adminSupabase) return null

  const { data: operator } = await adminSupabase
    .from('operators')
    .select('security_deposit_balance, business_name')
    .eq('id', params.operatorId)
    .single()

  let securityDepositApplied = 0
  let remainingToRecover = params.totalAmount

  if (operator && (operator.security_deposit_balance ?? 0) > 0) {
    securityDepositApplied = Math.min(operator.security_deposit_balance, params.totalAmount)
    remainingToRecover = params.totalAmount - securityDepositApplied
    await adminSupabase
      .from('operators')
      .update({ security_deposit_balance: operator.security_deposit_balance - securityDepositApplied })
      .eq('id', params.operatorId)
  }

  const appealDeadline = new Date()
  appealDeadline.setDate(appealDeadline.getDate() + 5)

  const { data: notice } = await adminSupabase
    .from('recovery_notices')
    .insert({
      refund_request_id: params.refundRequestId,
      operator_id: params.operatorId,
      booking_id: params.bookingId,
      total_recovery_amount: params.totalAmount,
      security_deposit_applied: securityDepositApplied,
      remaining_to_recover: remainingToRecover,
      status: securityDepositApplied >= params.totalAmount ? 'security_deposit_used' : 'notice_sent',
      appeal_deadline: appealDeadline.toISOString(),
      created_by: params.adminId,
      notes: params.reason,
    })
    .select()
    .single()

  return notice as RecoveryNotice | null
}

export async function applyPayoutDeduction(recoveryNoticeId: string, bookingId: string, amount: number) {
  if (!adminSupabase) throw new Error('Database not configured')

  const { data: notice } = await adminSupabase.from('recovery_notices').select('*').eq('id', recoveryNoticeId).single()
  if (!notice) throw new Error('Recovery notice not found')

  const newTotalRecovered = (notice.total_recovered_so_far ?? 0) + amount
  const newRemaining = (notice.remaining_to_recover ?? 0) - amount
  const isFullyRecovered = newRemaining <= 0

  await adminSupabase.from('recovery_deductions').insert({
    recovery_notice_id: recoveryNoticeId,
    booking_id: bookingId,
    amount_deducted: amount,
  })

  await adminSupabase
    .from('recovery_notices')
    .update({
      total_recovered_so_far: newTotalRecovered,
      remaining_to_recover: Math.max(0, newRemaining),
      status: isFullyRecovered ? 'fully_recovered' : 'partially_recovered',
    })
    .eq('id', recoveryNoticeId)

  return { isFullyRecovered, remaining: Math.max(0, newRemaining) }
}

export async function getOperatorRecoveryNotices(operatorId: string): Promise<RecoveryNotice[]> {
  if (!adminSupabase) return []
  const { data } = await adminSupabase
    .from('recovery_notices')
    .select('*, refund_requests(reference_code, reason_category), bookings(booking_ref, travel_date, total_usd, tours(title))')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })
  return (data as unknown as RecoveryNotice[]) ?? []
}

export async function getAllRecoveryNotices() {
  if (!adminSupabase) return []
  const { data } = await adminSupabase
    .from('recovery_notices')
    .select('*, operators(business_name), bookings(booking_ref, total_usd, tours(title)), refund_requests(reference_code)')
    .order('created_at', { ascending: false })
  return data ?? []
}

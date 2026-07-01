export type RefundStatus =
  | 'submitted'
  | 'operator_notified'
  | 'under_review'
  | 'approved_full'
  | 'approved_partial'
  | 'rejected'
  | 'paid'
  | 'recovery_initiated'
  | 'recovery_complete'
  | 'closed'

export type RefundReason =
  | 'operator_cancelled'
  | 'tour_not_as_described'
  | 'quality_failure'
  | 'operator_no_show'
  | 'force_majeure'
  | 'tourist_cancelled_30_plus'
  | 'tourist_cancelled_15_29'
  | 'tourist_cancelled_under_14'
  | 'other'

export interface RefundRequest {
  id: string
  reference_code: string
  booking_id: string
  tourist_id: string | null
  operator_id: string

  reason_category: RefundReason
  reason_detail: string
  tourist_evidence: string[]
  tourist_submitted_at: string

  operator_response: string | null
  operator_evidence: string[]
  operator_response_deadline: string | null
  operator_responded_at: string | null
  operator_notified_at: string | null

  policy_eligible_refund_pct: number | null
  policy_eligible_refund_usd: number | null
  policy_tier: string | null

  status: RefundStatus
  admin_decision: string | null
  admin_decision_notes: string | null
  approved_refund_amount: number
  admin_id: string | null
  decision_made_at: string | null

  paid_at: string | null
  payment_method: string | null
  payment_reference: string | null

  created_at: string
  updated_at: string
}

export interface RefundRequestWithDetails extends RefundRequest {
  booking?: {
    booking_ref: string
    total_usd: number
    travel_date: string
    group_size: number
    tourist_name: string
    tourist_email: string
  } | null
  operator?: {
    business_name: string
    email: string | null
    whatsapp: string | null
  } | null
  tour?: {
    title: string
    slug: string
  } | null
}

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  operator_cancelled: 'Operator cancelled the booking',
  tour_not_as_described: 'Tour significantly different from listing',
  quality_failure: 'Tour quality was unacceptable',
  operator_no_show: 'Operator did not appear',
  force_majeure: 'Force majeure / Government restriction / Park closure',
  tourist_cancelled_30_plus: 'I need to cancel (30+ days notice)',
  tourist_cancelled_15_29: 'I need to cancel (15–29 days notice)',
  tourist_cancelled_under_14: 'I need to cancel (under 14 days notice)',
  other: 'Other',
}

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  submitted: 'Submitted — Notifying Operator',
  operator_notified: 'Awaiting Operator Response',
  under_review: 'Under Review by Our Team',
  approved_full: 'Approved — Payment Processing',
  approved_partial: 'Partially Approved — Payment Processing',
  rejected: 'Request Rejected',
  paid: 'Refund Paid',
  recovery_initiated: 'Recovery Initiated',
  recovery_complete: 'Recovery Complete',
  closed: 'Case Closed',
}

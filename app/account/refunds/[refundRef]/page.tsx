import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RefundStatus } from '@/types/refunds'
import { REFUND_REASON_LABELS, REFUND_STATUS_LABELS } from '@/types/refunds'

export const metadata: Metadata = { title: 'Refund Request Status' }

const STATUS_STYLE: Record<RefundStatus, { className: string }> = {
  submitted: { className: 'bg-[#FEF3C7] text-[#92400E]' },
  operator_notified: { className: 'bg-[#DBEAFE] text-[#1D4ED8]' },
  under_review: { className: 'bg-[#EDE9FE] text-[#6D28D9]' },
  approved_full: { className: 'bg-teal-light text-teal' },
  approved_partial: { className: 'bg-teal-light text-teal' },
  rejected: { className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  paid: { className: 'bg-teal-light text-teal' },
  recovery_initiated: { className: 'bg-[#DBEAFE] text-[#1D4ED8]' },
  recovery_complete: { className: 'bg-teal-light text-teal' },
  closed: { className: 'bg-[#F3F4F6] text-[#374151]' },
}

const STATUS_EXPLANATION: Record<RefundStatus, (refund: Record<string, unknown>) => string> = {
  submitted: (r) => `We have received your request and are notifying the operator. They have until ${r.operator_response_deadline ? formatDate(r.operator_response_deadline as string) : 'soon'} to respond. You will receive an email when they respond or when the deadline passes.`,
  operator_notified: (r) => `The operator has been notified of your request. They have until ${r.operator_response_deadline ? formatDate(r.operator_response_deadline as string) : 'soon'} to submit their response.`,
  under_review: () => 'Our team is reviewing the evidence from both sides. We aim to make a decision within 5 business days of receiving the operator\'s response.',
  approved_full: (r) => `Your refund of ${formatCurrency(r.approved_refund_amount as number)} has been approved. Payment will be processed within 5 business days.`,
  approved_partial: (r) => `A partial refund of ${formatCurrency(r.approved_refund_amount as number)} has been approved. Payment will be processed within 5 business days.`,
  rejected: () => 'After reviewing the evidence from both sides, we were unable to approve a refund in this case. If you have travel insurance, your insurer may cover this. If you believe new evidence changes the outcome, contact us within 14 days.',
  paid: (r) => `Your refund of ${formatCurrency(r.approved_refund_amount as number)} has been sent to your original payment method. Please allow 3–5 business days to appear in your account.`,
  recovery_initiated: () => 'The refund has been paid and we have initiated recovery proceedings with the operator.',
  recovery_complete: () => 'This case is fully resolved. The refund was paid and operator recovery is complete.',
  closed: () => 'This case has been closed. No further action is required.',
}

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Refund request submitted', field: 'tourist_submitted_at' },
  { key: 'operator_notified', label: 'Operator notified', field: 'operator_notified_at' },
  { key: 'operator_responded', label: 'Operator response received', field: 'operator_responded_at', deadline_field: 'operator_response_deadline' },
  { key: 'under_review', label: 'Under admin review', field: 'decision_made_at' },
  { key: 'decision', label: 'Decision made', field: 'decision_made_at' },
  { key: 'paid', label: 'Refund paid', field: 'paid_at' },
]

const STATUS_ORDER: RefundStatus[] = ['submitted', 'operator_notified', 'under_review', 'approved_full', 'approved_partial', 'rejected', 'paid', 'recovery_initiated', 'recovery_complete', 'closed']

export default async function RefundStatusPage({ params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  if (!adminSupabase) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Card className="p-6 text-center">
          <p className="text-muted">Refund tracking requires a live database connection.</p>
          <p className="mt-2 text-sm text-muted">Reference: <span className="font-mono font-bold text-navy">{refundRef}</span></p>
          <p className="mt-1 text-sm text-muted">WhatsApp us: +255 000 000 000</p>
        </Card>
      </div>
    )
  }

  const { data: refund } = await adminSupabase
    .from('refund_requests')
    .select('*, bookings(booking_ref, total_usd, travel_date, group_size, tourist_name, tours(title, slug)), operators(business_name, whatsapp)')
    .eq('reference_code', refundRef)
    .single()

  if (!refund) notFound()

  const booking = refund.bookings as { booking_ref: string; total_usd: number; travel_date: string; group_size: number; tourist_name: string; tours?: { title: string } } | null
  const operator = refund.operators as { business_name: string; whatsapp: string | null } | null
  const statusLabel = REFUND_STATUS_LABELS[refund.status as RefundStatus]
  const statusStyle = STATUS_STYLE[refund.status as RefundStatus]
  const explanation = STATUS_EXPLANATION[refund.status as RefundStatus]?.(refund as unknown as Record<string, unknown>)

  return (
    <div className="mx-auto max-w-2xl py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Refund Reference</p>
            <p className="font-mono text-2xl font-bold text-navy">{refundRef}</p>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusStyle.className}`}>
            {statusLabel}
          </span>
        </div>
        {booking && (
          <p className="mt-2 text-sm text-muted">
            Booking {booking.booking_ref} · {booking.tours?.title} · {formatDate(booking.travel_date)}
          </p>
        )}
      </div>

      {/* Current status explanation */}
      <Card className="border-teal/30 bg-teal-light/20 p-5">
        <p className="text-sm font-medium text-teal">What&apos;s happening now</p>
        <p className="mt-1 text-navy">{explanation}</p>
      </Card>

      {/* Progress timeline */}
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-navy">Progress</h2>
        <div className="relative space-y-6 pl-6">
          <div className="absolute left-2 top-2 h-[calc(100%-8px)] w-0.5 bg-border" />
          {TIMELINE_STEPS.map((step) => {
            const dateVal = refund[step.field as keyof typeof refund] as string | null
            const deadlineVal = step.deadline_field ? refund[step.deadline_field as keyof typeof refund] as string | null : null
            const done = !!dateVal
            return (
              <div key={step.key} className="relative flex items-start gap-3">
                <div className={`absolute -left-4 mt-0.5 h-4 w-4 rounded-full border-2 ${done ? 'border-teal bg-teal' : 'border-border bg-white'}`} />
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-navy' : 'text-muted'}`}>{step.label}</p>
                  {done ? (
                    <p className="text-xs text-muted">{formatDate(dateVal!)}</p>
                  ) : deadlineVal ? (
                    <p className="text-xs text-muted">Awaiting response by {formatDate(deadlineVal)}</p>
                  ) : (
                    <p className="text-xs text-muted">Pending</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Your request */}
      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-navy">Your Request</h2>
        <p className="text-sm text-muted">Reason: <span className="text-navy">{REFUND_REASON_LABELS[refund.reason_category as keyof typeof REFUND_REASON_LABELS]}</span></p>
        <p className="mt-2 text-sm text-navy">{refund.reason_detail}</p>
      </Card>

      {/* Operator response */}
      {refund.operator_response && (
        <Card className="p-5">
          <h2 className="mb-2 font-display text-base font-semibold text-navy">The operator&apos;s response to your request</h2>
          <p className="text-sm text-muted">Submitted {refund.operator_responded_at ? formatDate(refund.operator_responded_at) : ''}</p>
          <p className="mt-3 text-sm text-navy">{refund.operator_response}</p>
        </Card>
      )}

      {/* Admin decision */}
      {refund.admin_decision && (
        <Card className={`p-5 ${refund.approved_refund_amount > 0 ? 'border-teal/30' : 'border-[#B91C1C]/30'}`}>
          <h2 className="mb-2 font-display text-base font-semibold text-navy">Decision</h2>
          {refund.approved_refund_amount > 0 && (
            <p className="text-lg font-bold text-teal">Refund amount: {formatCurrency(refund.approved_refund_amount)}</p>
          )}
          <p className="mt-1 text-sm text-navy">{refund.admin_decision}</p>
        </Card>
      )}

      {/* Contact support */}
      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-semibold text-navy">Need help?</h2>
        <p className="text-sm text-muted">Always quote your reference number for fastest support.</p>
        <a
          href={`https://wa.me/255000000000?text=Hi+LifeGranted+Adventures,+I+need+help+with+dispute+${refundRef}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
        >
          WhatsApp Our Team
        </a>
      </Card>

      <Link href="/account/bookings" className="block text-center text-sm text-muted hover:text-navy">
        ← Back to My Bookings
      </Link>
    </div>
  )
}

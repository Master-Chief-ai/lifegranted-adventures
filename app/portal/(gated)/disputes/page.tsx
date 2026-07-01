import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentOperator } from '@/lib/operator-auth'
import { adminSupabase } from '@/lib/supabase/admin'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RefundStatus } from '@/types/refunds'
import { REFUND_REASON_LABELS } from '@/types/refunds'

export const metadata: Metadata = { title: 'Disputes — Operator Portal' }

const OPEN_STATUSES: RefundStatus[] = ['submitted', 'operator_notified', 'under_review']

function DeadlineCountdown({ deadline }: { deadline: string | null }) {
  if (!deadline) return null
  const hoursLeft = Math.floor((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60))
  const isUrgent = hoursLeft < 24 && hoursLeft > 0
  const isPast = hoursLeft <= 0
  return (
    <span className={`text-xs font-medium ${isPast ? 'text-[#B91C1C]' : isUrgent ? 'text-[#D97706]' : 'text-muted'}`}>
      {isPast ? 'Deadline passed' : isUrgent ? `⚠️ ${hoursLeft}h remaining` : `Due ${formatDate(deadline)}`}
    </span>
  )
}

export default async function OperatorDisputesPage() {
  const operator = await getCurrentOperator()

  let openDisputes: unknown[] = []
  let resolvedDisputes: unknown[] = []

  if (adminSupabase) {
    const { data } = await adminSupabase
      .from('refund_requests')
      .select('*, bookings(booking_ref, total_usd, travel_date, group_size, tourist_name, tours(title))')
      .eq('operator_id', operator.id)
      .order('created_at', { ascending: false })

    if (data) {
      openDisputes = data.filter((d) => OPEN_STATUSES.includes(d.status as RefundStatus))
      resolvedDisputes = data.filter((d) => !OPEN_STATUSES.includes(d.status as RefundStatus))
    }
  }

  type DisputeRow = {
    reference_code: string
    status: RefundStatus
    reason_category: string
    created_at: string
    operator_response_deadline: string | null
    bookings: { booking_ref: string; total_usd: number; travel_date: string; group_size: number; tourist_name: string; tours?: { title: string } } | null
  }

  function DisputeCard({ d, showActions }: { d: DisputeRow; showActions: boolean }) {
    const booking = d.bookings
    const STATUS_BADGE: Record<string, string> = {
      submitted: 'bg-[#FEF3C7] text-[#92400E]',
      operator_notified: 'bg-[#DBEAFE] text-[#1D4ED8]',
      under_review: 'bg-[#EDE9FE] text-[#6D28D9]',
      approved_full: 'bg-teal-light text-teal',
      approved_partial: 'bg-teal-light text-teal',
      rejected: 'bg-[#FEE2E2] text-[#B91C1C]',
      paid: 'bg-teal-light text-teal',
      closed: 'bg-[#F3F4F6] text-[#374151]',
    }
    return (
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted">{d.reference_code}</p>
            <p className="font-semibold text-navy">{booking?.tours?.title ?? 'Tour'}</p>
            <p className="text-sm text-muted">
              {booking?.tourist_name} · {booking?.group_size ?? 1} guests · {booking?.travel_date ? formatDate(booking.travel_date) : ''}
            </p>
            <p className="mt-1 text-sm text-navy">{REFUND_REASON_LABELS[d.reason_category as keyof typeof REFUND_REASON_LABELS] ?? d.reason_category}</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_BADGE[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {d.status.replace(/_/g, ' ')}
            </span>
            {booking?.total_usd && <p className="text-sm font-medium text-navy">{formatCurrency(booking.total_usd)}</p>}
            <DeadlineCountdown deadline={d.operator_response_deadline} />
          </div>
        </div>
        {showActions && d.status === 'operator_notified' && (
          <div className="mt-3 border-t border-border pt-3">
            <Link
              href={`/portal/disputes/${d.reference_code}`}
              className="inline-flex h-9 items-center rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal/90"
            >
              Respond Now →
            </Link>
          </div>
        )}
        {!showActions && (
          <div className="mt-2 border-t border-border pt-2">
            <Link href={`/portal/disputes/${d.reference_code}`} className="text-xs text-teal hover:underline">
              View details →
            </Link>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Disputes</h1>
        <p className="mt-1 text-sm text-muted">Refund requests submitted for your tours</p>
      </div>

      {openDisputes.length === 0 && resolvedDisputes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted">No disputes on your account.</p>
        </Card>
      )}

      {openDisputes.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-navy">Open Disputes ({openDisputes.length})</h2>
          <div className="space-y-3">
            {openDisputes.map((d) => <DisputeCard key={(d as DisputeRow).reference_code} d={d as DisputeRow} showActions />)}
          </div>
        </div>
      )}

      {resolvedDisputes.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-navy">Resolved ({resolvedDisputes.length})</h2>
          <div className="space-y-3">
            {resolvedDisputes.map((d) => <DisputeCard key={(d as DisputeRow).reference_code} d={d as DisputeRow} showActions={false} />)}
          </div>
        </div>
      )}
    </div>
  )
}

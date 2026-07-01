'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { REFUND_REASON_LABELS } from '@/types/refunds'
import type { RefundReason } from '@/types/refunds'

export default function OperatorDisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const refundRef = params.refundRef as string

  const [refund, setRefund] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptance, setAcceptance] = useState<'full' | 'partial' | 'dispute' | ''>('')
  const [partialAmount, setPartialAmount] = useState('')
  const [statement, setStatement] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/refunds/${refundRef}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setRefund(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refundRef])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptance || statement.length < 20 || !confirmed) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/refunds/${refundRef}/operator-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptance,
          partialAmount: acceptance === 'partial' ? parseFloat(partialAmount) : undefined,
          responseStatement: statement,
          evidence: [],
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      toast.error('Could not submit response. Please try again or contact support.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><p className="text-muted">Loading…</p></div>

  if (!refund) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted">Dispute not found or you do not have access.</p>
        <Button className="mt-4" onClick={() => router.push('/portal/disputes')}>Back to Disputes</Button>
      </Card>
    )
  }

  const booking = refund.bookings as { booking_ref: string; total_usd: number; travel_date: string; group_size: number; tourist_name: string; tours?: { title: string } } | null
  const deadline = refund.operator_response_deadline as string | null
  const hoursLeft = deadline ? Math.floor((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60)) : null
  const isUrgent = hoursLeft !== null && hoursLeft < 24 && hoursLeft > 0
  const isPast = hoursLeft !== null && hoursLeft <= 0
  const alreadyResponded = !!refund.operator_responded_at

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Card className="p-8 text-center">
          <div className="text-5xl">✓</div>
          <h2 className="mt-4 font-display text-xl font-bold text-navy">Response Submitted</h2>
          <p className="mt-2 text-muted">
            Our team will review both sides and make a decision within 5 business days.
            You will be notified by email and in this portal.
          </p>
          <Button className="mt-6" onClick={() => router.push('/portal/disputes')}>Back to Disputes</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Dispute {refundRef}</h1>
        <p className="mt-1 text-sm text-muted">Submitted {formatDate(refund.created_at as string)}</p>
      </div>

      {/* Tourist claim */}
      <Card className="border-teal/30 p-5">
        <h2 className="font-display text-base font-semibold text-navy">The tourist&apos;s claim</h2>
        <p className="mt-1 text-xs text-muted">A refund request has been submitted for the following booking:</p>

        <div className="mt-3 space-y-1.5 text-sm">
          {booking && (
            <>
              <div className="flex justify-between"><span className="text-muted">Tour</span><span className="text-navy">{booking.tours?.title}</span></div>
              <div className="flex justify-between"><span className="text-muted">Booking ref</span><span className="text-navy">{booking.booking_ref}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tourist</span><span className="text-navy">{booking.tourist_name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Travel date</span><span className="text-navy">{formatDate(booking.travel_date)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Group size</span><span className="text-navy">{booking.group_size} guests</span></div>
              <div className="flex justify-between"><span className="text-muted">Amount paid</span><span className="font-semibold text-navy">{formatCurrency(booking.total_usd)}</span></div>
            </>
          )}
          <hr className="border-border" />
          <div className="flex justify-between"><span className="text-muted">Reason</span><span className="text-navy">{REFUND_REASON_LABELS[refund.reason_category as RefundReason]}</span></div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted mb-1">Tourist&apos;s statement:</p>
          <div className="rounded-lg bg-cream p-3 text-sm text-navy italic">&ldquo;{refund.reason_detail as string}&rdquo;</div>
        </div>
      </Card>

      {/* Deadline notice */}
      {!alreadyResponded && (
        <div className={`rounded-xl p-4 ${isPast ? 'bg-[#FEE2E2]' : isUrgent ? 'bg-[#FEF3C7]' : 'bg-[#FEF3C7]'}`}>
          <p className={`font-bold ${isPast || isUrgent ? 'text-[#92400E]' : 'text-[#92400E]'}`}>
            {isPast ? '⚠️ Response deadline has passed' : `Your response is due by: ${deadline ? formatDate(deadline) : 'soon'}`}
            {isUrgent && ` (${hoursLeft} hours remaining)`}
          </p>
          <p className="mt-1 text-sm text-[#92400E]">
            If you do not respond by this deadline, our team will make a decision based on the available information only.
            This does not mean the refund is automatically approved — it means you lose the opportunity to present your case.
          </p>
        </div>
      )}

      {alreadyResponded ? (
        <Card className="border-teal/30 bg-teal-light/20 p-5">
          <p className="font-semibold text-teal">Response submitted {formatDate(refund.operator_responded_at as string)}</p>
          <p className="mt-1 text-sm text-teal/80">Our team will review both sides and make a decision within 5 business days.</p>
          <div className="mt-3 text-sm text-navy">{refund.operator_response as string}</div>
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold text-navy">Your response</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Do you accept or dispute this claim? <span className="text-[#B91C1C]">*</span></p>
              {[
                { value: 'full', label: 'I accept the claim — I agree a refund is appropriate' },
                { value: 'partial', label: 'I partially accept — I believe a partial refund is fair' },
                { value: 'dispute', label: 'I dispute this claim — I delivered the tour as described' },
              ].map((opt) => (
                <label key={opt.value} className="mb-2 flex cursor-pointer items-start gap-2 text-sm text-navy">
                  <input type="radio" name="acceptance" value={opt.value} className="mt-0.5 accent-teal" onChange={() => setAcceptance(opt.value as typeof acceptance)} />
                  {opt.label}
                </label>
              ))}
            </div>

            {acceptance === 'partial' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-navy">Amount you consider fair (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-navy">
                Your response statement <span className="text-[#B91C1C]">*</span>
              </label>
              <p className="mb-2 text-xs text-muted">Please describe what happened from your perspective. Be factual and specific. This statement may be shared with the tourist.</p>
              <textarea
                rows={6}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Be specific. Include dates, times, what was provided, and any relevant context."
                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal focus:outline-none"
                required
              />
              <p className={`mt-1 text-right text-xs ${statement.length < 20 ? 'text-[#B91C1C]' : 'text-muted'}`}>
                {statement.length} characters (minimum 20)
              </p>
            </div>

            <div className="rounded-lg border border-border bg-cream p-3">
              <p className="text-xs text-muted">
                📎 <strong>Evidence upload</strong> — Email supporting files (photos, logs, communications) to{' '}
                <a href="mailto:disputes@lifegranted-adventures.co.tz" className="text-teal underline">
                  disputes@lifegranted-adventures.co.tz
                </a>{' '}
                quoting <strong>{refundRef}</strong>.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-0.5 accent-teal" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              I confirm this response is accurate and truthful. I understand that providing false information is a breach of my Operator Agreement and may result in suspension.
            </label>

            <Button
              type="submit"
              className="w-full"
              disabled={!acceptance || statement.length < 20 || !confirmed || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Response'}
            </Button>

            <p className="text-center text-xs text-muted">
              Need more time?{' '}
              <a
                href={`https://wa.me/255000000000?text=Hi+LifeGranted+Adventures,+I+need+more+time+to+respond+to+dispute+${refundRef}.+The+reason+is:+`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline"
              >
                Contact support on WhatsApp
              </a>
            </p>
          </form>
        </Card>
      )}
    </div>
  )
}

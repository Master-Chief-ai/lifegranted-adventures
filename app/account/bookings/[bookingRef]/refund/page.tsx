'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BookingWithDetails } from '@/types'

type RefundReason = 'operator_cancelled' | 'tour_not_as_described' | 'quality_failure' | 'operator_no_show' | 'force_majeure' | 'tourist_cancelled_30_plus' | 'tourist_cancelled_15_29' | 'tourist_cancelled_under_14' | 'other'

const QUALITY_ISSUES = [
  'Tour route or itinerary not followed',
  'Wildlife sightings grossly misrepresented',
  'Accommodation not as described',
  'Guide did not arrive or was unqualified',
  'Vehicle was unsafe or unsuitable',
  'Group size exceeded what was booked',
  'Other',
]

function daysBetween(date: string) {
  return Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getCancellationReason(travelDate: string): { reason: RefundReason; label: string; badge: string; badgeVariant: 'teal' | 'gold' | 'red' } {
  const days = daysBetween(travelDate)
  if (days >= 30) return { reason: 'tourist_cancelled_30_plus', label: 'You qualify for a 100% refund', badge: 'FULL REFUND', badgeVariant: 'teal' }
  if (days >= 15) return { reason: 'tourist_cancelled_15_29', label: 'You qualify for a 50% refund', badge: '50% REFUND', badgeVariant: 'gold' }
  return { reason: 'tourist_cancelled_under_14', label: 'Under our cancellation policy, this booking is non-refundable. If you have travel insurance, please claim through your insurer.', badge: 'NON-REFUNDABLE', badgeVariant: 'red' }
}

const REASONS = (travelDate: string) => {
  const cancel = getCancellationReason(travelDate)
  return [
    { id: 'operator_cancelled' as RefundReason, label: 'The operator cancelled my booking', info: 'You qualify for a 100% refund under our guarantee', badge: 'FULL REFUND', badgeVariant: 'teal' as const },
    { id: 'tour_not_as_described' as RefundReason, label: 'The tour was significantly different from the listing', info: 'Our team will review the evidence and determine the refund', badge: 'REVIEWED BY ADMIN', badgeVariant: 'gold' as const },
    { id: 'quality_failure' as RefundReason, label: 'The tour quality was unacceptable', info: 'Our team will review both sides and determine the outcome', badge: 'REVIEWED BY ADMIN', badgeVariant: 'gold' as const },
    { id: cancel.reason, label: 'I need to cancel my booking', info: cancel.label, badge: cancel.badge, badgeVariant: cancel.badgeVariant },
    { id: 'force_majeure' as RefundReason, label: 'Force majeure / Government restriction / Park closure', info: 'You qualify for an 80% refund or full credit', badge: '80% REFUND OR FULL CREDIT', badgeVariant: 'teal' as const },
    { id: 'operator_no_show' as RefundReason, label: 'The operator did not appear', info: 'You qualify for a 100% refund under our guarantee', badge: 'FULL REFUND', badgeVariant: 'teal' as const },
  ]
}

export default function RefundRequestPage() {
  const router = useRouter()
  const params = useParams()
  const bookingRef = params.bookingRef as string

  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [step, setStep] = useState(1)
  const [selectedReason, setSelectedReason] = useState<RefundReason | null>(null)
  const [description, setDescription] = useState('')
  const [qualityIssues, setQualityIssues] = useState<string[]>([])
  const [incidentDate, setIncidentDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    fetch(`/api/booking/by-ref/${bookingRef}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.booking) setBooking(d.booking)
      })
      .catch(() => {})
  }, [bookingRef])

  const reasons = booking ? REASONS(booking.travel_date) : []
  const selectedReasonObj = reasons.find((r) => r.id === selectedReason)
  const isQualityIssue = selectedReason === 'quality_failure' || selectedReason === 'tour_not_as_described'

  function toggleQualityIssue(issue: string) {
    setQualityIssues((prev) => prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue])
  }

  async function handleSubmit() {
    if (!selectedReason || !description || !agreed) return
    setSubmitting(true)
    try {
      const detail = isQualityIssue && qualityIssues.length > 0
        ? `${description}\n\nSpecific issues: ${qualityIssues.join(', ')}`
        : description

      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          reasonCategory: selectedReason,
          reasonDetail: detail,
          evidence: [],
          qualityIssues,
          incidentDate: incidentDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed')
      router.push(`/account/refunds/${data.refundRef}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!booking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">Loading booking…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Request a Refund</h1>
        <p className="mt-1 text-sm text-muted">Booking {booking.booking_ref} · {booking.tour?.title}</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-teal' : 'bg-border'}`} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-navy">What is your refund request about?</h2>
          <div className="mt-4 space-y-3">
            {reasons.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                  selectedReason === r.id ? 'border-teal bg-teal-light/30' : 'border-border hover:border-teal/40'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  className="mt-0.5 accent-teal"
                  checked={selectedReason === r.id}
                  onChange={() => setSelectedReason(r.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-navy">{r.label}</p>
                  <p className="mt-0.5 text-sm text-muted">{r.info}</p>
                  <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.badgeVariant === 'teal' ? 'bg-teal-light text-teal' :
                    r.badgeVariant === 'gold' ? 'bg-gold-light text-gold-dark' :
                    'bg-[#FEE2E2] text-[#B91C1C]'
                  }`}>
                    {r.badge}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            disabled={!selectedReason}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-navy">Tell us what happened</h2>

          {isQualityIssue && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-navy">What specific issues occurred? (select all that apply)</p>
              <div className="space-y-2">
                {QUALITY_ISSUES.map((issue) => (
                  <label key={issue} className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={qualityIssues.includes(issue)}
                      onChange={() => toggleQualityIssue(issue)}
                    />
                    {issue}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Please describe exactly what happened
              <span className="ml-1 text-[#B91C1C]">*</span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Be as specific as possible. Include dates, times, names, and specific incidents."
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal focus:outline-none"
            />
            <p className={`mt-1 text-right text-xs ${description.length < 50 ? 'text-[#B91C1C]' : 'text-muted'}`}>
              {description.length} characters {description.length < 50 && '(minimum 50)'}
            </p>
          </div>

          {isQualityIssue && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-navy">Date of incident</label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal focus:outline-none"
              />
            </div>
          )}

          <div className="mt-4 rounded-lg border border-border bg-cream p-3">
            <p className="text-xs text-muted">
              📎 <strong>Evidence upload</strong> — You can email photos, screenshots, and documents to{' '}
              <a href="mailto:disputes@lifegranted-adventures.co.tz" className="text-teal underline">
                disputes@lifegranted-adventures.co.tz
              </a>{' '}
              quoting your booking reference <strong>{bookingRef}</strong>. Include this with your submission.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button
              className="flex-1"
              disabled={description.length < 50}
              onClick={() => setStep(3)}
            >
              Continue to Review
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-navy">Review and confirm</h2>

          <div className="mt-4 space-y-3 rounded-lg border border-border bg-cream p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Booking reference</span>
              <span className="font-medium text-navy">{booking.booking_ref}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tour</span>
              <span className="font-medium text-navy">{booking.tour?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Travel date</span>
              <span className="font-medium text-navy">{formatDate(booking.travel_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Amount paid</span>
              <span className="font-medium text-navy">{formatCurrency(booking.total_usd)}</span>
            </div>
            <hr className="border-border" />
            <div>
              <span className="text-muted">Reason</span>
              <p className="mt-0.5 font-medium text-navy">{selectedReasonObj?.label}</p>
            </div>
            <div>
              <span className="text-muted">Your description</span>
              <p className="mt-0.5 text-navy">{description.length > 200 ? description.slice(0, 200) + '…' : description}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Expected outcome</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                selectedReasonObj?.badgeVariant === 'teal' ? 'bg-teal-light text-teal' :
                selectedReasonObj?.badgeVariant === 'gold' ? 'bg-gold-light text-gold-dark' :
                'bg-[#FEE2E2] text-[#B91C1C]'
              }`}>
                {selectedReasonObj?.badge}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal/30 bg-teal-light/20 p-4 text-sm text-teal">
            <p className="font-semibold">By submitting this request you agree that:</p>
            <ul className="mt-2 space-y-1 text-teal/80">
              <li>• All information provided is accurate and truthful</li>
              <li>• You grant LifeGranted Adventures permission to share relevant details with the operator to obtain their response</li>
              <li>• You accept the platform&apos;s decision as final and binding</li>
              <li>• The operator will have 72 hours to respond before a decision is made</li>
            </ul>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-navy">
            <input type="checkbox" className="accent-teal" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I have read and agree to the above terms
          </label>

          <div className="mt-6 space-y-2">
            <Button
              className="w-full"
              variant="gold"
              disabled={!agreed || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit Refund Request'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/account/bookings')}>
              Cancel — go back to bookings
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

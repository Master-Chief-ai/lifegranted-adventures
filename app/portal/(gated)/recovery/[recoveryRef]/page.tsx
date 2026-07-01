'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface RecoveryNotice {
  id: string
  reference_code: string
  refund_request_id: string
  status: string
  total_recovery_amount: number
  security_deposit_applied: number
  remaining_to_recover: number
  total_recovered_so_far: number
  appeal_deadline: string
  appeal_statement: string | null
  created_at: string
  notes: string | null
  bookings: {
    booking_ref: string
    total_usd: number
    tours: { title: string; start_date: string }
  } | null
  refund_requests: {
    refund_ref: string
    reason_category: string
    tourist_statement: string
    approved_amount_usd: number
  } | null
}

const STATUS_LABEL: Record<string, string> = {
  notice_sent: 'Notice Sent',
  acknowledged: 'Acknowledged',
  appealing: 'Appeal Under Review',
  appeal_upheld: 'Appeal Upheld',
  appeal_rejected: 'Appeal Rejected',
  recovery_scheduled: 'Recovery Scheduled',
  partially_recovered: 'Partially Recovered',
  fully_recovered: 'Fully Recovered',
  written_off: 'Written Off',
  security_deposit_used: 'Deposit Applied',
}

const STATUS_COLOR: Record<string, string> = {
  notice_sent: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  appealing: 'bg-purple-100 text-purple-700',
  appeal_upheld: 'bg-green-100 text-green-700',
  appeal_rejected: 'bg-orange-100 text-orange-700',
  recovery_scheduled: 'bg-blue-100 text-blue-700',
  partially_recovered: 'bg-cyan-100 text-cyan-700',
  fully_recovered: 'bg-green-100 text-green-700',
  written_off: 'bg-gray-100 text-gray-600',
  security_deposit_used: 'bg-teal-100 text-teal-700',
}

export default function RecoveryDetailPage() {
  const { recoveryRef } = useParams<{ recoveryRef: string }>()
  const searchParams = useSearchParams()
  const showAppeal = searchParams.get('action') === 'appeal'

  const [notice, setNotice] = useState<RecoveryNotice | null>(null)
  const [loading, setLoading] = useState(true)
  const [appealText, setAppealText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [confirmedAck, setConfirmedAck] = useState(false)
  const [showAppealForm, setShowAppealForm] = useState(showAppeal)

  useEffect(() => {
    fetch(`/api/recovery/${recoveryRef}`)
      .then(r => r.json())
      .then(d => setNotice(d.notice))
      .finally(() => setLoading(false))
  }, [recoveryRef])

  const acknowledge = async () => {
    setSubmitting(true)
    await fetch(`/api/recovery/${recoveryRef}/acknowledge`, { method: 'POST' })
    setNotice(n => n ? { ...n, status: 'acknowledged' } : n)
    setSubmitting(false)
  }

  const submitAppeal = async () => {
    if (appealText.trim().length < 50) return
    setSubmitting(true)
    const res = await fetch(`/api/recovery/${recoveryRef}/appeal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement: appealText }),
    })
    if (res.ok) {
      setSubmitted(true)
      setNotice(n => n ? { ...n, status: 'appealing' } : n)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-8 h-8 border-4 border-[#006B6B] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  if (!notice) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-[#5A6B7A]">Recovery notice not found.</p>
    </div>
  )

  const appealDeadline = new Date(notice.appeal_deadline)
  const now = new Date()
  const canAppeal = notice.status === 'notice_sent' || notice.status === 'acknowledged'
  const appealOpen = canAppeal && now < appealDeadline
  const hoursLeft = Math.floor((appealDeadline.getTime() - now.getTime()) / 3600000)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-xs font-mono text-[#5A6B7A] uppercase tracking-wider">Recovery Notice</p>
          <h1 className="text-2xl font-bold text-[#0C1829] font-mono">{notice.reference_code}</h1>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR[notice.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[notice.status] ?? notice.status}
        </span>
      </div>

      {/* 1. What happened */}
      <section className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-[#0C1829] mb-3">1. What happened</h2>
        <p className="text-[#5A6B7A] text-sm">
          A tourist who booked one of your tours submitted a refund request. After review, the platform approved the refund and the
          Guarantee Fund paid the tourist on your behalf. This notice documents the recovery process.
        </p>
        {notice.refund_requests && (
          <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 text-sm">
            <p className="text-[#5A6B7A]">Refund reference: <span className="font-mono font-medium text-[#0C1829]">{notice.refund_requests.refund_ref}</span></p>
            <p className="text-[#5A6B7A] mt-1">Tourist&apos;s statement: <em>&ldquo;{notice.refund_requests.tourist_statement}&rdquo;</em></p>
          </div>
        )}
      </section>

      {/* 2. The booking */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-[#0C1829] mb-3">2. The booking</h2>
        {notice.bookings && (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-[#5A6B7A]">Booking ref</dt>
            <dd className="font-mono font-medium text-[#0C1829]">{notice.bookings.booking_ref}</dd>
            <dt className="text-[#5A6B7A]">Tour</dt>
            <dd className="text-[#0C1829]">{notice.bookings.tours?.title}</dd>
            <dt className="text-[#5A6B7A]">Travel date</dt>
            <dd className="text-[#0C1829]">{notice.bookings.tours?.start_date ? new Date(notice.bookings.tours.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd>
          </dl>
        )}
      </section>

      {/* 3. Recovery amounts */}
      <section className="bg-white rounded-xl border-2 border-[#006B6B] p-5 mb-4">
        <h2 className="font-semibold text-[#0C1829] mb-3">3. Recovery breakdown</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-[#5A6B7A]">Total refund issued</dt>
            <dd className="font-medium">${Number(notice.total_recovery_amount).toFixed(2)}</dd>
          </div>
          {Number(notice.security_deposit_applied) > 0 && (
            <div className="flex justify-between">
              <dt className="text-[#5A6B7A]">Applied from security deposit</dt>
              <dd className="font-medium text-green-600">− ${Number(notice.security_deposit_applied).toFixed(2)}</dd>
            </div>
          )}
          {Number(notice.total_recovered_so_far) > 0 && (
            <div className="flex justify-between">
              <dt className="text-[#5A6B7A]">Already recovered (deducted from payouts)</dt>
              <dd className="font-medium text-green-600">− ${Number(notice.total_recovered_so_far).toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <dt className="font-semibold text-[#0C1829]">Remaining to recover</dt>
            <dd className="text-lg font-bold text-red-600">${Number(notice.remaining_to_recover).toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      {/* 4. How recovery works */}
      <section className="bg-[#E6F4F4] rounded-xl p-5 mb-4">
        <h2 className="font-semibold text-[#006B6B] mb-2">4. How recovery works</h2>
        <p className="text-sm text-[#0C1829]">
          Recovery happens automatically from your future platform payouts. We will never contact your bank or take action against any
          existing accounts or assets. You do not need to send any money — deductions happen transparently when your tours are booked.
        </p>
      </section>

      {/* 5. Admin notes (if any) */}
      {notice.notes && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-[#0C1829] mb-2">5. Platform notes</h2>
          <p className="text-sm text-[#5A6B7A]">{notice.notes}</p>
        </section>
      )}

      {/* 6. Your right to appeal */}
      <section className="border-2 border-[#C9A84C] rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-[#92400E] mb-2">6. Your right to appeal</h2>

        {notice.status === 'appeal_upheld' && (
          <div className="bg-green-50 rounded-lg p-4 text-green-700 text-sm">
            <p className="font-semibold">Your appeal was upheld.</p>
            <p className="mt-1">This recovery notice has been cancelled. No further deductions will be made.</p>
          </div>
        )}

        {notice.status === 'appealing' && !submitted && (
          <div className="bg-purple-50 rounded-lg p-4 text-purple-700 text-sm">
            <p className="font-semibold">Your appeal is under review.</p>
            <p className="mt-1">Our team will review and respond within 5 business days. Recovery is paused in the meantime.</p>
            {notice.appeal_statement && (
              <div className="mt-3 border-t border-purple-200 pt-3">
                <p className="font-medium mb-1">Your statement:</p>
                <p className="italic">&ldquo;{notice.appeal_statement}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div className="bg-green-50 rounded-lg p-4 text-green-700 text-sm">
            <p className="font-semibold">Appeal submitted.</p>
            <p className="mt-1">We have received your appeal and will respond within 5 business days. Recovery is paused.</p>
          </div>
        )}

        {appealOpen && !showAppealForm && !submitted && notice.status !== 'appealing' && (
          <div>
            <p className="text-sm text-[#0C1829] mb-2">
              You have until <strong>{appealDeadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> to appeal
              {hoursLeft < 48 && <span className="text-red-600 font-semibold"> ({hoursLeft}h remaining)</span>}.
            </p>
            <button
              onClick={() => setShowAppealForm(true)}
              className="mt-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8973c]"
            >
              Submit an Appeal
            </button>
          </div>
        )}

        {appealOpen && showAppealForm && !submitted && (
          <div>
            <p className="text-sm text-[#5A6B7A] mb-3">
              Explain why you believe the platform&apos;s refund decision was incorrect. Include as much detail as possible — you have one opportunity to appeal.
            </p>
            <textarea
              value={appealText}
              onChange={e => setAppealText(e.target.value)}
              rows={5}
              placeholder="Describe your side of events, any service delivery evidence, or reasons you believe the refund was unjustified..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B6B] outline-none"
            />
            <p className="text-xs text-[#5A6B7A] mt-1">{appealText.length} characters (min 50)</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={submitAppeal}
                disabled={submitting || appealText.trim().length < 50}
                className="px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Appeal'}
              </button>
              <button onClick={() => setShowAppealForm(false)} className="px-4 py-2 text-sm text-[#5A6B7A] hover:underline">Cancel</button>
            </div>
          </div>
        )}

        {!appealOpen && !['appealing', 'appeal_upheld', 'appeal_rejected'].includes(notice.status) && (
          <p className="text-sm text-[#5A6B7A]">The appeal window has closed. Recovery will proceed from future payouts.</p>
        )}
      </section>

      {/* Acknowledge */}
      {notice.status === 'notice_sent' && !confirmedAck && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-[#5A6B7A] mb-3">
            Acknowledging this notice confirms you have read it. It does not mean you accept responsibility or waive your right to appeal.
          </p>
          <button
            onClick={async () => { await acknowledge(); setConfirmedAck(true) }}
            disabled={submitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            {submitting ? 'Saving…' : 'I Acknowledge This Notice'}
          </button>
        </div>
      )}
    </div>
  )
}

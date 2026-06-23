'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock, ShieldCheck, MessageCircle, CheckCircle2, CreditCard, Smartphone } from 'lucide-react'
import { useBookingContext } from '@/components/booking/BookingContext'
import { getBookingDraft, type BookingDraft } from '@/lib/booking-state'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calculateFees } from '@/lib/flutterwave'

type PaymentMethod = 'card' | 'mpesa' | 'airtel' | 'tigo'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Credit / Debit Card (Visa, Mastercard)' },
  { value: 'mpesa', label: 'M-Pesa (Vodacom Tanzania)' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'tigo', label: 'Tigo Pesa' },
]

export default function BookingPaymentPage() {
  const { tour } = useBookingContext()
  const params = useParams<{ tourSlug: string }>()
  const router = useRouter()
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [waitingForPhone, setWaitingForPhone] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  useEffect(() => {
    // Hydrating one-time from sessionStorage on mount — not available during SSR.
    const d = getBookingDraft(params.tourSlug)
    if (!d.date || !d.touristEmail) {
      router.replace(`/book/${params.tourSlug}/dates`)
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(d)
    setName(d.touristName)
    setPhone(d.touristWhatsapp)
  }, [params.tourSlug, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') === 'payment_failed') {
      toast.error('Payment failed or was cancelled. Please try again.')
    }
  }, [])

  useEffect(() => {
    if (!waitingForPhone) return
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(tick)
  }, [waitingForPhone])

  if (!draft) return null

  const fees = calculateFees(draft.tourTotal, method)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const isMobileMoney = method !== 'card'
    if (isMobileMoney) setWaitingForPhone(true)

    try {
      const res = await fetch('/api/booking/create-flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourSlug: params.tourSlug,
          travelDate: draft!.date,
          groupSize: draft!.guests,
          addons: draft!.addons,
          touristName: name,
          touristEmail: draft!.touristEmail,
          touristWhatsapp: phone,
          touristNationality: draft!.touristNationality,
          specialRequests: draft!.specialOccasion,
          dietaryRequirements: draft!.dietaryRequirements,
          medicalNotes: draft!.medicalNotes,
          paymentMethod: method,
          tourTotal: fees.tourTotal,
          bookingFee: fees.bookingFee,
          grandTotal: fees.grandTotal,
        }),
      })
      if (!res.ok) throw new Error('Booking failed')
      const result = await res.json()

      if (result.redirectUrl) {
        // Real Flutterwave card checkout — redirect to hosted payment page.
        // eslint-disable-next-line react-hooks/immutability -- runs inside a submit handler, not render
        window.location.href = result.redirectUrl
        return
      }

      if (!result.bookingRef && isMobileMoney) {
        // Real mobile money charge initiated — wait for the user to approve on their phone,
        // then the webhook/callback will confirm. Mock mode skips straight to confirmed below.
        await new Promise((resolve) => setTimeout(resolve, 3000))
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      router.push(`/book/${params.tourSlug}/confirmed?ref=${result.bookingRef ?? result.txRef}`)
    } catch {
      toast.error('Payment failed. Please try again.')
      setLoading(false)
      setWaitingForPhone(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy">Payment</h2>
      <p className="mt-1 text-sm text-muted">Secure payment powered by Flutterwave</p>

      <div className="mt-4 rounded-xl border border-border bg-white p-5">
        <p className="font-semibold text-navy">{tour.title}</p>
        <p className="text-sm text-muted">
          {formatDate(draft.date!)} · {draft.guests} guests
        </p>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Tour total</span>
            <span className="text-navy">{formatCurrency(fees.tourTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Booking fee</span>
            <span className="text-navy">{formatCurrency(fees.bookingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 text-lg font-bold">
            <span className="text-navy">Total due</span>
            <span className="text-gold-dark">{formatCurrency(fees.grandTotal)}</span>
          </div>
        </div>
      </div>

      {waitingForPhone ? (
        <div className="mt-6 rounded-lg bg-teal-light p-6 text-center">
          <Spinner size="md" className="mx-auto" />
          <p className="mt-2 text-sm font-medium text-teal">Check your phone for a payment prompt</p>
          <p className="mt-1 text-xs text-muted">
            Waiting for payment confirmation… ({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')})
          </p>
        </div>
      ) : (
        <form onSubmit={handlePay} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Name on Card / Account Holder</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Phone Number</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
            <input
              disabled
              value={draft.touristEmail}
              className="h-11 w-full rounded-lg border border-border bg-gray-50 px-3 text-sm text-muted"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Payment Method</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                    method === m.value ? 'border-teal bg-teal-light text-teal' : 'border-border text-navy'
                  }`}
                >
                  <input type="radio" name="paymentMethod" checked={method === m.value} onChange={() => setMethod(m.value)} className="accent-teal" />
                  {m.value === 'card' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {method === 'card' && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Card Number</label>
                <input
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Expiry</label>
                  <input
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">CVV</label>
                  <input
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                  />
                </div>
              </div>
              <div className="flex gap-2 text-xs font-medium text-muted">
                <span className="rounded border border-border px-2 py-1">VISA</span>
                <span className="rounded border border-border px-2 py-1">Mastercard</span>
              </div>
              <p className="text-xs text-muted">Your card is charged in USD. Your bank may apply currency conversion fees.</p>
            </div>
          )}

          {method !== 'card' && (
            <p className="text-xs text-muted">You will receive a push notification on your phone. Approve the payment to confirm your booking.</p>
          )}

          <Button type="submit" variant="gold" className="flex w-full items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" /> Processing…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay {formatCurrency(fees.grandTotal)} Securely
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Lock size={14} /> 256-bit SSL encryption
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} /> Secure escrow
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={14} /> TTB licensed operators
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={14} /> 24/7 support
        </span>
      </div>
    </div>
  )
}

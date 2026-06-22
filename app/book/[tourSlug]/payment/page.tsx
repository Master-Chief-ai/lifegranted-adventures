'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { Lock, ShieldCheck, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useBookingContext } from '@/components/booking/BookingContext'
import { getBookingDraft, type BookingDraft } from '@/lib/booking-state'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'

const NETWORKS = ['Vodacom M-Pesa', 'Airtel Money', 'Tigo Pesa', 'Halotel']

export default function BookingPaymentPage() {
  const { tour } = useBookingContext()
  const params = useParams<{ tourSlug: string }>()
  const router = useRouter()
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [mobileLoading, setMobileLoading] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const [network, setNetwork] = useState(NETWORKS[0])
  const [phone, setPhone] = useState('')

  useEffect(() => {
    // Hydrating one-time from sessionStorage on mount — not available during SSR.
    const d = getBookingDraft(params.tourSlug)
    if (!d.date || !d.touristEmail) {
      router.replace(`/book/${params.tourSlug}/dates`)
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(d)
    setPhone(d.touristWhatsapp)
  }, [params.tourSlug, router])

  if (!draft) return null

  const addonsTotal = tour.addons.filter((a) => draft.addons.includes(a.id)).reduce((sum, a) => sum + a.price_usd, 0) * draft.guests
  const total = tour.price_usd * draft.guests + addonsTotal

  async function createBooking(paymentMethod: 'card' | 'mobile_money') {
    const res = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tourSlug: params.tourSlug,
        travelDate: draft!.date,
        groupSize: draft!.guests,
        addons: draft!.addons,
        touristName: draft!.touristName,
        touristEmail: draft!.touristEmail,
        touristWhatsapp: draft!.touristWhatsapp,
        touristNationality: draft!.touristNationality,
        specialRequests: draft!.specialOccasion,
        dietaryRequirements: draft!.dietaryRequirements,
        medicalNotes: draft!.medicalNotes,
        paymentMethod,
      }),
    })
    if (!res.ok) throw new Error('Booking failed')
    return res.json()
  }

  async function handleCardPay() {
    setCardLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const result = await createBooking('card')
      router.push(`/book/${params.tourSlug}/confirmed?ref=${result.bookingRef}`)
    } catch {
      toast.error('Payment failed. Please try again.')
      setCardLoading(false)
    }
  }

  async function handleMobilePay() {
    setMobileLoading(true)
    setCountdown(120)
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const result = await createBooking('mobile_money')
      router.push(`/book/${params.tourSlug}/confirmed?ref=${result.bookingRef}`)
    } catch {
      toast.error('Payment failed. Please try again.')
      setMobileLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy">Payment</h2>

      <div className="mt-4 rounded-xl border border-border bg-white p-5">
        <p className="font-semibold text-navy">{tour.title}</p>
        <p className="text-sm text-muted">
          {formatDate(draft.date!)} · {draft.guests} guests
        </p>
        <p className="mt-2 font-display text-xl font-bold text-gold-dark">{formatCurrency(total)}</p>
      </div>

      <Tabs.Root defaultValue="card" className="mt-6">
        <Tabs.List className="flex gap-2 border-b border-border">
          <Tabs.Trigger value="card" className="border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted data-[state=active]:border-teal data-[state=active]:text-teal">
            💳 Card Payment
          </Tabs.Trigger>
          <Tabs.Trigger value="mobile" className="border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted data-[state=active]:border-teal data-[state=active]:text-teal">
            📱 M-Pesa / Mobile Money
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="card" className="py-6">
          <p className="text-sm text-muted">Secure card payment powered by Stripe</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Card Number</label>
              <input placeholder="4242 4242 4242 4242" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Expiry</label>
                <input placeholder="MM / YY" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">CVV</label>
                <input placeholder="123" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Cardholder Name</label>
              <input
                placeholder={draft.touristName}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
            </div>
            <div className="flex gap-2 text-xs font-medium text-muted">
              <span className="rounded border border-border px-2 py-1">VISA</span>
              <span className="rounded border border-border px-2 py-1">Mastercard</span>
              <span className="rounded border border-border px-2 py-1">AMEX</span>
            </div>
          </div>

          <Button variant="primary" className="mt-5 flex w-full items-center justify-center gap-2" disabled={cardLoading} onClick={handleCardPay}>
            {cardLoading ? (
              <>
                <Spinner size="sm" /> Processing…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay {formatCurrency(total)} Securely
              </>
            )}
          </Button>
          <p className="mt-3 text-xs text-muted">Your card is charged in USD. Your bank may apply currency conversion fees.</p>
        </Tabs.Content>

        <Tabs.Content value="mobile" className="py-6">
          <p className="text-sm text-muted">Pay via mobile money — Vodacom, Airtel, or Tigo</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy">Network</label>
              <div className="space-y-2">
                {NETWORKS.map((n) => (
                  <label key={n} className="flex items-center gap-2 text-sm text-navy">
                    <input type="radio" name="network" checked={network === n} onChange={() => setNetwork(n)} className="accent-teal" />
                    {n}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {mobileLoading ? (
            <div className="mt-5 rounded-lg bg-teal-light p-4 text-center">
              <Spinner size="md" className="mx-auto" />
              <p className="mt-2 text-sm font-medium text-teal">Check your phone for a push notification from {network}</p>
              <p className="mt-1 text-xs text-muted">Waiting for payment confirmation… ({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')})</p>
            </div>
          ) : (
            <Button variant="primary" className="mt-5 w-full" onClick={handleMobilePay}>
              Pay {formatCurrency(total)} via Mobile Money
            </Button>
          )}
          <p className="mt-3 text-xs text-muted">You will receive a push notification on your phone. Approve the payment to confirm your booking.</p>
        </Tabs.Content>
      </Tabs.Root>

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

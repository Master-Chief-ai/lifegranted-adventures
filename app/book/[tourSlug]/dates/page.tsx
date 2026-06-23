'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useBookingContext } from '@/components/booking/BookingContext'
import { getBookingDraft, saveBookingDraft, type BookingDraft } from '@/lib/booking-state'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calculateFees } from '@/lib/flutterwave'

function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface DayInfo {
  date: Date
  status: 'available' | 'booked' | 'unavailable' | 'past'
  slotsRemaining: number
}

function buildMonth(year: number, month: number): DayInfo[] {
  const days: DayInfo[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const seed = year * 10000 + month * 100 + d
    const rand = seedRandom(seed)
    let status: DayInfo['status']
    let slotsRemaining = 0

    if (date < today) {
      status = 'past'
    } else if (rand < 0.85) {
      status = 'available'
      slotsRemaining = 4 + Math.floor(seedRandom(seed + 1) * 5)
    } else if (rand < 0.95) {
      status = 'booked'
    } else {
      status = 'unavailable'
    }
    days.push({ date, status, slotsRemaining })
  }
  return days
}

export default function BookingDatesPage() {
  const { tour } = useBookingContext()
  const params = useParams<{ tourSlug: string }>()
  const router = useRouter()

  const [draft, setDraft] = useState<BookingDraft>(() => getBookingDraft(params.tourSlug))
  const [viewDate, setViewDate] = useState(() => new Date())

  const monthDays = useMemo(() => buildMonth(viewDate.getFullYear(), viewDate.getMonth()), [viewDate])
  const selectedDay = monthDays.find((d) => draft.date && d.date.toDateString() === new Date(draft.date).toDateString())

  const addonsTotal = tour.addons.filter((a) => draft.addons.includes(a.id)).reduce((sum, a) => sum + a.price_usd, 0) * draft.guests
  const subtotal = tour.price_usd * draft.guests
  const tourTotal = subtotal + addonsTotal
  // Default to the card rate here; the payment step recalculates live per payment method.
  const fees = calculateFees(tourTotal, 'card')

  useEffect(() => {
    saveBookingDraft({ ...draft, tourTotal: fees.tourTotal, bookingFee: fees.bookingFee, grandTotal: fees.grandTotal })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.date, draft.guests, draft.addons])

  function selectDate(day: DayInfo) {
    if (day.status !== 'available') return
    setDraft((d) => ({ ...d, date: day.date.toISOString().split('T')[0] }))
  }

  function toggleAddon(id: string) {
    setDraft((d) => ({ ...d, addons: d.addons.includes(id) ? d.addons.filter((a) => a !== id) : [...d.addons, id] }))
  }

  function changeMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOffset = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const statusClasses: Record<DayInfo['status'], string> = {
    available: 'bg-green-50 text-[#15803D] border-[#15803D]/30 hover:border-teal cursor-pointer',
    booked: 'bg-red-50 text-[#B91C1C] border-[#B91C1C]/20 cursor-not-allowed',
    unavailable: 'bg-gray-50 text-gray-400 border-border cursor-not-allowed',
    past: 'bg-transparent text-gray-300 border-transparent cursor-not-allowed',
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy">Choose Your Travel Date</h2>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="rounded-lg p-1.5 hover:bg-teal-light">
            <ChevronLeft size={18} />
          </button>
          <p className="font-display font-semibold text-navy">{monthLabel}</p>
          <button onClick={() => changeMonth(1)} className="rounded-lg p-1.5 hover:bg-teal-light">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`offset-${i}`} />
          ))}
          {monthDays.map((day) => {
            const isSelected = draft.date && day.date.toDateString() === new Date(draft.date).toDateString()
            return (
              <button
                key={day.date.toISOString()}
                disabled={day.status !== 'available'}
                onClick={() => selectDate(day)}
                className={`aspect-square rounded-lg border text-xs font-medium ${
                  isSelected ? 'border-teal bg-teal text-white' : statusClasses[day.status]
                }`}
              >
                {day.date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-50 border border-[#15803D]/30" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-50 border border-[#B91C1C]/20" /> Booked out
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-gray-50 border border-border" /> Unavailable
          </span>
        </div>

        {selectedDay && (
          <p className="mt-3 text-sm font-medium text-teal">
            {formatDate(selectedDay.date)} — {selectedDay.slotsRemaining} spots remaining
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-navy">Group Size</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDraft((d) => ({ ...d, guests: Math.max(tour.min_group, d.guests - 1) }))}
            className="h-9 w-9 rounded-lg border border-border text-navy hover:border-teal"
          >
            −
          </button>
          <span className="w-10 text-center font-medium text-navy">{draft.guests}</span>
          <button
            onClick={() => setDraft((d) => ({ ...d, guests: Math.min(tour.max_group, d.guests + 1) }))}
            className="h-9 w-9 rounded-lg border border-border text-navy hover:border-teal"
          >
            +
          </button>
          <span className="text-xs text-muted">
            {tour.min_group}-{tour.max_group} guests
          </span>
        </div>

        {tour.addons.length > 0 && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-navy">Add-ons</label>
            <div className="space-y-2">
              {tour.addons.map((addon) => (
                <label key={addon.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={draft.addons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} className="mt-0.5 accent-teal" />
                  <span className="text-navy">
                    {addon.name} <span className="text-muted">+{formatCurrency(addon.price_usd)} / person</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">
              Base price: {draft.guests} × {formatCurrency(tour.price_usd)}
            </span>
            <span className="text-navy">{formatCurrency(subtotal)}</span>
          </div>
          {tour.addons
            .filter((a) => draft.addons.includes(a.id))
            .map((a) => (
              <div key={a.id} className="flex justify-between">
                <span className="text-muted">{a.name}</span>
                <span className="text-navy">+{formatCurrency(a.price_usd * draft.guests)}</span>
              </div>
            ))}
          <div className="flex justify-between border-t border-border pt-1.5 font-medium">
            <span className="text-navy">Tour total</span>
            <span className="text-navy">{formatCurrency(fees.tourTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="group relative flex items-center gap-1">
              Booking fee (3.8%)
              <Info size={12} className="cursor-help" />
              <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-60 rounded-lg bg-navy p-2.5 text-xs text-white opacity-0 shadow-card-hover transition-opacity group-hover:opacity-100">
                This is a standard payment processing fee charged by our payment provider. It does not affect the operator&apos;s
                price or your tour experience.
              </span>
            </span>
            <span>{formatCurrency(fees.bookingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
            <span className="text-navy">Total due today</span>
            <span className="text-teal">{formatCurrency(fees.grandTotal)}</span>
          </div>
        </div>

        <Button
          variant="gold"
          className="mt-5 w-full"
          disabled={!draft.date}
          onClick={() => router.push(`/book/${params.tourSlug}/details`)}
        >
          Continue to Guest Details →
        </Button>
      </div>

      <Link href={`/tours/${params.tourSlug}`} className="mt-4 inline-block text-sm text-muted hover:underline">
        ← Back to tour
      </Link>
    </div>
  )
}

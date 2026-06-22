'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Lock, CheckCircle2, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { getBookingDraft, saveBookingDraft } from '@/lib/booking-state'
import type { Tour, TourAvailability } from '@/types'

export function BookingWidget({ tour, availability }: { tour: Tour; availability: TourAvailability[] }) {
  const router = useRouter()
  const [guests, setGuests] = useState(tour.min_group)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const addonsTotal = useMemo(
    () => tour.addons.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price_usd, 0),
    [selectedAddons, tour.addons]
  )
  const total = tour.price_usd * guests + addonsTotal

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  function handleBookNow() {
    const draft = getBookingDraft(tour.slug)
    saveBookingDraft({ ...draft, date: selectedDate ?? draft.date, guests, addons: selectedAddons })
    router.push(`/book/${tour.slug}/dates`)
  }

  return (
    <Card className="sticky top-24 border-teal/40 p-6 shadow-card-hover">
      <p className="font-display text-2xl font-bold text-teal">
        {formatCurrency(tour.price_usd)}
        <span className="text-sm font-normal text-muted"> / person</span>
      </p>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-navy">Group Size</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests((g) => Math.max(tour.min_group, g - 1))}
            className="h-9 w-9 rounded-lg border border-border text-navy hover:border-teal"
          >
            −
          </button>
          <span className="w-10 text-center font-medium text-navy">{guests}</span>
          <button
            onClick={() => setGuests((g) => Math.min(tour.max_group, g + 1))}
            className="h-9 w-9 rounded-lg border border-border text-navy hover:border-teal"
          >
            +
          </button>
          <span className="text-xs text-muted">
            {tour.min_group}-{tour.max_group} guests
          </span>
        </div>
      </div>

      {tour.addons.length > 0 && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-navy">Add-ons</label>
          <div className="space-y-2">
            {tour.addons.map((addon) => (
              <label key={addon.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                  className="mt-0.5 accent-teal"
                />
                <span className="flex-1 text-navy">
                  {addon.name} <span className="text-muted">+{formatCurrency(addon.price_usd)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-navy">Select a Date</label>
        <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto">
          {availability.slice(0, 28).map((day) => {
            const available = day.slots_remaining > 0
            const selected = selectedDate === day.available_date
            return (
              <button
                key={day.id}
                disabled={!available}
                onClick={() => setSelectedDate(day.available_date)}
                className={`rounded-md border px-1 py-1.5 text-xs font-medium ${
                  selected
                    ? 'border-teal bg-teal text-white'
                    : available
                      ? 'border-[#15803D]/30 bg-green-50 text-[#15803D] hover:border-teal'
                      : 'border-border bg-gray-50 text-gray-400'
                }`}
              >
                {formatDateShort(day.available_date)}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 font-display text-lg font-bold text-gold-dark">Total: {formatCurrency(total)}</p>

      <Button variant="gold" className="mt-3 w-full" onClick={handleBookNow}>
        Book Now
      </Button>

      <button className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-teal hover:underline">
        <Heart size={15} /> Save to Wishlist
      </button>

      <a
        href={`https://wa.me/255000000000?text=${encodeURIComponent(`Hi, I have a question about ${tour.title}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-teal hover:underline"
      >
        <MessageCircle size={15} /> Ask a Question
      </a>

      <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <Lock size={12} /> Secure payment
        </p>
        <p className="flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Free cancellation 30+ days before
        </p>
        <p className="flex items-center gap-1.5">
          <Star size={12} /> Verified reviews
        </p>
      </div>
    </Card>
  )
}

export default BookingWidget

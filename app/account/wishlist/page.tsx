'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { TourCard } from '@/components/common/TourCard'
import { MOCK_TOURS, MOCK_OPERATORS } from '@/lib/supabase/mock-data'
import type { TourWithOperator } from '@/types'

const SAVED_TOUR_IDS = ['tour-1', 'tour-6']

export default function WishlistPage() {
  const [savedIds, setSavedIds] = useState<string[]>(SAVED_TOUR_IDS)

  const tours: TourWithOperator[] = MOCK_TOURS.filter((t) => savedIds.includes(t.id)).map((t) => ({
    ...t,
    operator: MOCK_OPERATORS.find((o) => o.id === t.operator_id)!,
  }))

  function remove(id: string) {
    setSavedIds((prev) => prev.filter((tid) => tid !== id))
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy">My Wishlist</h2>
      {tours.length === 0 ? (
        <p className="mt-4 text-sm text-muted">You haven&apos;t saved any tours yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {tours.map((tour) => (
            <div key={tour.id} className="relative">
              <TourCard tour={tour} />
              <button
                onClick={() => remove(tour.id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card"
                aria-label="Remove from wishlist"
              >
                <Heart size={16} className="fill-[#B91C1C] text-[#B91C1C]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

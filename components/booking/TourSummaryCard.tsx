'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Tour, Operator } from '@/types'

export function TourSummaryCard({
  tour,
  operator,
  date,
  guests,
  total,
}: {
  tour: Tour
  operator: Operator
  date?: string | null
  guests?: number
  total?: number
}) {
  return (
    <Card className="sticky top-24 p-5">
      <div className="flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-teal-light">
          {tour.images[0] && <Image src={tour.images[0].url} alt={tour.title} fill className="object-cover" />}
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-navy">{tour.title}</p>
          <p className="text-xs text-muted">{operator.business_name}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Date</span>
          <span className="text-navy">{date ? formatDate(date) : 'Not selected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Guests</span>
          <span className="text-navy">{guests ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Price per person</span>
          <span className="text-navy">{formatCurrency(tour.price_usd)}</span>
        </div>
        {total !== undefined && (
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
            <span className="text-navy">Total</span>
            <span className="text-gold-dark">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TourSummaryCard

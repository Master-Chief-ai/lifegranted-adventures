'use client'

import * as Tabs from '@radix-ui/react-tabs'
import * as Accordion from '@radix-ui/react-accordion'
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { ReviewCard } from '@/components/common/ReviewCard'
import type { Tour, Review } from '@/types'

export function TourTabs({ tour, reviews }: { tour: Tour; reviews: Review[] }) {
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
  const maxCount = Math.max(1, ...ratingCounts.map((r) => r.count))

  return (
    <Tabs.Root defaultValue="overview" className="mt-8">
      <Tabs.List className="flex gap-6 border-b border-border">
        {['overview', 'itinerary', 'included', 'reviews'].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="border-b-2 border-transparent px-1 py-3 text-sm font-medium capitalize text-muted data-[state=active]:border-teal data-[state=active]:text-teal"
          >
            {tab}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="overview" className="py-6">
        <h3 className="font-display text-lg font-semibold text-navy">Highlights</h3>
        <ul className="mt-3 space-y-2">
          {tour.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-navy">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" /> {h}
            </li>
          ))}
        </ul>
        <h3 className="mt-6 font-display text-lg font-semibold text-navy">Description</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy/90">{tour.description}</p>
      </Tabs.Content>

      <Tabs.Content value="itinerary" className="py-6">
        <Accordion.Root type="single" collapsible className="space-y-2">
          {tour.itinerary.map((day) => (
            <Accordion.Item key={day.day} value={`day-${day.day}`} className="rounded-lg border border-border">
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left">
                  <span className="font-semibold text-navy">
                    Day {day.day}: {day.title}
                  </span>
                  <ChevronDown size={16} className="text-muted transition-transform data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-4 pb-4 text-sm text-navy/90">
                <p>{day.activities}</p>
                <p className="mt-2">
                  <span className="font-medium">Accommodation:</span> {day.accommodation} ({day.accommodation_type})
                </p>
                <p className="mt-1">
                  <span className="font-medium">Meals:</span>{' '}
                  {[day.meals.breakfast && 'Breakfast', day.meals.lunch && 'Lunch', day.meals.dinner && 'Dinner']
                    .filter(Boolean)
                    .join(', ') || 'None included'}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Transport:</span> {day.transport}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Tabs.Content>

      <Tabs.Content value="included" className="grid grid-cols-1 gap-8 py-6 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy">Included</h3>
          <ul className="mt-3 space-y-2">
            {tour.inclusions.map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#15803D]" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-navy">Not Included</h3>
          <ul className="mt-3 space-y-2">
            {tour.exclusions.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-navy">
                <XCircle size={16} className="mt-0.5 shrink-0 text-[#B91C1C]" /> {e}
              </li>
            ))}
          </ul>
        </div>
      </Tabs.Content>

      <Tabs.Content value="reviews" className="py-6">
        <div className="mb-6 space-y-1.5">
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-10 text-navy">{star}★</span>
              <div className="h-2 flex-1 rounded-full bg-border">
                <div className="h-2 rounded-full bg-gold" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-muted">{count}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet for this tour.</p>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  )
}

export default TourTabs

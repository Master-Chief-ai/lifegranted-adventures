'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate, getCountryFlag, truncate } from '@/lib/utils'
import type { Review } from '@/types'

export function ReviewCard({ review, tourTitle, tourSlug }: { review: Review; tourTitle?: string; tourSlug?: string }) {
  const [expanded, setExpanded] = useState(false)
  const showToggle = review.body.length > 200

  return (
    <Card className="p-5">
      <StarRating rating={review.rating} />
      {review.title && <h4 className="mt-2 font-display text-base font-semibold text-navy">{review.title}</h4>}
      <p className="mt-2 text-sm text-navy/90">
        {expanded || !showToggle ? review.body : truncate(review.body, 200)}
        {showToggle && (
          <button onClick={() => setExpanded((e) => !e)} className="ml-1 font-medium text-teal hover:underline">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <span>{getCountryFlag(review.tourist_country)}</span>
        <span className="font-medium text-navy">{review.tourist_name}</span>
        <span>·</span>
        <span>{formatDate(review.created_at)}</span>
      </div>
      {tourTitle && tourSlug && (
        <Link href={`/tours/${tourSlug}`} className="mt-1 inline-block text-sm font-medium text-teal hover:underline">
          {tourTitle}
        </Link>
      )}
      {review.operator_response && (
        <div className="mt-3 rounded-lg bg-teal-light p-3">
          <p className="text-xs font-semibold text-teal">Response from operator</p>
          <p className="mt-1 text-sm text-navy/90">{review.operator_response}</p>
        </div>
      )}
    </Card>
  )
}

export default ReviewCard

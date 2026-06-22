'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

export function StarRating({ rating, reviewCount, size = 16, interactive = false, onChange, className }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {stars.map((star) => (
          <Star
            key={star}
            size={size}
            className={cn(
              star <= Math.round(rating) ? 'fill-teal text-teal' : 'fill-none text-border',
              interactive && 'cursor-pointer'
            )}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
      {(rating > 0 || reviewCount !== undefined) && (
        <span className="text-sm text-muted">
          <span className="font-semibold text-navy">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  )
}

export default StarRating

import Image from 'next/image'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RegionBadge } from '@/components/ui/RegionBadge'
import { StarRating } from '@/components/ui/StarRating'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatCurrency } from '@/lib/utils'
import type { TourWithOperator } from '@/types'

export function TourCard({ tour }: { tour: TourWithOperator }) {
  const image = tour.images[0]
  return (
    <Card hover className="overflow-hidden">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="relative aspect-video w-full">
          {image ? (
            <Image src={image.url} alt={image.alt} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-teal-light" />
          )}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-2 py-1">
            {tour.operator.logo_url && (
              <Image src={tour.operator.logo_url} alt={tour.operator.business_name} width={20} height={20} className="rounded-full" />
            )}
            <span className="text-xs font-medium text-navy">{tour.operator.business_name}</span>
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            <RegionBadge region={tour.regions[0]} />
            {tour.is_instant_book && (
              <Badge variant="green" className="flex items-center gap-1">
                <Zap size={12} /> Instant Book
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/tours/${tour.slug}`}>
          <h3 className="line-clamp-2 font-display text-lg font-semibold text-navy">{tour.title}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="gray">
            {tour.duration_days} Days / {tour.duration_nights} Nights
          </Badge>
        </div>
        <div className="mt-2">
          <StarRating rating={tour.avg_rating} reviewCount={tour.total_reviews} />
        </div>
        <p className="mt-2 text-sm text-muted">
          From <span className="text-base font-bold text-gold-dark">{formatCurrency(tour.price_usd)}</span> per person
        </p>
        <div className="mt-4 flex gap-2">
          <Link href={`/tours/${tour.slug}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex-1')}>
            View Tour
          </Link>
          <Link href={`/tours/${tour.slug}?book=1`} className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'flex-1')}>
            Book Now
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default TourCard

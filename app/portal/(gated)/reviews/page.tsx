import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorReviews, getOperatorTours } from '@/lib/supabase/queries'
import { ReviewsManager } from '@/components/portal/ReviewsManager'

export default async function PortalReviewsPage() {
  const operator = await getCurrentOperator()
  const [reviews, tours] = await Promise.all([getOperatorReviews(operator.id), getOperatorTours(operator.id)])
  const tourTitles = Object.fromEntries(tours.map((t) => [t.id, t.title]))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Reviews</h1>
        <span className="text-sm text-muted">
          ⭐ {operator.avg_rating.toFixed(1)} from {operator.total_reviews || reviews.length} reviews
        </span>
      </div>
      <div className="mt-6">
        <ReviewsManager reviews={reviews} tourTitles={tourTitles} />
      </div>
    </div>
  )
}

import { getAllReviewsAdmin } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { AdminReviewsManager } from '@/components/admin/AdminReviewsManager'

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsAdmin()
  const published = reviews.filter((r) => r.is_published)
  const avgRating = published.length ? published.reduce((sum, r) => sum + r.rating, 0) / published.length : 0
  const now = new Date()
  const thisMonth = reviews.filter((r) => {
    const d = new Date(r.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Review Moderation</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-teal">{published.length}</p>
          <p className="text-xs text-muted">Total published reviews</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-navy">⭐ {avgRating.toFixed(1)}</p>
          <p className="text-xs text-muted">Platform avg rating</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-navy">{thisMonth.length}</p>
          <p className="text-xs text-muted">Reviews this month</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-gold-dark">0</p>
          <p className="text-xs text-muted">Flagged reviews</p>
        </Card>
      </div>

      <div className="mt-6">
        <AdminReviewsManager reviews={reviews} />
      </div>
    </div>
  )
}

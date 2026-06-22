'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { StarRating } from '@/components/ui/StarRating'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getCountryFlag, formatDate } from '@/lib/utils'
import type { Review } from '@/types'

export function ReviewsManager({ reviews, tourTitles }: { reviews: Review[]; tourTitles: Record<string, string> }) {
  const [localReviews, setLocalReviews] = useState(reviews)
  const [sort, setSort] = useState<'newest' | 'lowest'>('newest')
  const [filter, setFilter] = useState<'all' | 'awaiting' | 'responded'>('all')

  const filtered = useMemo(() => {
    let result = [...localReviews]
    if (filter === 'awaiting') result = result.filter((r) => !r.operator_response)
    if (filter === 'responded') result = result.filter((r) => r.operator_response)
    if (sort === 'lowest') result.sort((a, b) => a.rating - b.rating)
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }, [localReviews, sort, filter])

  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: localReviews.filter((r) => r.rating === star).length }))
  const maxCount = Math.max(1, ...distribution.map((d) => d.count))
  const average = localReviews.length ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length : 0
  const responseRate = localReviews.length ? Math.round((localReviews.filter((r) => r.operator_response).length / localReviews.length) * 100) : 0
  const responseRateColor = responseRate > 80 ? 'text-teal' : responseRate >= 50 ? 'text-gold-dark' : 'text-[#B91C1C]'

  function handleUpdated(id: string, response: string) {
    setLocalReviews((prev) => prev.map((r) => (r.id === id ? { ...r, operator_response: response, operator_responded_at: new Date().toISOString() } : r)))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'awaiting', 'responded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${filter === f ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'}`}
            >
              {f === 'awaiting' ? 'Awaiting Response' : f === 'responded' ? 'Responded' : 'All'}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'lowest')} className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-navy">
          <option value="newest">Newest First</option>
          <option value="lowest">Lowest Rated First</option>
        </select>
      </div>

      <div className="mt-5 space-y-4">
        {filtered.map((review) => (
          <ReviewCardEditable key={review.id} review={review} tourTitle={tourTitles[review.tour_id] ?? 'Tour'} onUpdated={(response) => handleUpdated(review.id, response)} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted">No reviews match this filter.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy">Rating Overview</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-10 text-navy">{star}★</span>
                <div className="h-2 flex-1 rounded-full bg-border">
                  <div className="h-2 rounded-full bg-gold" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="w-20 text-right text-muted">{count} reviews</span>
              </div>
            ))}
          </div>
          <Card className="p-5">
            <p className="text-sm text-muted">Average</p>
            <p className="font-display text-2xl font-bold text-navy">⭐ {average.toFixed(1)}</p>
            <p className="mt-3 text-sm text-muted">Total reviews</p>
            <p className="font-display text-xl font-bold text-navy">{localReviews.length}</p>
            <p className="mt-3 text-sm text-muted">Response rate</p>
            <p className={`font-display text-xl font-bold ${responseRateColor}`}>{responseRate}%</p>
            <p className="mt-2 text-xs text-muted">Aim for 100% response rate — it builds tourist trust</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ReviewCardEditable({ review, tourTitle, onUpdated }: { review: Review; tourTitle: string; onUpdated: (response: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [responding, setResponding] = useState(false)
  const [text, setText] = useState(review.operator_response ?? '')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      onUpdated(text)
      toast.success('Response submitted')
      setEditing(false)
      setResponding(false)
    } catch {
      toast.error('Could not submit response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StarRating rating={review.rating} />
        <div className="flex items-center gap-2 text-xs text-muted">
          <Badge variant="teal">{tourTitle}</Badge>
          {formatDate(review.created_at)}
        </div>
      </div>
      {review.title && <p className="mt-2 font-semibold text-navy">{review.title}</p>}
      <p className="mt-1 text-sm text-navy/90">{review.body}</p>
      <p className="mt-2 text-xs text-muted">
        {getCountryFlag(review.tourist_country)} {review.tourist_name}
      </p>

      {review.operator_response && !editing ? (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold text-navy">Your response:</p>
          <p className="mt-1 text-sm text-navy/80">{review.operator_response}</p>
          <button onClick={() => setEditing(true)} className="mt-1 text-xs font-medium text-teal hover:underline">
            Edit Response
          </button>
        </div>
      ) : !responding && !editing ? (
        <button onClick={() => setResponding(true)} className="mt-3 rounded-lg border border-teal px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal-light">
          ✍️ Write a Response
        </button>
      ) : null}

      {(responding || editing) && (
        <div className="mt-3">
          <textarea
            rows={3}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Thank ${review.tourist_name} for their review…`}
            className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
          />
          <p className="mt-1 text-xs text-muted">{text.length}/500</p>
          <p className="mt-1 text-xs italic text-muted">Tip: address them by name, thank them sincerely, and address any concerns professionally</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" disabled={loading} onClick={submit}>
              Submit Response
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setResponding(false)
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ReviewsManager

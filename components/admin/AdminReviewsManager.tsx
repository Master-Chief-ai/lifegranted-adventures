'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { StarRating } from '@/components/ui/StarRating'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getCountryFlag, formatDate } from '@/lib/utils'
import type { Review } from '@/types'

const TABS = ['pending', 'published', 'removed'] as const

export function AdminReviewsManager({ reviews }: { reviews: Review[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('published')
  const [localReviews, setLocalReviews] = useState(reviews.map((r) => ({ ...r, _moderation: null as string | null })))
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (tab === 'published') return localReviews.filter((r) => r.is_published)
    if (tab === 'removed') return localReviews.filter((r) => !r.is_published && r._moderation)
    return localReviews.filter((r) => !r.is_published && !r._moderation)
  }, [localReviews, tab])

  function moderate(id: string, action: 'approve' | 'spam' | 'offensive' | 'flag') {
    setLocalReviews((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (action === 'approve') return { ...r, is_published: true, _moderation: null }
        if (action === 'flag') return { ...r, _moderation: 'flagged for legal review' }
        return { ...r, is_published: false, _moderation: action }
      })
    )
    toast.success('Review updated')
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function bulkApprove() {
    setLocalReviews((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, is_published: true, _moderation: null } : r)))
    toast.success(`Approved ${selected.size} reviews`)
    setSelected(new Set())
  }
  function bulkRemove() {
    setLocalReviews((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, is_published: false, _moderation: 'spam' } : r)))
    toast.success(`Removed ${selected.size} reviews`)
    setSelected(new Set())
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-3 py-3 text-sm font-medium capitalize ${tab === t ? 'border-teal text-teal' : 'border-transparent text-muted'}`}
            >
              {t === 'pending' ? 'Pending Moderation' : t}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2 pb-2">
            <Button size="sm" onClick={bulkApprove}>
              Approve All Selected ({selected.size})
            </Button>
            <Button size="sm" variant="destructive" onClick={bulkRemove}>
              Remove All Selected
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length === 0 && <p className="text-sm text-muted">No reviews in this view.</p>}
        {filtered.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="mt-1 accent-teal" />
              <div className="flex-1">
                <StarRating rating={r.rating} />
                {r.title && <p className="mt-1 font-semibold text-navy">{r.title}</p>}
                <p className="mt-1 text-sm text-navy/90">{r.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {getCountryFlag(r.tourist_country)} {r.tourist_name} · {formatDate(r.created_at)}
                </p>
                {r._moderation && <p className="mt-1 text-xs font-medium text-[#B91C1C]">Moderation note: {r._moderation}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {!r.is_published && !r._moderation && (
                    <Button size="sm" onClick={() => moderate(r.id, 'approve')}>
                      ✓ Approve &amp; Publish
                    </Button>
                  )}
                  {r.is_published && (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => moderate(r.id, 'spam')}>
                        ✗ Remove — Spam
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => moderate(r.id, 'offensive')}>
                        ✗ Remove — Offensive
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => moderate(r.id, 'flag')}>
                    ⚑ Flag for Legal Review
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminReviewsManager

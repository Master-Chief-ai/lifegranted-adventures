'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function NewReviewPage() {
  const router = useRouter()
  const params = useParams<{ bookingRef: string }>()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingRef: params.bookingRef, rating, title, body }),
      })
      if (!res.ok) throw new Error()
      toast.success('Thanks for your review!')
      router.push('/account/bookings?tab=past')
    } catch {
      toast.error('Could not submit your review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-lg p-6">
      <h2 className="font-display text-xl font-bold text-navy">Write a Review</h2>
      <p className="mt-1 text-sm text-muted">Booking {params.bookingRef}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" key={star} onClick={() => setRating(star)}>
                <Star size={28} className={star <= rating ? 'fill-gold text-gold' : 'fill-none text-border'} />
              </button>
            ))}
          </div>
        </div>
        <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum up your trip" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Your Review</label>
          <textarea
            required
            minLength={10}
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            placeholder="Tell other travelers about your experience…"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  )
}

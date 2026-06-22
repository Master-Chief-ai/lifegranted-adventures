'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      toast.success('Subscribed! Check your inbox soon.')
      setEmail('')
    } catch {
      toast.error('Could not subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-11 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-gold"
      />
      <Button type="submit" variant="gold" disabled={loading}>
        {loading ? 'Subscribing…' : 'Subscribe'}
      </Button>
    </form>
  )
}

export default NewsletterForm

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function GuaranteeFundAdjust() {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || !notes.trim()) return

    if (!confirm(`This directly modifies the fund balance by $${parsed}. Are you sure?`)) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/guarantee-fund/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed, notes: notes.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success('Adjustment recorded')
      setAmount('')
      setNotes('')
    } catch {
      toast.error('Failed to record adjustment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-semibold text-navy">Manual Adjustment</h2>
      <p className="mt-1 text-xs text-muted">Use positive amounts to add funds, negative to deduct. All adjustments are logged.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500.00 or -200.00"
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Reason for this adjustment..."
            className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal focus:outline-none"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Recording…' : 'Record Manual Adjustment'}
        </Button>
      </form>
    </Card>
  )
}

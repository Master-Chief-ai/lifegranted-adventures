'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getCountryFlag } from '@/lib/utils'
import type { Dispute } from '@/types'

const TABS = ['open', 'resolved', 'all'] as const

function daysOpen(dispute: Dispute) {
  const end = dispute.status === 'resolved' && dispute.resolved_at ? new Date(dispute.resolved_at) : new Date()
  return Math.floor((end.getTime() - new Date(dispute.created_at).getTime()) / 86400000)
}

export function AdminDisputesManager({ disputes }: { disputes: Dispute[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('open')
  const [localDisputes, setLocalDisputes] = useState(disputes)
  const [active, setActive] = useState<Dispute | null>(null)

  const filtered = useMemo(() => {
    const result = tab === 'all' ? localDisputes : localDisputes.filter((d) => d.status === tab)
    return [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [localDisputes, tab])

  function handleResolved(updated: Dispute) {
    setLocalDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setActive(null)
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-3 text-sm font-medium capitalize ${tab === t ? 'border-teal text-teal' : 'border-transparent text-muted'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length === 0 && <p className="text-sm text-muted">No disputes in this view.</p>}
        {filtered.map((d) => {
          const days = daysOpen(d)
          return (
            <Card key={d.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-teal">{d.booking_ref}</p>
                  <p className="font-display text-base font-semibold text-navy">{d.tour_title}</p>
                  <p className="text-sm text-muted">{d.operator_name}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span>
                      {getCountryFlag(d.tourist_country)} {d.tourist_name}
                    </span>
                    <Badge variant="gray">{d.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-navy/90">{d.description}</p>
                  <p className={`mt-2 text-xs font-medium ${days > 3 && d.status === 'open' ? 'text-[#B91C1C]' : 'text-muted'}`}>{days} days {d.status === 'open' ? 'open' : 'to resolve'}</p>
                </div>
                {d.status === 'open' && <Button onClick={() => setActive(d)}>Resolve This Dispute</Button>}
                {d.status === 'resolved' && <Badge variant="green">Resolved</Badge>}
              </div>
            </Card>
          )
        })}
      </div>

      {active && <DisputeResolutionPanel dispute={active} onClose={() => setActive(null)} onResolved={handleResolved} />}
    </div>
  )
}

const DECISIONS = [
  { value: 'full_refund', label: 'Full refund to tourist (operator absorbs cost)' },
  { value: 'half_refund', label: '50% refund to tourist' },
  { value: 'no_refund', label: 'No refund — operator not at fault' },
  { value: 'suspend', label: 'Suspend operator pending investigation' },
]

function DisputeResolutionPanel({ dispute, onClose, onResolved }: { dispute: Dispute; onClose: () => void; onResolved: (d: Dispute) => void }) {
  const [decision, setDecision] = useState(DECISIONS[0].value)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!notes.trim()) {
      toast.error('Resolution notes are required')
      return
    }
    setLoading(true)
    try {
      await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, resolutionNotes: notes }),
      })
      toast.success('Dispute resolved')
      onResolved({ ...dispute, status: 'resolved', resolution: `${DECISIONS.find((d) => d.value === decision)?.label} — ${notes}`, resolved_at: new Date().toISOString() })
    } catch {
      toast.error('Could not resolve dispute')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md overflow-y-auto bg-white p-6 shadow-card-hover">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy">Resolve Dispute</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-navy">The Complaint</h4>
          <p className="mt-1 text-sm text-navy/90">
            {dispute.tourist_name}: {dispute.description}
          </p>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-navy">Operator Response</h4>
          <p className="mt-1 text-sm text-navy/90">{dispute.operator_response ?? 'No response yet'}</p>
          {!dispute.operator_response && (
            <button onClick={() => toast.success('Response request sent to operator')} className="mt-1 text-xs font-medium text-teal hover:underline">
              Send Response Request to Operator
            </button>
          )}
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold text-navy">Your Decision</h4>
          <div className="mt-2 space-y-2">
            {DECISIONS.map((d) => (
              <label key={d.value} className="flex items-start gap-2 text-sm text-navy">
                <input type="radio" name="decision" checked={decision === d.value} onChange={() => setDecision(d.value)} className="mt-0.5 accent-teal" />
                {d.label}
              </label>
            ))}
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summarise your decision and reasoning"
            className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
          />
          <Button variant="gold" className="mt-3 w-full" disabled={loading} onClick={submit}>
            Submit Resolution
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminDisputesManager

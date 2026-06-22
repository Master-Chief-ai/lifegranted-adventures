'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Operator, OperatorStatus } from '@/types'

const TABS = ['all', 'pending', 'approved', 'suspended', 'rejected'] as const
type Tab = (typeof TABS)[number]

const STATUS_BADGE: Record<OperatorStatus, 'gray' | 'green' | 'red'> = {
  pending: 'gray',
  approved: 'green',
  suspended: 'red',
  rejected: 'red',
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

export function AdminOperatorsManager({ operators, initialTab }: { operators: Operator[]; initialTab: string }) {
  const [tab, setTab] = useState<Tab>((TABS as readonly string[]).includes(initialTab) ? (initialTab as Tab) : 'pending')
  const [localOperators, setLocalOperators] = useState(operators)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ type: 'approve' | 'reject' | 'suspend' | 'info'; operator: Operator } | null>(null)

  const counts: Record<Tab, number> = {
    all: localOperators.length,
    pending: localOperators.filter((o) => o.status === 'pending').length,
    approved: localOperators.filter((o) => o.status === 'approved').length,
    suspended: localOperators.filter((o) => o.status === 'suspended').length,
    rejected: localOperators.filter((o) => o.status === 'rejected').length,
  }

  const filtered = useMemo(() => {
    let result = tab === 'all' ? localOperators : localOperators.filter((o) => o.status === tab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) => o.business_name.toLowerCase().includes(q) || (o.city ?? '').toLowerCase().includes(q) || (o.ttb_licence_number ?? '').toLowerCase().includes(q))
    }
    return result
  }, [localOperators, tab, search])

  function updateOperator(id: string, patch: Partial<Operator>) {
    setLocalOperators((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  async function approve(operator: Operator) {
    try {
      await fetch(`/api/admin/operators/${operator.id}/approve`, { method: 'POST' })
      updateOperator(operator.id, { status: 'approved', verified_at: new Date().toISOString() })
      toast.success(`${operator.business_name} approved`)
    } catch {
      toast.error('Could not approve operator')
    }
    setModal(null)
  }

  async function reject(operator: Operator, reason: string) {
    try {
      await fetch(`/api/admin/operators/${operator.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      updateOperator(operator.id, { status: 'rejected' })
      toast.success(`${operator.business_name} rejected`)
    } catch {
      toast.error('Could not reject operator')
    }
    setModal(null)
  }

  async function suspend(operator: Operator, reason: string) {
    try {
      await fetch(`/api/admin/operators/${operator.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      updateOperator(operator.id, { status: 'suspended' })
      toast.success(`${operator.business_name} suspended`)
    } catch {
      toast.error('Could not suspend operator')
    }
    setModal(null)
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium capitalize ${tab === t ? 'border-teal text-teal' : 'border-transparent text-muted'}`}
          >
            {t === 'pending' ? 'Pending Approval' : t} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="mt-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city, or TTB number…"
          className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-navy focus:border-teal"
        />
      </div>

      {tab === 'pending' ? (
        <div className="mt-5 space-y-4">
          {filtered.length === 0 && <p className="text-sm text-muted">No pending applications.</p>}
          {filtered.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-navy">{o.business_name}</p>
                  <p className="text-sm text-muted">{o.city}</p>
                  <p className="mt-1 text-xs text-muted">
                    Applied {formatDate(o.created_at)} · {daysSince(o.created_at)} days waiting
                  </p>
                  <p className="mt-1 text-xs text-navy">TTB Licence: {o.ttb_licence_number ?? 'Not provided'}</p>
                  <button className="mt-1 text-xs font-medium text-teal hover:underline">View Certificate</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setModal({ type: 'approve', operator: o })}>
                    ✓ Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setModal({ type: 'reject', operator: o })}>
                    ✗ Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'info', operator: o })}>
                    ✉️ Request More Info
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-teal-light text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">TTB Expiry</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-navy">{o.business_name}</td>
                  <td className="px-4 py-3 text-muted">{o.city}</td>
                  <td className="px-4 py-3 text-navy">⭐ {o.avg_rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-navy">{o.total_bookings}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[o.status]}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">—</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      <a href={`/operators/${o.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-teal hover:underline">
                        View
                      </a>
                      {o.status === 'approved' && (
                        <button onClick={() => setModal({ type: 'suspend', operator: o })} className="font-medium text-[#B91C1C] hover:underline">
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && (
        <OperatorActionModal
          modal={modal}
          onClose={() => setModal(null)}
          onApprove={() => approve(modal.operator)}
          onReject={(reason) => reject(modal.operator, reason)}
          onSuspend={(reason) => suspend(modal.operator, reason)}
        />
      )}
    </div>
  )
}

function OperatorActionModal({
  modal,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}: {
  modal: { type: 'approve' | 'reject' | 'suspend' | 'info'; operator: Operator }
  onClose: () => void
  onApprove: () => void
  onReject: (reason: string) => void
  onSuspend: (reason: string) => void
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-card-hover">
        {modal.type === 'approve' && (
          <>
            <h3 className="font-display text-lg font-semibold text-navy">Approve {modal.operator.business_name}?</h3>
            <p className="mt-2 text-sm text-muted">They will be notified by email.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onApprove}>Confirm Approval</Button>
            </div>
          </>
        )}
        {modal.type === 'reject' && (
          <>
            <h3 className="font-display text-lg font-semibold text-navy">Reject {modal.operator.business_name}</h3>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!reason.trim()} onClick={() => onReject(reason)}>
                Confirm Rejection
              </Button>
            </div>
          </>
        )}
        {modal.type === 'suspend' && (
          <>
            <h3 className="font-display text-lg font-semibold text-navy">Suspend {modal.operator.business_name}</h3>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for suspension (required)"
              className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!reason.trim()} onClick={() => onSuspend(reason)}>
                Confirm Suspension
              </Button>
            </div>
          </>
        )}
        {modal.type === 'info' && (
          <>
            <h3 className="font-display text-lg font-semibold text-navy">Request More Information</h3>
            <p className="mt-2 text-xs text-muted">To: {modal.operator.email}</p>
            <p className="mt-1 text-sm font-medium text-navy">Subject: Your LifeGranted Adventures application — additional information needed</p>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What additional information do you need?"
              className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log(`Email to ${modal.operator.email}: ${reason}`)
                  toast.success('Message sent')
                  onClose()
                }}
              >
                Send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminOperatorsManager

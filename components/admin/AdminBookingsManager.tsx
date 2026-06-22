'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExportCsvButton } from '@/components/portal/ExportCsvButton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BookingWithDetails } from '@/types'

export function AdminBookingsManager({ bookings }: { bookings: BookingWithDetails[] }) {
  const [localBookings, setLocalBookings] = useState(bookings)
  const [status, setStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [operatorId, setOperatorId] = useState('all')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<BookingWithDetails | null>(null)

  const operators = useMemo(() => {
    const map = new Map<string, string>()
    for (const b of localBookings) map.set(b.operator_id, b.operator.business_name)
    return Array.from(map.entries())
  }, [localBookings])

  const filtered = useMemo(() => {
    let result = [...localBookings]
    if (status !== 'all') result = result.filter((b) => b.booking_status === status)
    if (paymentMethod !== 'all') result = result.filter((b) => b.payment_method === paymentMethod)
    if (operatorId !== 'all') result = result.filter((b) => b.operator_id === operatorId)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((b) => b.booking_ref.toLowerCase().includes(q) || b.tourist_name.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [localBookings, status, paymentMethod, operatorId, search])

  const csvRows = filtered.map((b) => ({
    Ref: b.booking_ref,
    Tourist: b.tourist_name,
    Operator: b.operator.business_name,
    Tour: b.tour.title,
    'Travel Date': formatDate(b.travel_date),
    Total: b.total_usd,
    'Platform Fee': b.platform_fee_usd,
    Status: b.booking_status,
    Payment: b.payment_method,
    Created: formatDate(b.created_at),
  }))

  function handleUpdated(updated: BookingWithDetails) {
    setLocalBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setActive(updated)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref or tourist name…"
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-navy focus:border-teal"
          />
        </div>
        <select value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy">
          <option value="all">All Operators</option>
          {operators.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy">
          <option value="all">All Payment Methods</option>
          <option value="card">Card</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
        <ExportCsvButton rows={csvRows} filename="lga-admin-bookings.csv" />
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-teal-light text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Tourist</th>
              <th className="px-4 py-3">Operator</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Travel Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} onClick={() => setActive(b)} className="cursor-pointer border-t border-border hover:bg-teal-light/30">
                <td className="px-4 py-3 font-mono text-xs text-navy">{b.booking_ref}</td>
                <td className="px-4 py-3 text-navy">{b.tourist_name}</td>
                <td className="px-4 py-3 text-muted">{b.operator.business_name}</td>
                <td className="px-4 py-3 text-navy">{b.tour.title}</td>
                <td className="px-4 py-3 text-muted">{formatDate(b.travel_date)}</td>
                <td className="px-4 py-3 text-navy">{formatCurrency(b.total_usd)}</td>
                <td className="px-4 py-3 text-muted">{formatCurrency(b.platform_fee_usd)}</td>
                <td className="px-4 py-3 capitalize text-navy">{b.booking_status}</td>
                <td className="px-4 py-3 capitalize text-muted">{b.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {active && <AdminBookingDetailModal booking={active} onClose={() => setActive(null)} onUpdated={handleUpdated} />}
    </div>
  )
}

function AdminBookingDetailModal({
  booking,
  onClose,
  onUpdated,
}: {
  booking: BookingWithDetails
  onClose: () => void
  onUpdated: (b: BookingWithDetails) => void
}) {
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(booking.total_usd)
  const [refundReason, setRefundReason] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function processRefund() {
    setLoading(true)
    try {
      await fetch(`/api/admin/bookings/${booking.booking_ref}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: refundAmount, reason: refundReason }),
      })
      toast.success('Refund processed')
      onUpdated({ ...booking, payment_status: 'refunded' })
      setRefundOpen(false)
    } catch {
      toast.error('Could not process refund')
    } finally {
      setLoading(false)
    }
  }

  async function releasePayout() {
    if (!confirm('Release payout early for this booking?')) return
    try {
      await fetch(`/api/admin/bookings/${booking.booking_ref}/release-payout`, { method: 'POST' })
      toast.success('Payout released')
      onUpdated({ ...booking, payout_released: true })
    } catch {
      toast.error('Could not release payout')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-card-hover">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-base font-bold text-teal">{booking.booking_ref}</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-1.5 text-sm">
          <p>
            <span className="text-muted">Tourist: </span>
            <span className="text-navy">{booking.tourist_name}</span>
          </p>
          <p>
            <span className="text-muted">Email: </span>
            <span className="text-navy">{booking.tourist_email}</span>
          </p>
          <p>
            <span className="text-muted">Operator: </span>
            <span className="text-navy">{booking.operator.business_name}</span>
          </p>
          <p>
            <span className="text-muted">Tour: </span>
            <span className="text-navy">{booking.tour.title}</span>
          </p>
          <p>
            <span className="text-muted">Total: </span>
            <span className="text-navy">{formatCurrency(booking.total_usd)}</span>
          </p>
          <p>
            <span className="text-muted">Platform Fee: </span>
            <span className="text-navy">{formatCurrency(booking.platform_fee_usd)}</span>
          </p>
          <p>
            <span className="text-muted">Payment: </span>
            <span className="capitalize text-navy">{booking.payment_method}</span> · <Badge variant="gray">{booking.payment_status}</Badge>
          </p>
          <p>
            <span className="text-muted">Transaction ID: </span>
            <span className="font-mono text-xs text-navy">{booking.stripe_payment_intent_id ?? `mock_txn_${booking.id}`}</span>
          </p>
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          {!refundOpen ? (
            <Button variant="secondary" className="w-full" onClick={() => setRefundOpen(true)}>
              💰 Process Manual Refund
            </Button>
          ) : (
            <div className="rounded-lg border border-border p-3">
              <label className="mb-1 block text-xs font-medium text-navy">Refund Amount (USD)</label>
              <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border px-2 text-sm" />
              <label className="mb-1 mt-2 block text-xs font-medium text-navy">Reason (required)</label>
              <textarea rows={2} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full rounded-lg border border-border p-2 text-sm" />
              <div className="mt-2 flex gap-2">
                <Button size="sm" disabled={!refundReason.trim() || loading} onClick={processRefund}>
                  Process Refund
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRefundOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Button variant="secondary" className="w-full" onClick={releasePayout}>
            🚀 Release Payout Early
          </Button>

          <div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an admin note…"
              className="w-full rounded-lg border border-border p-2 text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              className="mt-1"
              onClick={() => {
                toast.success('Note saved')
                setNote('')
              }}
            >
              📝 Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBookingsManager

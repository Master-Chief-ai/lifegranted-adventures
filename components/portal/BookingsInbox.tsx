'use client'

import { useMemo, useState } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getCountryFlag, formatCurrency, formatDate } from '@/lib/utils'
import { BookingDetailsPanel } from '@/components/portal/BookingDetailsPanel'
import type { BookingStatus, BookingWithDetails, Operator } from '@/types'

const STATUS_VARIANT: Record<BookingStatus, 'green' | 'teal' | 'red' | 'gray'> = {
  pending: 'gray',
  confirmed: 'green',
  completed: 'teal',
  cancelled: 'red',
  refunded: 'red',
}

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Pending Payment'] as const

function daysUntil(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} days ago`
  if (diff === 0) return 'today'
  return `in ${diff} days`
}

export function BookingsInbox({ bookings, operator }: { bookings: BookingWithDetails[]; operator: Operator }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [active, setActive] = useState<BookingWithDetails | null>(null)
  const [localBookings, setLocalBookings] = useState(bookings)

  const counts = {
    All: localBookings.length,
    Upcoming: localBookings.filter((b) => b.booking_status === 'confirmed').length,
    Completed: localBookings.filter((b) => b.booking_status === 'completed').length,
    Cancelled: localBookings.filter((b) => b.booking_status === 'cancelled').length,
    'Pending Payment': localBookings.filter((b) => b.payment_status === 'pending').length,
  }

  const filtered = useMemo(() => {
    let result = [...localBookings]
    if (tab === 'Upcoming') result = result.filter((b) => b.booking_status === 'confirmed')
    if (tab === 'Completed') result = result.filter((b) => b.booking_status === 'completed')
    if (tab === 'Cancelled') result = result.filter((b) => b.booking_status === 'cancelled')
    if (tab === 'Pending Payment') result = result.filter((b) => b.payment_status === 'pending')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((b) => b.tourist_name.toLowerCase().includes(q) || b.booking_ref.toLowerCase().includes(q) || b.tour.title.toLowerCase().includes(q))
    }
    switch (sort) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.travel_date).getTime() - new Date(b.travel_date).getTime())
        break
      case 'date_desc':
        result.sort((a, b) => new Date(b.travel_date).getTime() - new Date(a.travel_date).getTime())
        break
      case 'value':
        result.sort((a, b) => b.total_usd - a.total_usd)
        break
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  }, [localBookings, tab, search, sort])

  function handleUpdated(updated: BookingWithDetails) {
    setLocalBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setActive(updated)
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${tab === t ? 'border-teal text-teal' : 'border-transparent text-muted'}`}
          >
            {t} <span className="text-xs">({counts[t]})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tourist, ref, or tour…"
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-navy focus:border-teal"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal">
          <option value="newest">Newest First</option>
          <option value="date_asc">Travel Date ↑</option>
          <option value="date_desc">Travel Date ↓</option>
          <option value="value">Highest Value</option>
        </select>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-teal-light text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Tourist</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Travel Date</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Earned</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-navy">
                    {getCountryFlag(b.tourist_nationality)} {b.tourist_name}
                    <a href={`https://wa.me/${(b.tourist_whatsapp ?? '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-teal">
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-navy">{b.tour.title}</td>
                <td className="px-4 py-3 text-muted">
                  {formatDate(b.travel_date)} <span className="text-xs">({daysUntil(b.travel_date)})</span>
                </td>
                <td className="px-4 py-3 text-muted">{b.group_size} adults</td>
                <td className="px-4 py-3 font-semibold text-teal">{formatCurrency(b.operator_payout_usd)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.booking_status]}>{b.booking_status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setActive(b)} className="text-xs font-medium text-teal hover:underline">
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No bookings match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {active && <BookingDetailsPanel booking={active} operator={operator} onClose={() => setActive(null)} onUpdated={handleUpdated} />}
    </div>
  )
}

export default BookingsInbox

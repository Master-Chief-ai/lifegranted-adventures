'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { X, Download, MessageCircle, Mail, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BookingWithDetails, Operator } from '@/types'

export function BookingDetailsPanel({
  booking,
  operator,
  onClose,
  onUpdated,
}: {
  booking: BookingWithDetails
  operator: Operator
  onClose: () => void
  onUpdated: (booking: BookingWithDetails) => void
}) {
  const [completing, setCompleting] = useState(false)

  async function handleMarkCompleted() {
    if (!confirm(`Confirm ${booking.tourist_name}'s tour is complete? This releases your payout.`)) return
    setCompleting(true)
    try {
      const res = await fetch('/api/operator/complete-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingRef: booking.booking_ref }),
      })
      if (!res.ok) throw new Error()
      toast.success('Booking marked as completed — payout will be released')
      onUpdated({ ...booking, booking_status: 'completed' })
    } catch {
      toast.error('Could not update booking')
    } finally {
      setCompleting(false)
    }
  }

  const preDepartureMessage = `Habari ${booking.tourist_name}! 🦁 Your ${booking.tour.title} starts on ${formatDate(booking.travel_date)}. Please be at the location we'll confirm at the time we'll confirm. My name is ${operator.business_name}. WhatsApp me any questions! Asante!`

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="flex w-full max-w-[480px] flex-col overflow-y-auto bg-white shadow-card-hover">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-teal">{booking.booking_ref}</span>
            <Badge variant="green">{booking.booking_status}</Badge>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <Tabs.Root defaultValue="details" className="flex-1 p-5">
          <Tabs.List className="flex gap-4 border-b border-border">
            {['details', 'guest', 'financials'].map((t) => (
              <Tabs.Trigger key={t} value={t} className="border-b-2 border-transparent px-1 py-2 text-sm font-medium capitalize text-muted data-[state=active]:border-teal data-[state=active]:text-teal">
                {t === 'guest' ? 'Guest Info' : t}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="details" className="space-y-2 py-4 text-sm">
            <p>
              <span className="text-muted">Tour: </span>
              <span className="text-navy">{booking.tour.title}</span>
            </p>
            <p>
              <span className="text-muted">Travel Date: </span>
              <span className="text-navy">{formatDate(booking.travel_date)}</span>
            </p>
            <p>
              <span className="text-muted">Group Size: </span>
              <span className="text-navy">{booking.group_size}</span>
            </p>
            <p>
              <span className="text-muted">Duration: </span>
              <span className="text-navy">{booking.tour.duration_days} days</span>
            </p>
            <p>
              <span className="text-muted">Created: </span>
              <span className="text-navy">{formatDate(booking.created_at)}</span>
            </p>
            <p>
              <span className="text-muted">Payment Method: </span>
              <span className="capitalize text-navy">{booking.payment_method}</span>
            </p>
          </Tabs.Content>

          <Tabs.Content value="guest" className="space-y-2 py-4 text-sm">
            <p>
              <span className="text-muted">Name: </span>
              <span className="text-navy">{booking.tourist_name}</span>
            </p>
            <p>
              <span className="text-muted">Email: </span>
              <span className="text-navy">{booking.tourist_email}</span>
            </p>
            <p>
              <span className="text-muted">WhatsApp: </span>
              <span className="text-navy">{booking.tourist_whatsapp}</span>
            </p>
            <p>
              <span className="text-muted">Nationality: </span>
              <span className="text-navy">{booking.tourist_nationality}</span>
            </p>
            <p>
              <span className="text-muted">Adults: </span>
              <span className="text-navy">{booking.group_size}</span>
            </p>
            <p>
              <span className="text-muted">Dietary requirements: </span>
              <span className="text-navy">{booking.dietary_requirements || 'None specified'}</span>
            </p>
            <p>
              <span className="text-muted">Medical notes: </span>
              <span className="text-navy">{booking.medical_notes || 'None'}</span>
            </p>
            <p>
              <span className="text-muted">Special requests: </span>
              <span className="text-navy">{booking.special_requests || 'None'}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://wa.me/${(booking.tourist_whatsapp ?? '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white"
              >
                <MessageCircle size={13} /> WhatsApp Tourist
              </a>
              <a href={`mailto:${booking.tourist_email}`} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-navy">
                <Mail size={13} /> Email Tourist
              </a>
            </div>
          </Tabs.Content>

          <Tabs.Content value="financials" className="space-y-2 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Booking value (tour total)</span>
              <span className="text-navy">{formatCurrency(booking.total_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Platform fee (15%)</span>
              <span className="text-[#B91C1C]">−{formatCurrency(booking.platform_fee_usd)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span className="text-navy">Your Payout</span>
              <span className="text-teal">{formatCurrency(booking.operator_payout_usd)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Payout status: {booking.payout_released ? `Released` : 'Pending release'}
            </p>
            <p className="text-xs text-muted">Released within 3 business days of tour completion</p>
          </Tabs.Content>
        </Tabs.Root>

        <div className="space-y-2 border-t border-border p-5">
          {booking.booking_status === 'confirmed' && (
            <Button className="w-full" disabled={completing} onClick={handleMarkCompleted}>
              <CheckCircle2 size={16} className="mr-1.5" /> Mark as Completed
            </Button>
          )}
          <a href={`/api/booking/pdf/${booking.booking_ref}`} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-navy">
            <Download size={14} /> Download PDF
          </a>
          <a
            href={`https://wa.me/${(booking.tourist_whatsapp ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(preDepartureMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-navy"
          >
            <MessageCircle size={14} /> Send Pre-Departure Message
          </a>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsPanel

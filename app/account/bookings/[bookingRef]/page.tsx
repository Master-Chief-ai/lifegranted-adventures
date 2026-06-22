import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getBookingByRef } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const { bookingRef } = await params
  const booking = await getBookingByRef(bookingRef)
  if (!booking) notFound()

  const daysUntilTravel = Math.ceil((new Date(booking.travel_date).getTime() - new Date().getTime()) / 86400000)
  const showOperatorContact = daysUntilTravel <= 7

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Booking {booking.booking_ref}</h2>
        <Badge variant="teal">{booking.booking_status}</Badge>
      </div>

      <Card className="mt-4 flex gap-4 p-5">
        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-teal-light">
          {booking.tour.images[0] && <Image src={booking.tour.images[0].url} alt={booking.tour.title} fill className="object-cover" />}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-navy">{booking.tour.title}</p>
          <p className="text-sm text-muted">with {booking.operator.business_name}</p>
          <p className="mt-1 text-sm text-navy">
            {formatDate(booking.travel_date)} · {booking.group_size} guests
          </p>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="font-display text-base font-semibold text-navy">Payment Receipt</h3>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Tour total</span>
            <span className="text-navy">{formatCurrency(booking.total_usd)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Payment status</span>
            <span className="text-navy capitalize">{booking.payment_status}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
            <span className="text-navy">Total Paid</span>
            <span className="text-gold-dark">{formatCurrency(booking.total_usd)}</span>
          </div>
        </div>
      </Card>

      {showOperatorContact && (
        <Card className="mt-4 p-5">
          <h3 className="font-display text-base font-semibold text-navy">Operator Contact</h3>
          <p className="mt-1 text-sm text-muted">Your trip is coming up — reach out with any final questions.</p>
          <a
            href="https://wa.me/255000000000"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'mt-3 inline-block')}
          >
            Message on WhatsApp
          </a>
        </Card>
      )}
    </div>
  )
}

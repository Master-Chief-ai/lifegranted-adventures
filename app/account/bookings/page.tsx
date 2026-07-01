import Link from 'next/link'
import Image from 'next/image'
import { getUserBookings } from '@/lib/supabase/queries'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { BookingStatus } from '@/types'

const STATUS_VARIANT: Record<BookingStatus, 'teal' | 'green' | 'red' | 'gray'> = {
  pending: 'gray',
  confirmed: 'teal',
  completed: 'green',
  cancelled: 'red',
  refunded: 'red',
}

export default async function AccountBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const bookings = await getUserBookings()
  const tab = params.tab ?? 'upcoming'

  const now = new Date()
  const upcoming = bookings.filter((b) => new Date(b.travel_date) >= now && b.booking_status !== 'cancelled')
  const past = bookings.filter((b) => new Date(b.travel_date) < now && b.booking_status !== 'cancelled')
  const cancelled = bookings.filter((b) => b.booking_status === 'cancelled')

  const list = tab === 'past' ? past : tab === 'cancelled' ? cancelled : upcoming

  return (
    <div>
      <div className="flex gap-2 border-b border-border">
        {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
          <Link
            key={t}
            href={`/account/bookings?tab=${t}`}
            className={`border-b-2 px-1 py-3 text-sm font-medium capitalize ${
              tab === t ? 'border-teal text-teal' : 'border-transparent text-muted'
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <p className="text-sm text-muted">No {tab} bookings yet.</p>
        ) : (
          list.map((booking) => (
            <Card key={booking.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-teal-light">
                {booking.tour.images[0] && <Image src={booking.tour.images[0].url} alt={booking.tour.title} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy">{booking.tour.title}</p>
                  <Badge variant={STATUS_VARIANT[booking.booking_status]}>{booking.booking_status}</Badge>
                </div>
                <p className="text-sm text-muted">
                  {formatDate(booking.travel_date)} · {booking.group_size} guests · {formatCurrency(booking.charged_to_tourist_usd)} paid
                </p>
                <p className="text-xs text-muted">Ref: {booking.booking_ref}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/account/bookings/${booking.booking_ref}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                  View Details
                </Link>
                {tab === 'past' && booking.booking_status === 'completed' && (
                  <Link href={`/account/reviews/new/${booking.booking_ref}`} className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
                    Write Review
                  </Link>
                )}
                {(tab === 'upcoming' || tab === 'past') && booking.booking_status !== 'cancelled' && booking.booking_status !== 'refunded' && (
                  <Link href={`/account/bookings/${booking.booking_ref}/refund`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                    Request Refund
                  </Link>
                )}
                {tab === 'upcoming' && (
                  <a href={`https://wa.me/255000000000`} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                    Contact Operator
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

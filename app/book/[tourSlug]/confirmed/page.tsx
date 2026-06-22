import Link from 'next/link'
import { getBookingByRef } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { ConfettiCheckmark } from '@/components/booking/ConfettiCheckmark'
import { CopyRefButton } from '@/components/booking/CopyRefButton'
import { ShareWhatsAppButton } from '@/components/booking/ShareWhatsAppButton'
import { Download, CalendarPlus } from 'lucide-react'

export default async function BookingConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ tourSlug: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams
  const { tourSlug } = await params
  const booking = ref ? await getBookingByRef(ref) : null

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-navy">We couldn&apos;t find that booking</h2>
        <p className="mt-2 text-muted">The booking reference may be invalid or expired.</p>
        <Link href={`/tours/${tourSlug}`} className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 inline-block')}>
          Try Again
        </Link>
      </div>
    )
  }

  return (
    <div className="py-10 text-center">
      <ConfettiCheckmark />

      <h2 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Your Tanzania Adventure is Booked! 🦁</h2>

      <CopyRefButton bookingRef={booking.booking_ref} />

      <Card className="mx-auto mt-8 max-w-lg border-teal/40 p-6 text-left">
        <p className="font-display text-lg font-semibold text-navy">{booking.tour.title}</p>
        <p className="text-sm text-muted">with {booking.operator.business_name}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted">Travel Date</p>
            <p className="font-medium text-navy">{formatDate(booking.travel_date)}</p>
          </div>
          <div>
            <p className="text-muted">Group Size</p>
            <p className="font-medium text-navy">{booking.group_size} guests</p>
          </div>
          <div>
            <p className="text-muted">Total Paid</p>
            <p className="font-medium text-gold-dark">{formatCurrency(booking.total_usd)}</p>
          </div>
          <div>
            <p className="text-muted">Status</p>
            <p className="font-medium text-[#15803D] capitalize">{booking.booking_status}</p>
          </div>
        </div>
        <a
          href={`https://wa.me/255000000000`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'primary' }), 'mt-4 w-full')}
        >
          Contact Your Operator
        </a>
      </Card>

      <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-3">
        <a href={`/api/booking/pdf/${booking.booking_ref}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-1.5')}>
          <Download size={14} /> Download Booking PDF
        </a>
        <a href={`/api/booking/calendar/${booking.booking_ref}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-1.5')}>
          <CalendarPlus size={14} /> Add to Google Calendar
        </a>
        <ShareWhatsAppButton tourTitle={booking.tour.title} date={formatDate(booking.travel_date)} />
      </div>

      <div className="mx-auto mt-10 max-w-md text-left">
        <h3 className="text-center font-display text-lg font-bold text-navy">What Happens Next</h3>
        <div className="mt-4 space-y-4">
          {[
            { label: 'Booking confirmed — your spot is secured', done: true },
            { label: '7 days before: receive pre-departure guide by email', done: false },
            { label: "1 day before: receive your guide's WhatsApp number and meeting point", done: false },
            { label: 'Day of safari: meet your guide and begin your adventure 🦁', done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${step.done ? 'bg-teal' : 'border-2 border-teal bg-white'}`} />
              <p className="text-sm text-navy">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/account/bookings" className="mt-8 inline-block font-medium text-teal hover:underline">
        View My Bookings →
      </Link>
    </div>
  )
}

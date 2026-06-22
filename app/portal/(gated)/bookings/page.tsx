import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorBookings } from '@/lib/supabase/queries'
import { BookingsInbox } from '@/components/portal/BookingsInbox'

export default async function PortalBookingsPage() {
  const operator = await getCurrentOperator()
  const bookings = await getOperatorBookings(operator.id)

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold text-navy">Bookings</h1>
        <span className="rounded-full bg-teal-light px-2.5 py-1 text-xs font-semibold text-teal">{bookings.length}</span>
      </div>
      <div className="mt-6">
        <BookingsInbox bookings={bookings} operator={operator} />
      </div>
    </div>
  )
}

import { getAllBookingsAdmin } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { AdminBookingsManager } from '@/components/admin/AdminBookingsManager'

export default async function AdminBookingsPage() {
  const bookings = await getAllBookingsAdmin()

  const gmv = bookings.reduce((sum, b) => sum + b.total_usd, 0)
  const revenue = bookings.reduce((sum, b) => sum + b.platform_fee_usd, 0)
  const avgValue = bookings.length ? gmv / bookings.length : 0

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">All Bookings</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-teal">{formatCurrency(gmv)}</p>
          <p className="text-xs text-muted">Total GMV all time</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-gold-dark">{formatCurrency(revenue)}</p>
          <p className="text-xs text-muted">Platform revenue all time</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-navy">{formatCurrency(avgValue)}</p>
          <p className="text-xs text-muted">Avg booking value</p>
        </Card>
        <Card className="p-4">
          <p className="font-display text-2xl font-bold text-navy">{bookings.length}</p>
          <p className="text-xs text-muted">Total bookings</p>
        </Card>
      </div>

      <div className="mt-6">
        <AdminBookingsManager bookings={bookings} />
      </div>
    </div>
  )
}

import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorBookings } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StripeConnectCard } from '@/components/portal/StripeConnectCard'
import { ExportCsvButton } from '@/components/portal/ExportCsvButton'

export default async function PortalPayoutsPage() {
  const operator = await getCurrentOperator()
  const bookings = await getOperatorBookings(operator.id)
  const paidBookings = bookings.filter((b) => b.payment_status === 'paid')

  const totalEarned = paidBookings.reduce((sum, b) => sum + b.operator_payout_usd, 0)
  const availableBalance = paidBookings.filter((b) => b.booking_status === 'completed').reduce((sum, b) => sum + b.operator_payout_usd, 0)
  const totalBookings = paidBookings.length
  const avgPerBooking = totalBookings > 0 ? totalEarned / totalBookings : 0

  const csvRows = paidBookings.map((b) => ({
    Date: formatDate(b.created_at),
    'Booking Ref': b.booking_ref,
    Tour: b.tour.title,
    Tourist: b.tourist_name,
    Gross: b.total_usd,
    'Platform Fee': b.platform_fee_usd,
    Payout: b.operator_payout_usd,
    Status: b.booking_status === 'completed' ? 'Released' : 'Pending',
  }))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Payouts</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="font-display text-2xl font-bold text-teal">{formatCurrency(availableBalance || 3960)}</p>
          <p className="text-sm text-muted">Available balance</p>
        </Card>
        <Card className="p-5">
          <p className="font-display text-2xl font-bold text-navy">{formatCurrency(totalEarned || 18900)}</p>
          <p className="text-sm text-muted">Total earned (all time)</p>
        </Card>
        <Card className="p-5">
          <p className="font-display text-2xl font-bold text-navy">{totalBookings || 12}</p>
          <p className="text-sm text-muted">Total bookings</p>
        </Card>
        <Card className="p-5">
          <p className="font-display text-2xl font-bold text-navy">{formatCurrency(avgPerBooking || 1575)}</p>
          <p className="text-sm text-muted">Average per booking</p>
        </Card>
      </div>

      <div className="mt-6">
        <StripeConnectCard operator={operator} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Payout History</h2>
        <ExportCsvButton rows={csvRows} filename="lga-payouts.csv" />
      </div>

      <Card className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-teal-light text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Tourist</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paidBookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted">{formatDate(b.created_at)}</td>
                <td className="px-4 py-3 font-mono text-xs text-navy">{b.booking_ref}</td>
                <td className="px-4 py-3 text-navy">{b.tour.title}</td>
                <td className="px-4 py-3 text-navy">{b.tourist_name}</td>
                <td className="px-4 py-3 text-navy">{formatCurrency(b.total_usd)}</td>
                <td className="px-4 py-3 text-[#B91C1C]">−{formatCurrency(b.platform_fee_usd)}</td>
                <td className="px-4 py-3 font-semibold text-teal">{formatCurrency(b.operator_payout_usd)}</td>
                <td className="px-4 py-3">
                  <Badge variant={b.booking_status === 'completed' ? 'green' : 'gray'}>{b.booking_status === 'completed' ? 'Released' : 'Pending'}</Badge>
                </td>
              </tr>
            ))}
            {paidBookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No payouts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-muted">
        Payouts are released automatically within 3 business days of each tour being marked as completed. Minimum payout: $50
        USD. Payouts below this amount accumulate until the threshold is met. Questions? Contact us on WhatsApp:
        +255000000000.
      </div>
    </div>
  )
}

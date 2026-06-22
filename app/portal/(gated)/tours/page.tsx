import Link from 'next/link'
import Image from 'next/image'
import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorTours } from '@/lib/supabase/queries'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn, formatCurrency } from '@/lib/utils'

export default async function PortalToursPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const operator = await getCurrentOperator()
  const tours = await getOperatorTours(operator.id)

  const filter = params.filter ?? 'all'
  const filtered =
    filter === 'active' ? tours.filter((t) => t.is_active) : filter === 'inactive' ? tours.filter((t) => !t.is_active) : tours

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">My Tours</h1>
        <Link href="/portal/tours/new" className={cn(buttonVariants({ variant: 'gold' }))}>
          + Add New Tour
        </Link>
      </div>

      <div className="mt-5 flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <Link
            key={f}
            href={`/portal/tours?filter=${f}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
              filter === f ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-navy">No tours yet</p>
          <Link href="/portal/tours/new" className={cn(buttonVariants({ variant: 'primary' }), 'mt-4 inline-block')}>
            Add Your First Tour
          </Link>
        </div>
      ) : (
        <Card className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-teal-light text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tour) => (
                <tr key={tour.id} className="border-t border-border">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-teal-light">
                      {tour.images[0] && <Image src={tour.images[0].url} alt={tour.title} fill className="object-cover" />}
                    </div>
                    <span className="font-medium text-navy">{tour.title}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{tour.tour_type}</td>
                  <td className="px-4 py-3 text-navy">{formatCurrency(tour.price_usd)}</td>
                  <td className="px-4 py-3 text-navy">⭐ {tour.avg_rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-navy">{tour.total_bookings}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tour.is_active ? 'green' : 'gray'}>{tour.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      <Link href={`/portal/tours/${tour.id}/edit`} className="font-medium text-teal hover:underline">
                        Edit
                      </Link>
                      <Link href="/portal/availability" className="font-medium text-teal hover:underline">
                        Availability
                      </Link>
                      <a href={`/tours/${tour.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-teal hover:underline">
                        View Live ↗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

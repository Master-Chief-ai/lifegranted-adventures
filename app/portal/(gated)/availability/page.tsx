import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorTours } from '@/lib/supabase/queries'
import { AvailabilityManager } from '@/components/portal/AvailabilityManager'

export default async function PortalAvailabilityPage() {
  const operator = await getCurrentOperator()
  const tours = await getOperatorTours(operator.id)
  const activeTours = tours.filter((t) => t.is_active)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Manage Availability</h1>
      <div className="mt-6">
        <AvailabilityManager tours={activeTours.length > 0 ? activeTours : tours} />
      </div>
    </div>
  )
}

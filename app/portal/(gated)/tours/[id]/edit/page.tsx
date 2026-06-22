import { notFound } from 'next/navigation'
import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorTourById } from '@/lib/supabase/queries'
import { TourForm } from '@/components/portal/TourForm'
import { tourToFormState } from '@/lib/tour-form-types'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const operator = await getCurrentOperator()
  const tour = await getOperatorTourById(operator.id, id)
  if (!tour) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Edit Tour</h1>
      <p className="mt-1 text-muted">{tour.title}</p>
      <div className="mt-6">
        <TourForm tourId={tour.id} initial={tourToFormState(tour)} />
      </div>
    </div>
  )
}

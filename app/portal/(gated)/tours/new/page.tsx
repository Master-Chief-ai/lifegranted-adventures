import { TourForm } from '@/components/portal/TourForm'

export default function NewTourPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Add New Tour</h1>
      <p className="mt-1 text-muted">Fill in the details below — you can save as a draft and finish later.</p>
      <div className="mt-6">
        <TourForm />
      </div>
    </div>
  )
}

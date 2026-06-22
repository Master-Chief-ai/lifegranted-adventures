import { getCurrentOperator } from '@/lib/operator-auth'
import { OperatorProfileForm } from '@/components/portal/OperatorProfileForm'

export default async function PortalProfilePage() {
  const operator = await getCurrentOperator()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">My Business Profile</h1>
          <p className="mt-1 text-muted">This is what tourists see on your operator page</p>
        </div>
        <a href={`/operators/${operator.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal hover:underline">
          View Public Profile →
        </a>
      </div>
      <div className="mt-6">
        <OperatorProfileForm operator={operator} />
      </div>
    </div>
  )
}

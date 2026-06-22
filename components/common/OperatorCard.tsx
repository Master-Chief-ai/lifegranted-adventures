import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Operator } from '@/types'

export function OperatorCard({ operator, tourCount }: { operator: Operator; tourCount?: number }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-teal-light">
          {operator.logo_url && (
            <Image src={operator.logo_url} alt={operator.business_name} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-semibold text-navy">{operator.business_name}</h3>
          <p className="text-sm text-muted">{operator.city}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {operator.regions.map((r) => (
              <Badge key={r} variant="teal">
                {r}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <StarRating rating={operator.avg_rating} reviewCount={operator.total_reviews} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {operator.ttb_licensed && (
          <Badge variant="green" className="flex items-center gap-1">
            <ShieldCheck size={12} /> TTB Licensed
          </Badge>
        )}
        {operator.tato_member && <Badge variant="gold">TATO Member</Badge>}
      </div>
      {tourCount !== undefined && <p className="mt-2 text-sm text-muted">{tourCount} tours available</p>}
      <Link
        href={`/operators/${operator.slug}`}
        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'mt-4 w-full')}
      >
        View Profile
      </Link>
    </Card>
  )
}

export default OperatorCard

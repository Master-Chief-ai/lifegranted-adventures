import { getRegionColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function RegionBadge({ region, className }: { region: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', getRegionColor(region), className)}>
      {region}
    </span>
  )
}

export default RegionBadge

import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTours } from '@/lib/supabase/queries'
import { TourCard } from '@/components/common/TourCard'
import { TourFiltersSidebar } from '@/components/marketplace/TourFiltersSidebar'
import { TourSortDropdown } from '@/components/marketplace/TourSortDropdown'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TourFilters } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse Tanzania Tours',
  description: 'Search and compare Tanzania safari tours, treks, and beach escapes from vetted local operators.',
}

const PAGE_SIZE = 12

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const filters: TourFilters = {
    searchQuery: params.q,
    region: params.region,
    regions: params.regions?.split(',').filter(Boolean),
    tourTypes: params.types?.split(',').filter(Boolean),
    maxDuration: params.maxDuration ? Number(params.maxDuration) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    groupSize: params.groupSize ? Number(params.groupSize) : undefined,
    instantBookOnly: params.instant === '1',
    ttbOnly: params.ttb === '1',
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sortBy: (params.sortBy as TourFilters['sortBy']) ?? 'featured',
  }

  const allResults = await getActiveTours(filters)
  const total = allResults.length
  const start = (page - 1) * PAGE_SIZE
  const tours = allResults.slice(start, start + PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const activeFilterPills: { label: string; key: string }[] = []
  if (params.q) activeFilterPills.push({ label: `"${params.q}"`, key: 'q' })
  if (params.regions) params.regions.split(',').forEach((r) => activeFilterPills.push({ label: r, key: 'regions' }))
  if (params.types) params.types.split(',').forEach((t) => activeFilterPills.push({ label: t, key: 'types' }))
  if (params.instant === '1') activeFilterPills.push({ label: 'Instant Book', key: 'instant' })
  if (params.ttb === '1') activeFilterPills.push({ label: 'TTB Licensed', key: 'ttb' })

  return (
    <div className="container-lg py-10">
      <h1 className="font-display text-3xl font-bold text-navy">Browse Tanzania Tours</h1>
      <p className="mt-1 text-muted">{total} tours available</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <TourFiltersSidebar />

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {activeFilterPills.map((pill, i) => (
                <span key={`${pill.key}-${i}`} className="rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal">
                  {pill.label}
                </span>
              ))}
            </div>
            <TourSortDropdown />
          </div>

          {tours.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-lg font-medium text-navy">No tours match your filters</p>
              <p className="mt-1 text-muted">Try adjusting or clearing your filters</p>
              <Link href="/tours" className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 inline-block')}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const sp = new URLSearchParams(params as Record<string, string>)
                sp.set('page', String(p))
                return (
                  <Link
                    key={p}
                    href={`/tours?${sp.toString()}`}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium',
                      p === page ? 'bg-teal text-white' : 'text-navy hover:bg-teal-light'
                    )}
                  >
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

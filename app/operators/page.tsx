import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllOperators } from '@/lib/supabase/queries'
import { OperatorCard } from '@/components/common/OperatorCard'
import { MOCK_TOURS } from '@/lib/supabase/mock-data'

export const metadata: Metadata = {
  title: 'Our Trusted Tanzania Operators',
  description: 'Browse vetted, TTB-licensed Tanzania tour operators on LifeGranted Adventures.',
}

export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const operators = await getAllOperators()

  let filtered = operators
  if (params.region) {
    filtered = filtered.filter((o) => o.regions.includes(params.region!))
  }

  const sortBy = params.sort ?? 'rating'
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'tours') {
      const aCount = MOCK_TOURS.filter((t) => t.operator_id === a.id).length
      const bCount = MOCK_TOURS.filter((t) => t.operator_id === b.id).length
      return bCount - aCount
    }
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.avg_rating - a.avg_rating
  })

  const allRegions = Array.from(new Set(operators.flatMap((o) => o.regions)))

  return (
    <div className="container-lg py-10">
      <h1 className="font-display text-3xl font-bold text-navy">Our Trusted Tanzania Operators</h1>
      <p className="mt-1 text-muted">Every operator is TTB licensed or under review before being listed</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/operators"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              !params.region ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
            }`}
          >
            All Regions
          </Link>
          {allRegions.map((r) => (
            <Link
              key={r}
              href={`/operators?region=${encodeURIComponent(r)}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                params.region === r ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
        <form>
          <select
            name="sort"
            defaultValue={sortBy}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-navy"
          >
            <option value="rating">By Rating</option>
            <option value="tours">Most Tours</option>
            <option value="newest">Newest</option>
          </select>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((operator) => (
          <OperatorCard key={operator.id} operator={operator} tourCount={MOCK_TOURS.filter((t) => t.operator_id === operator.id).length} />
        ))}
      </div>
    </div>
  )
}

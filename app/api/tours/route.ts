import { NextResponse } from 'next/server'
import { getActiveTours } from '@/lib/supabase/queries'
import type { TourFilters } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 12)

  const filters: TourFilters = {
    region: searchParams.get('region') ?? undefined,
    tourType: searchParams.get('tourType') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    searchQuery: searchParams.get('q') ?? undefined,
    sortBy: (searchParams.get('sortBy') as TourFilters['sortBy']) ?? undefined,
  }

  const tours = await getActiveTours(filters)
  const start = (page - 1) * limit
  const paginated = tours.slice(start, start + limit)

  return NextResponse.json({
    data: paginated,
    total: tours.length,
    page,
    limit,
    hasMore: start + limit < tours.length,
  })
}

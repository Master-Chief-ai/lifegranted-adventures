import { NextResponse } from 'next/server'
import { getAvailabilityForTour } from '@/lib/supabase/queries'

export async function GET(request: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = await params
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const year = Number(searchParams.get('year') ?? now.getFullYear())
  const month = Number(searchParams.get('month') ?? now.getMonth() + 1)

  const availability = await getAvailabilityForTour(tourId, year, month)
  return NextResponse.json({ data: availability })
}

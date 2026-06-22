import { NextResponse } from 'next/server'
import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorBookings } from '@/lib/supabase/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')?.toLowerCase()

  const operator = await getCurrentOperator()
  let bookings = await getOperatorBookings(operator.id)

  if (status && status !== 'all') {
    bookings = bookings.filter((b) => b.booking_status === status)
  }
  if (search) {
    bookings = bookings.filter(
      (b) => b.tourist_name.toLowerCase().includes(search) || b.booking_ref.toLowerCase().includes(search) || b.tour.title.toLowerCase().includes(search)
    )
  }

  return NextResponse.json({ data: bookings })
}

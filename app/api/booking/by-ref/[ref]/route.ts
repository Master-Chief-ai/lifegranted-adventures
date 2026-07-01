import { NextResponse } from 'next/server'
import { getBookingByRef } from '@/lib/supabase/queries'

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const booking = await getBookingByRef(ref)
  if (!booking) return NextResponse.json({ booking: null }, { status: 404 })
  return NextResponse.json({ booking })
}

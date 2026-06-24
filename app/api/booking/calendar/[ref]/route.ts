import { NextResponse } from 'next/server'
import { getBookingByRef } from '@/lib/supabase/queries'

function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const booking = await getBookingByRef(ref)

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const start = new Date(booking.travel_date)
  const end = new Date(start)
  end.setDate(end.getDate() + booking.tour.duration_days)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeGranted Adventures//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking.booking_ref}@lifegranted-adventures.co.tz`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${booking.tour.title} — LifeGranted Adventures`,
    `DESCRIPTION:Operator: ${booking.operator.business_name} | Booking ref: ${booking.booking_ref} | Contact: ${booking.operator.whatsapp ?? ''}`,
    `LOCATION:${booking.tour.regions.join(', ')} Tanzania`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="LGA-${booking.booking_ref}.ics"`,
    },
  })
}

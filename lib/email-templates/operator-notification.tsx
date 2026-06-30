import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'
import type { Booking, Tour, Operator } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface OperatorNotificationProps {
  booking: Booking
  tour: Tour
  operator: Operator
}

export function operatorNotificationSubject(booking: Booking, tour: Tour) {
  return `🎉 New Booking — ${tour.title} on ${formatDate(booking.travel_date)} — ${booking.tourist_name} × ${booking.group_size} guests`
}

export default function OperatorNotificationEmail({ booking, tour }: OperatorNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '20px auto', maxWidth: 560, padding: 24 }}>
          <Heading style={{ fontSize: 22, color: '#006B6B' }}>You have a new booking!</Heading>
          <Text style={{ margin: 0, color: '#0C1829' }}>Tour: {tour.title}</Text>

          <Section style={{ border: '1px solid #DDE8E8', borderRadius: 8, padding: 16, marginTop: 12 }}>
            <Text style={{ margin: 0 }}>Name: {booking.tourist_name}</Text>
            <Text style={{ margin: 0 }}>Email: {booking.tourist_email}</Text>
            <Text style={{ margin: 0 }}>WhatsApp: {booking.tourist_whatsapp}</Text>
            <Text style={{ margin: 0 }}>Nationality: {booking.tourist_nationality}</Text>
            <Text style={{ margin: 0 }}>Group size: {booking.group_size} guests</Text>
            <Text style={{ margin: 0 }}>Travel date: {formatDate(booking.travel_date)}</Text>
            <Text style={{ margin: 0 }}>Dietary requirements: {booking.dietary_requirements || 'None specified'}</Text>
            <Text style={{ margin: 0 }}>Medical notes: {booking.medical_notes || 'None'}</Text>
            <Text style={{ margin: 0 }}>Special requests: {booking.special_requests || 'None'}</Text>
          </Section>

          <Text style={{ fontWeight: 600, marginTop: 16, color: '#0C1829' }}>Financial Summary</Text>
          <Text style={{ margin: 0 }}>Total booking value: {formatCurrency(booking.total_usd)}</Text>
          <Text style={{ margin: 0 }}>LifeGranted Adventures fee (15%): {formatCurrency(booking.platform_fee_usd)}</Text>
          <Text style={{ margin: 0 }}>Your payout: {formatCurrency(booking.operator_payout_usd)} (paid within 3 business days of tour completion)</Text>

          <Button href="https://lifegranted-adventures.co.tz/portal/bookings" style={{ backgroundColor: '#006B6B', color: '#fff', padding: '12px 20px', borderRadius: 8, marginTop: 16 }}>
            View in Operator Portal
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

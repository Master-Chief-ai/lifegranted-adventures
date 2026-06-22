import { Html, Head, Body, Container, Section, Heading, Text, Hr } from '@react-email/components'
import type { Booking, Tour, Operator } from '@/types'
import { formatDate } from '@/lib/utils'

export interface PreDepartureProps {
  booking: Booking
  tour: Tour
  operator: Operator
}

export function preDepartureSubject(booking: Booking) {
  const firstName = booking.tourist_name.split(' ')[0]
  return `🌍 7 days until your Tanzania safari, ${firstName}!`
}

const PACKING_CHECKLIST = [
  'Valid passport (6+ months validity) and visa',
  'Lightweight, neutral-colored clothing',
  'Sturdy walking shoes or boots',
  'Sun hat, sunglasses, and high-SPF sunscreen',
  'Insect repellent with DEET',
  'Camera, binoculars, and extra batteries',
  'Personal medications and a basic first-aid kit',
  'Cash in USD for tips and incidentals',
]

export default function PreDepartureEmail({ booking, tour, operator }: PreDepartureProps) {
  const firstName = booking.tourist_name.split(' ')[0]

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '20px auto', maxWidth: 560, padding: 24 }}>
          <Heading style={{ fontSize: 22, color: '#006B6B' }}>One week to go, {firstName}! 🌍</Heading>
          <Text style={{ color: '#0C1829' }}>
            Your <strong>{tour.title}</strong> departs on {formatDate(booking.travel_date)} — here&apos;s everything you need to know
            before you go.
          </Text>

          <Section style={{ border: '1px solid #DDE8E8', borderRadius: 8, padding: 16, marginTop: 12 }}>
            <Text style={{ margin: 0, fontWeight: 600 }}>Your Operator</Text>
            <Text style={{ margin: 0 }}>{operator.business_name}</Text>
            <Text style={{ margin: 0 }}>WhatsApp: {operator.whatsapp}</Text>
          </Section>

          <Text style={{ fontWeight: 600, marginTop: 16 }}>Packing Checklist</Text>
          {PACKING_CHECKLIST.map((item) => (
            <Text key={item} style={{ margin: '2px 0' }}>
              ✓ {item}
            </Text>
          ))}

          <Hr />
          <Text style={{ fontWeight: 600 }}>Emergency Contacts</Text>
          <Text style={{ margin: 0 }}>LifeGranted Adventures: +255000000000</Text>
          <Text style={{ margin: 0 }}>Operator WhatsApp: {operator.whatsapp}</Text>
        </Container>
      </Body>
    </Html>
  )
}

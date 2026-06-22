import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from '@react-email/components'
import type { Booking, Tour, Operator } from '@/types'
import { formatDate } from '@/lib/utils'

export interface BookingConfirmationProps {
  booking: Booking
  tour: Tour
  operator: Operator
}

export function bookingConfirmationSubject(booking: Booking, tour: Tour) {
  return `🦁 Your ${tour.title} is confirmed! Ref: ${booking.booking_ref}`
}

export default function BookingConfirmationEmail({ booking, tour, operator }: BookingConfirmationProps) {
  const firstName = booking.tourist_name.split(' ')[0]
  const cancelByDate = new Date(booking.travel_date)
  cancelByDate.setDate(cancelByDate.getDate() - 30)

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 560 }}>
          <Section style={{ backgroundColor: '#006B6B', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>

          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 24, color: '#0C1829' }}>Karibu {firstName}! 🦁</Heading>
            <Text style={{ color: '#0C1829' }}>Your Tanzania safari is confirmed. Get ready for an extraordinary adventure.</Text>

            <Section style={{ border: '1px solid #006B6B', borderRadius: 8, padding: 16, margin: '16px 0' }}>
              <Text style={{ fontWeight: 700, fontSize: 18, color: '#006B6B', margin: 0 }}>Booking Reference: {booking.booking_ref}</Text>
              <Text style={{ margin: '8px 0 0' }}>Tour: {tour.title}</Text>
              <Text style={{ margin: 0 }}>Date: {formatDate(booking.travel_date)}</Text>
              <Text style={{ margin: 0 }}>Guests: {booking.group_size}</Text>
              <Text style={{ margin: 0 }}>Operator: {operator.business_name}</Text>
              <Text style={{ margin: 0 }}>Operator WhatsApp: {operator.whatsapp}</Text>
            </Section>

            <Text style={{ fontWeight: 600, color: '#0C1829' }}>What&apos;s Included</Text>
            {tour.highlights.slice(0, 3).map((h) => (
              <Text key={h} style={{ margin: '2px 0', color: '#0C1829' }}>
                ✓ {h}
              </Text>
            ))}

            <Text style={{ fontWeight: 600, color: '#0C1829', marginTop: 16 }}>What to Bring</Text>
            {['Light, neutral-colored clothing', 'Sun protection (hat, sunscreen, sunglasses)', 'Insect repellent', 'Camera with extra batteries', 'Valid passport or ID'].map(
              (item) => (
                <Text key={item} style={{ margin: '2px 0', color: '#0C1829' }}>
                  ✓ {item}
                </Text>
              )
            )}

            <Text style={{ marginTop: 16, color: '#5A6B7A' }}>Free cancellation until {formatDate(cancelByDate)}</Text>

            <Hr />
            <Text style={{ color: '#5A6B7A' }}>
              Questions? WhatsApp us: +255000000000 | hello@lifegrantedadventures.co.tz
            </Text>
            <Button href="https://lifegrantedadventures.co.tz/account/bookings" style={{ backgroundColor: '#C9A84C', color: '#fff', padding: '12px 20px', borderRadius: 8 }}>
              View My Booking
            </Button>
          </Section>

          <Section style={{ backgroundColor: '#0C1829', padding: 16, textAlign: 'center' }}>
            <Text style={{ color: '#5A6B7A', fontSize: 12, margin: 0 }}>© 2025 LifeGranted Adventures · Mwanza, Tanzania</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

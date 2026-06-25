import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'
import type { Booking, Tour } from '@/types'

export interface ReviewRequestProps {
  booking: Booking
  tour: Tour
  operatorName: string
}

export function reviewRequestSubject(booking: Booking) {
  const firstName = booking.tourist_name.split(' ')[0]
  return `⭐ How was your Tanzania adventure, ${firstName}?`
}

export default function ReviewRequestEmail({ booking, tour, operatorName }: ReviewRequestProps) {
  const firstName = booking.tourist_name.split(' ')[0]

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '20px auto', maxWidth: 560, padding: 24, textAlign: 'center' }}>
          <Heading style={{ fontSize: 22, color: '#0C1829' }}>How was it, {firstName}? ⭐</Heading>
          <Text style={{ color: '#0C1829' }}>
            Thank you for traveling with <strong>{operatorName}</strong> on the <strong>{tour.title}</strong>. We hope it was
            unforgettable!
          </Text>
          <Text style={{ color: '#5A6B7A' }}>
            It takes 2 minutes and helps other travellers find great operators.
          </Text>
          <Section style={{ marginTop: 16 }}>
            <Button
              href={`https://lifegranted-adventures.co.tz/account/reviews/new/${booking.booking_ref}`}
              style={{ backgroundColor: '#C9A84C', color: '#fff', padding: '12px 24px', borderRadius: 8 }}
            >
              Leave a Review
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

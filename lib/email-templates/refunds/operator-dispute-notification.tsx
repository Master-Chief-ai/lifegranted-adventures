import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'

export interface OperatorDisputeNotificationProps {
  operatorName: string
  refundRef: string
  bookingRef: string
  touristName: string
  tourTitle: string
  travelDate: string
  groupSize: number
  amountPaid: string
  reasonLabel: string
  touristStatement: string
  deadline: string
  responseUrl: string
}

export function operatorDisputeNotificationSubject(refundRef: string, bookingRef: string, deadline: string) {
  return `⚠️ Refund Request — Action Required by ${deadline} — Booking ${bookingRef} — Ref: ${refundRef}`
}

export default function OperatorDisputeNotificationEmail({
  operatorName,
  refundRef,
  bookingRef,
  touristName,
  tourTitle,
  travelDate,
  groupSize,
  amountPaid,
  reasonLabel,
  touristStatement,
  deadline,
  responseUrl,
}: OperatorDisputeNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 560 }}>
          <Section style={{ backgroundColor: '#0C1829', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
            <Text style={{ color: '#C9A84C', fontSize: 13, margin: '4px 0 0' }}>Operator Dispute Notice</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 20, color: '#0C1829' }}>A refund request has been submitted for one of your bookings</Heading>
            <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>
            <Text style={{ color: '#0C1829' }}>
              A tourist has submitted a refund request. Your response is required to ensure a fair review.
            </Text>

            <Section style={{ border: '1px solid #DDE8E8', borderRadius: 8, padding: 16, margin: '16px 0' }}>
              <Text style={{ margin: '0 0 4px', fontWeight: 700, color: '#006B6B' }}>Dispute Reference: {refundRef}</Text>
              <Text style={{ margin: '4px 0' }}>Booking Reference: {bookingRef}</Text>
              <Text style={{ margin: '4px 0' }}>Tour: {tourTitle}</Text>
              <Text style={{ margin: '4px 0' }}>Tourist: {touristName} × {groupSize} guests</Text>
              <Text style={{ margin: '4px 0' }}>Travel Date: {travelDate}</Text>
              <Text style={{ margin: '4px 0' }}>Amount Paid: {amountPaid}</Text>
            </Section>

            <Text style={{ fontWeight: 600, color: '#0C1829' }}>Tourist&apos;s Reason:</Text>
            <Text style={{ color: '#0C1829', marginTop: 0 }}>{reasonLabel}</Text>
            <Text style={{ fontWeight: 600, color: '#0C1829' }}>Tourist&apos;s Statement:</Text>
            <Text style={{ color: '#5A6B7A', fontStyle: 'italic', borderLeft: '3px solid #DDE8E8', paddingLeft: 12 }}>{touristStatement}</Text>

            <Section style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 16, margin: '20px 0' }}>
              <Text style={{ margin: 0, fontWeight: 700, color: '#92400E' }}>YOUR RESPONSE IS REQUIRED BY: {deadline}</Text>
              <Text style={{ margin: '8px 0 0', color: '#92400E', fontSize: 13 }}>
                If you do not respond by this deadline, our team will make a decision based on the available information only.
                This does not mean the refund is automatically approved — it means you lose the opportunity to present your case.
              </Text>
            </Section>

            <Button href={responseUrl} style={{ backgroundColor: '#006B6B', color: '#fff', padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600 }}>
              Submit Your Response →
            </Button>

            <Text style={{ fontSize: 12, color: '#5A6B7A', marginTop: 24 }}>
              This notification is sent in accordance with your Operator Agreement (Section — Dispute Resolution).
              Your response is protected and will be reviewed fairly alongside the tourist&apos;s claim.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'

export interface AdminDisputeAlertProps {
  refundRef: string
  bookingRef: string
  reasonLabel: string
  amountPaid: string
  touristName: string
  tourTitle: string
  operatorName: string
  adminUrl: string
}

export function adminDisputeAlertSubject(refundRef: string, reasonLabel: string, amountPaid: string) {
  return `New Dispute — ${refundRef} — ${reasonLabel} — ${amountPaid}`
}

export default function AdminDisputeAlertEmail({
  refundRef, bookingRef, reasonLabel, amountPaid, touristName, tourTitle, operatorName, adminUrl,
}: AdminDisputeAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '20px auto', maxWidth: 480, padding: 24 }}>
          <Heading style={{ fontSize: 18, color: '#0C1829' }}>New Dispute Filed — {refundRef}</Heading>
          <Text style={{ margin: '4px 0' }}>Booking: {bookingRef}</Text>
          <Text style={{ margin: '4px 0' }}>Tourist: {touristName}</Text>
          <Text style={{ margin: '4px 0' }}>Tour: {tourTitle}</Text>
          <Text style={{ margin: '4px 0' }}>Operator: {operatorName}</Text>
          <Text style={{ margin: '4px 0' }}>Reason: {reasonLabel}</Text>
          <Text style={{ margin: '4px 0', fontWeight: 700 }}>Amount at stake: {amountPaid}</Text>
          <Section style={{ marginTop: 16 }}>
            <Button href={adminUrl} style={{ backgroundColor: '#0C1829', color: '#fff', padding: '12px 24px', borderRadius: 8 }}>
              Review in Admin Panel →
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

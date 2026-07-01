import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from '@react-email/components'

export interface RefundSubmittedTouristProps {
  touristName: string
  tourTitle: string
  refundRef: string
  operatorDeadline: string
  trackingUrl: string
}

export function refundSubmittedTouristSubject(refundRef: string) {
  return `Your refund request has been received — Ref: ${refundRef}`
}

export default function RefundSubmittedTouristEmail({
  touristName,
  tourTitle,
  refundRef,
  operatorDeadline,
  trackingUrl,
}: RefundSubmittedTouristProps) {
  const firstName = touristName.split(' ')[0]
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 560 }}>
          <Section style={{ backgroundColor: '#006B6B', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 22, color: '#0C1829' }}>Hi {firstName}, we have received your request</Heading>
            <Text style={{ color: '#0C1829' }}>
              Your refund request for <strong>{tourTitle}</strong> has been received and logged.
            </Text>
            <Section style={{ border: '2px solid #006B6B', borderRadius: 8, padding: 16, margin: '16px 0', textAlign: 'center' as const }}>
              <Text style={{ margin: 0, fontSize: 13, color: '#5A6B7A' }}>Your reference number</Text>
              <Text style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: '#0C1829' }}>{refundRef}</Text>
              <Text style={{ margin: '4px 0 0', fontSize: 11, color: '#5A6B7A' }}>Keep this for your records and any correspondence</Text>
            </Section>
            <Text style={{ fontWeight: 600, color: '#0C1829', marginTop: 20 }}>What happens next:</Text>
            {[
              ['✓', 'Request received — today'],
              ['→', `Operator notified — today (they have until ${operatorDeadline} to respond)`],
              ['→', 'Our team reviews all evidence (within 5 business days of operator response)'],
              ['→', 'We notify you of the decision by email'],
              ['→', 'If approved, refund is sent within 5 business days'],
            ].map(([icon, text]) => (
              <Text key={text} style={{ margin: '6px 0', color: '#0C1829', fontSize: 14 }}>
                <span style={{ color: '#006B6B', fontWeight: 700 }}>{icon}</span> {text}
              </Text>
            ))}
            <Section style={{ marginTop: 20 }}>
              <Button href={trackingUrl} style={{ backgroundColor: '#C9A84C', color: '#fff', padding: '12px 24px', borderRadius: 8 }}>
                Track Your Request
              </Button>
            </Section>
            <Hr />
            <Text style={{ color: '#5A6B7A', fontSize: 13 }}>
              Questions? WhatsApp us quoting <strong>{refundRef}</strong> for fastest response: +255 000 000 000
            </Text>
          </Section>
          <Section style={{ backgroundColor: '#0C1829', padding: 16, textAlign: 'center' as const }}>
            <Text style={{ color: '#5A6B7A', fontSize: 12, margin: 0 }}>© 2025 LifeGranted Adventures · Mwanza, Tanzania</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

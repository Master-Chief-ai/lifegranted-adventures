import { Html, Head, Body, Container, Section, Heading, Text } from '@react-email/components'

export interface RefundPaidConfirmationProps {
  touristName: string
  refundRef: string
  amount: number
  paymentMethod: string
}

export function refundPaidConfirmationSubject(refundRef: string, amount: number) {
  return `✓ Refund Sent — USD $${amount.toFixed(2)} — Ref: ${refundRef}`
}

export default function RefundPaidConfirmationEmail({ touristName, refundRef, amount, paymentMethod }: RefundPaidConfirmationProps) {
  const firstName = touristName.split(' ')[0]
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 560 }}>
          <Section style={{ backgroundColor: '#006B6B', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>
          <Section style={{ padding: '24px', textAlign: 'center' as const }}>
            <Text style={{ fontSize: 48, margin: 0 }}>✓</Text>
            <Heading style={{ fontSize: 22, color: '#0C1829' }}>Refund Sent, {firstName}</Heading>
            <Text style={{ color: '#0C1829' }}>Your refund of <strong>USD ${amount.toFixed(2)}</strong> has been sent to your {paymentMethod}.</Text>
            <Text style={{ color: '#5A6B7A' }}>Please allow 3–5 business days to appear in your account.</Text>
            <Text style={{ fontSize: 12, color: '#5A6B7A', marginTop: 24 }}>Ref: {refundRef}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from '@react-email/components'

export interface RefundDecisionTouristProps {
  touristName: string
  refundRef: string
  approved: boolean
  approvedAmount?: number
  decisionSummary: string
}

export function refundDecisionTouristSubject(refundRef: string, approved: boolean, amount?: number) {
  if (approved) return `✓ Refund Approved — $${amount?.toFixed(2)} being sent — Ref: ${refundRef}`
  return `Refund Request Update — Ref: ${refundRef}`
}

export default function RefundDecisionTouristEmail({
  touristName, refundRef, approved, approvedAmount, decisionSummary,
}: RefundDecisionTouristProps) {
  const firstName = touristName.split(' ')[0]
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 560 }}>
          <Section style={{ backgroundColor: approved ? '#006B6B' : '#0C1829', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            {approved ? (
              <>
                <Heading style={{ fontSize: 22, color: '#0C1829' }}>Your refund has been approved, {firstName}</Heading>
                <Text style={{ color: '#0C1829' }}>Your refund request has been reviewed and approved.</Text>
                <Section style={{ backgroundColor: '#E6F4F4', borderRadius: 8, padding: 20, textAlign: 'center' as const, margin: '16px 0' }}>
                  <Text style={{ margin: 0, color: '#5A6B7A', fontSize: 13 }}>Refund Amount</Text>
                  <Text style={{ margin: '4px 0 0', fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 700, color: '#006B6B' }}>
                    USD ${approvedAmount?.toFixed(2)}
                  </Text>
                </Section>
                <Text style={{ color: '#0C1829' }}>Payment will arrive within 5 business days via your original payment method.</Text>
                <Text style={{ color: '#0C1829' }}>{decisionSummary}</Text>
                <Text style={{ color: '#5A6B7A', fontSize: 13 }}>
                  Thank you for bringing this to our attention. We have taken action to address this with the operator.
                </Text>
              </>
            ) : (
              <>
                <Heading style={{ fontSize: 22, color: '#0C1829' }}>Refund Request Update — {refundRef}</Heading>
                <Text style={{ color: '#0C1829' }}>Hi {firstName}, we have completed our review of your refund request.</Text>
                <Text style={{ color: '#0C1829' }}>
                  After carefully reviewing the evidence from both sides, we were unable to approve a refund in this case.
                </Text>
                <Section style={{ backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, margin: '16px 0' }}>
                  <Text style={{ margin: 0, fontWeight: 600, color: '#0C1829' }}>Decision summary:</Text>
                  <Text style={{ margin: '8px 0 0', color: '#5A6B7A' }}>{decisionSummary}</Text>
                </Section>
                <Text style={{ color: '#5A6B7A', fontSize: 13 }}>
                  If you have travel insurance, your insurer may cover this claim. If you believe new evidence changes the outcome,
                  contact us within 14 days via WhatsApp quoting {refundRef}.
                </Text>
              </>
            )}
            <Hr />
            <Text style={{ color: '#5A6B7A', fontSize: 12 }}>Ref: {refundRef} · LifeGranted Adventures · Mwanza, Tanzania</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

import { Html, Head, Body, Container, Section, Heading, Text } from '@react-email/components'

export interface OperatorAppealReceivedProps {
  operatorName: string
  recoveryRef: string
}

export function operatorAppealReceivedSubject(recoveryRef: string) {
  return `Appeal Received — ${recoveryRef} — We will respond within 5 business days`
}

export default function OperatorAppealReceivedEmail({ operatorName, recoveryRef }: OperatorAppealReceivedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 540, padding: 24 }}>
          <Heading style={{ fontSize: 20, color: '#0C1829' }}>Appeal received — {recoveryRef}</Heading>
          <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>
          <Text style={{ color: '#0C1829' }}>We have received your appeal for Recovery Notice <strong>{recoveryRef}</strong>.</Text>
          <Section style={{ backgroundColor: '#E6F4F4', borderRadius: 8, padding: 16, margin: '16px 0' }}>
            <Text style={{ margin: 0, color: '#006B6B' }}>Our team will review your appeal and all supporting evidence. We aim to provide a decision within <strong>5 business days</strong>.</Text>
          </Section>
          <Text style={{ color: '#5A6B7A', fontSize: 13 }}>Recovery is paused while your appeal is under review. You will be notified of our decision by email.</Text>
          <Text style={{ color: '#5A6B7A', fontSize: 12 }}>Ref: {recoveryRef} · LifeGranted Adventures</Text>
        </Container>
      </Body>
    </Html>
  )
}

import { Html, Head, Body, Container, Section, Heading, Text } from '@react-email/components'

export interface OperatorRecoveryCompleteProps {
  operatorName: string
  recoveryRef: string
  totalRecovered: string
}

export function operatorRecoveryCompleteSubject(recoveryRef: string, amount: string) {
  return `Recovery Complete — ${recoveryRef} — ${amount} fully recovered`
}

export default function OperatorRecoveryCompleteEmail({ operatorName, recoveryRef, totalRecovered }: OperatorRecoveryCompleteProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 540, padding: 24 }}>
          <Section style={{ backgroundColor: '#006B6B', padding: '20px 24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 20, color: '#0C1829' }}>Recovery Complete — {recoveryRef}</Heading>
            <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>
            <Text style={{ color: '#0C1829' }}>
              We are writing to confirm that Recovery Notice <strong>{recoveryRef}</strong> for <strong>{totalRecovered}</strong> has been
              fully recovered through your platform payouts.
            </Text>
            <Text style={{ color: '#0C1829' }}>Your account is now clear. Thank you for your continued partnership with LifeGranted Adventures.</Text>
            <Text style={{ color: '#5A6B7A', fontSize: 13 }}>Ref: {recoveryRef}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

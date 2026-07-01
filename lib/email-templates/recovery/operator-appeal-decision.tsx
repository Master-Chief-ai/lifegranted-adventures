import { Html, Head, Body, Container, Section, Heading, Text } from '@react-email/components'

export interface OperatorAppealDecisionProps {
  operatorName: string
  recoveryRef: string
  upheld: boolean
  decisionNotes: string
}

export function operatorAppealDecisionSubject(recoveryRef: string, upheld: boolean) {
  return upheld
    ? `Appeal Upheld — ${recoveryRef} — Recovery notice cancelled`
    : `Appeal Decision — ${recoveryRef} — Recovery proceeding`
}

export default function OperatorAppealDecisionEmail({ operatorName, recoveryRef, upheld, decisionNotes }: OperatorAppealDecisionProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 540 }}>
          <Section style={{ backgroundColor: upheld ? '#006B6B' : '#0C1829', padding: '20px 24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
          </Section>
          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 20, color: '#0C1829' }}>
              {upheld ? 'Your appeal has been upheld' : 'Appeal decision — Recovery proceeding'}
            </Heading>
            <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>
            {upheld ? (
              <>
                <Text style={{ color: '#0C1829' }}>
                  After reviewing your appeal for Recovery Notice <strong>{recoveryRef}</strong>, we have upheld your appeal.
                  The recovery notice has been <strong>cancelled</strong>. No deductions will be made from your future payouts.
                </Text>
                <Section style={{ backgroundColor: '#E6F4F4', borderRadius: 8, padding: 16, margin: '16px 0' }}>
                  <Text style={{ margin: 0, color: '#006B6B' }}>{decisionNotes}</Text>
                </Section>
                <Text style={{ color: '#0C1829' }}>Thank you for your continued partnership with LifeGranted Adventures.</Text>
              </>
            ) : (
              <>
                <Text style={{ color: '#0C1829' }}>
                  After carefully reviewing your appeal for Recovery Notice <strong>{recoveryRef}</strong>, we are unable to uphold it.
                  Recovery will proceed automatically from your future platform payouts.
                </Text>
                <Section style={{ backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, margin: '16px 0' }}>
                  <Text style={{ margin: 0, fontWeight: 600, color: '#0C1829' }}>Decision summary:</Text>
                  <Text style={{ margin: '8px 0 0', color: '#5A6B7A' }}>{decisionNotes}</Text>
                </Section>
              </>
            )}
            <Text style={{ color: '#5A6B7A', fontSize: 12 }}>Ref: {recoveryRef} · LifeGranted Adventures</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'

export interface OperatorRecoveryReminderProps {
  operatorName: string
  recoveryRef: string
  appealDeadline: string
  appealUrl: string
  portalUrl: string
}

export function operatorRecoveryReminderSubject(recoveryRef: string, deadline: string) {
  return `Reminder: Appeal window closes ${deadline} — Recovery Notice ${recoveryRef}`
}

export default function OperatorRecoveryReminderEmail({ operatorName, recoveryRef, appealDeadline, appealUrl, portalUrl }: OperatorRecoveryReminderProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 540, padding: 24 }}>
          <Heading style={{ fontSize: 20, color: '#0C1829' }}>Reminder: Appeal window closing — {recoveryRef}</Heading>
          <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>
          <Text style={{ color: '#0C1829' }}>This is a reminder that your appeal window for Recovery Notice <strong>{recoveryRef}</strong> closes tomorrow.</Text>
          <Section style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 16, margin: '16px 0' }}>
            <Text style={{ margin: 0, fontWeight: 700, color: '#92400E' }}>Appeal deadline: {appealDeadline}</Text>
            <Text style={{ margin: '8px 0 0', color: '#92400E', fontSize: 13 }}>After this time, recovery will proceed automatically from your future payouts and you will no longer be able to appeal.</Text>
          </Section>
          <Button href={appealUrl} style={{ backgroundColor: '#C9A84C', color: '#fff', padding: '12px 24px', borderRadius: 8 }}>Submit an Appeal →</Button>
          <Text style={{ marginTop: 12 }}><a href={portalUrl} style={{ color: '#006B6B' }}>View full case details</a></Text>
        </Container>
      </Body>
    </Html>
  )
}

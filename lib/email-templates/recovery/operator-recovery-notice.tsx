import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from '@react-email/components'

export interface OperatorRecoveryNoticeProps {
  operatorName: string
  recoveryRef: string
  refundRef: string
  bookingRef: string
  tourTitle: string
  travelDate: string
  touristName: string
  totalRefunded: string
  securityDepositApplied: string
  remainingToRecover: string
  appealDeadline: string
  portalUrl: string
  appealUrl: string
  acknowledgeUrl: string
}

export function operatorRecoveryNoticeSubject(recoveryRef: string, remaining: string) {
  return `Important: Recovery Notice ${recoveryRef} — ${remaining} — Action may be required`
}

export default function OperatorRecoveryNoticeEmail({
  operatorName, recoveryRef, refundRef, bookingRef, tourTitle, travelDate,
  touristName, totalRefunded, securityDepositApplied, remainingToRecover,
  appealDeadline, portalUrl, appealUrl, acknowledgeUrl,
}: OperatorRecoveryNoticeProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#FAF6EF', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', margin: '20px auto', maxWidth: 580 }}>
          <Section style={{ backgroundColor: '#0C1829', padding: '24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>LifeGranted Adventures</Text>
            <Text style={{ color: '#C9A84C', fontSize: 12, margin: '4px 0 0' }}>Formal Recovery Notice · {recoveryRef}</Text>
          </Section>

          <Section style={{ padding: '24px' }}>
            <Heading style={{ fontSize: 20, color: '#0C1829' }}>Recovery Notice — {recoveryRef}</Heading>
            <Text style={{ color: '#0C1829' }}>Hi {operatorName},</Text>

            <Section style={{ backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, margin: '16px 0' }}>
              <Text style={{ margin: 0, fontWeight: 600, color: '#0C1829' }}>What has happened</Text>
              <Text style={{ color: '#5A6B7A', margin: '8px 0 0' }}>
                A refund has been issued to a tourist who booked one of your tours through LifeGranted Adventures. Our Guarantee Fund
                paid this refund on the tourist&apos;s behalf. As per your Operator Agreement, we are now formally notifying you of
                the corresponding recovery amount.
              </Text>
            </Section>

            <Text style={{ fontWeight: 600, color: '#0C1829', marginTop: 20 }}>The booking:</Text>
            <Section style={{ border: '1px solid #DDE8E8', borderRadius: 8, padding: 16, margin: '8px 0' }}>
              <Text style={{ margin: '0 0 4px' }}>Booking reference: <strong>{bookingRef}</strong></Text>
              <Text style={{ margin: '4px 0' }}>Tour: {tourTitle}</Text>
              <Text style={{ margin: '4px 0' }}>Travel date: {travelDate}</Text>
              <Text style={{ margin: '4px 0' }}>Tourist: {touristName}</Text>
              <Text style={{ margin: '4px 0' }}>Refund reference: {refundRef}</Text>
            </Section>

            <Text style={{ fontWeight: 600, color: '#0C1829', marginTop: 16 }}>Your recovery summary:</Text>
            <Section style={{ border: '2px solid #006B6B', borderRadius: 8, padding: 16, margin: '8px 0' }}>
              <Text style={{ margin: '0 0 4px', color: '#5A6B7A' }}>Total refund issued: {totalRefunded}</Text>
              {securityDepositApplied !== '$0.00' && (
                <Text style={{ margin: '4px 0', color: '#5A6B7A' }}>Applied from security deposit: {securityDepositApplied}</Text>
              )}
              <Text style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 700, color: '#006B6B' }}>
                Remaining to recover: {remainingToRecover}
              </Text>
            </Section>

            <Section style={{ backgroundColor: '#E6F4F4', borderRadius: 8, padding: 16, margin: '16px 0' }}>
              <Text style={{ margin: 0, fontWeight: 600, color: '#006B6B' }}>How recovery works</Text>
              <Text style={{ margin: '8px 0 0', color: '#0C1829', fontSize: 14 }}>
                The recovery amount will be automatically deducted from your future platform earnings. Your existing bank balance
                will not be affected. We will never request a bank transfer or take any action against your existing accounts.
                Recovery comes only from future bookings on this platform.
              </Text>
            </Section>

            <Button href={portalUrl} style={{ backgroundColor: '#006B6B', color: '#fff', padding: '12px 24px', borderRadius: 8, marginTop: 8 }}>
              View Full Case Details →
            </Button>

            <Hr style={{ margin: '24px 0' }} />

            <Section style={{ border: '2px solid #C9A84C', borderRadius: 8, padding: 16 }}>
              <Text style={{ margin: 0, fontWeight: 700, color: '#92400E' }}>Your right to appeal</Text>
              <Text style={{ margin: '8px 0', color: '#0C1829', fontSize: 14 }}>
                You have 5 days from the date of this notice to submit an appeal if you believe the platform&apos;s decision was incorrect.
              </Text>
              <Text style={{ margin: '4px 0', fontWeight: 700, color: '#B91C1C' }}>Appeal deadline: {appealDeadline}</Text>
              <Text style={{ margin: '8px 0', color: '#5A6B7A', fontSize: 13 }}>
                If you do not appeal by this deadline, recovery will proceed automatically from your future payouts.
              </Text>
              <Button href={appealUrl} style={{ backgroundColor: '#C9A84C', color: '#fff', padding: '10px 20px', borderRadius: 8, marginTop: 8, fontSize: 14 }}>
                Submit an Appeal →
              </Button>
            </Section>

            <Section style={{ marginTop: 20 }}>
              <Button href={acknowledgeUrl} style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '10px 20px', borderRadius: 8, fontSize: 14 }}>
                I Acknowledge This Notice
              </Button>
              <Text style={{ fontSize: 12, color: '#5A6B7A', marginTop: 8 }}>
                Acknowledging this notice does not mean you accept fault. It simply confirms you have received and read this formal notification.
              </Text>
            </Section>

            <Hr style={{ margin: '20px 0' }} />
            <Text style={{ color: '#5A6B7A', fontSize: 12 }}>
              Questions? WhatsApp +255 000 000 000 quoting <strong>{recoveryRef}</strong> for fastest response.
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 8 }}>
              This notice is issued under the LifeGranted Adventures Operator Agreement — Dispute Resolution section.
              Recovery is limited to future platform earnings. No action will be taken against existing bank accounts or assets.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

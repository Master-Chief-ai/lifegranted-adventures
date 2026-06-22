import { Resend } from 'resend'
import { render } from '@react-email/components'
import type { Booking, Tour, Operator } from '@/types'
import BookingConfirmationEmail, { bookingConfirmationSubject } from '@/lib/email-templates/booking-confirmation'
import OperatorNotificationEmail, { operatorNotificationSubject } from '@/lib/email-templates/operator-notification'
import PreDepartureEmail, { preDepartureSubject } from '@/lib/email-templates/pre-departure'
import ReviewRequestEmail, { reviewRequestSubject } from '@/lib/email-templates/review-request'

const apiKey = process.env.RESEND_API_KEY
const emailEnabled = !!apiKey && !apiKey.includes('placeholder')
const resend = emailEnabled ? new Resend(apiKey) : null

async function dispatchEmail(to: string, subject: string, react: React.ReactElement): Promise<{ success: boolean }> {
  if (!resend) {
    const html = await render(react)
    console.log(`\n[MOCK EMAIL] To: ${to}\nSubject: ${subject}\n${html.slice(0, 400)}…\n`)
    return { success: true }
  }
  try {
    await resend.emails.send({
      from: 'LifeGranted Adventures <bookings@lifegrantedadventures.co.tz>',
      to,
      subject,
      react,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email', error)
    return { success: false }
  }
}

export async function sendOperatorNotification(booking: Booking, tour: Tour, operator: Operator) {
  if (!operator.email) return { success: false }
  return dispatchEmail(
    operator.email,
    operatorNotificationSubject(booking, tour),
    <OperatorNotificationEmail booking={booking} tour={tour} operator={operator} />
  )
}

export async function sendBookingConfirmation(booking: Booking, tour: Tour, operator: Operator) {
  const result = await dispatchEmail(
    booking.tourist_email,
    bookingConfirmationSubject(booking, tour),
    <BookingConfirmationEmail booking={booking} tour={tour} operator={operator} />
  )
  await sendOperatorNotification(booking, tour, operator)
  return result
}

export async function sendPreDeparture(booking: Booking, tour: Tour, operator: Operator) {
  return dispatchEmail(booking.tourist_email, preDepartureSubject(booking), <PreDepartureEmail booking={booking} tour={tour} operator={operator} />)
}

export async function sendReviewRequest(booking: Booking, tour: Tour, operatorName: string) {
  return dispatchEmail(booking.tourist_email, reviewRequestSubject(booking), <ReviewRequestEmail booking={booking} tour={tour} operatorName={operatorName} />)
}

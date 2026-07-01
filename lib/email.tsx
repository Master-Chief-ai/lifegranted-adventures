import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import type { Booking, Tour, Operator } from '@/types'
import BookingConfirmationEmail, { bookingConfirmationSubject } from '@/lib/email-templates/booking-confirmation'
import OperatorNotificationEmail, { operatorNotificationSubject } from '@/lib/email-templates/operator-notification'
import PreDepartureEmail, { preDepartureSubject } from '@/lib/email-templates/pre-departure'
import ReviewRequestEmail, { reviewRequestSubject } from '@/lib/email-templates/review-request'
import RefundSubmittedTouristEmail, { refundSubmittedTouristSubject } from '@/lib/email-templates/refunds/refund-submitted-tourist'
import OperatorDisputeNotificationEmail, { operatorDisputeNotificationSubject } from '@/lib/email-templates/refunds/operator-dispute-notification'
import AdminDisputeAlertEmail, { adminDisputeAlertSubject } from '@/lib/email-templates/refunds/admin-dispute-alert'
import RefundDecisionTouristEmail, { refundDecisionTouristSubject } from '@/lib/email-templates/refunds/refund-decision-tourist'
import RefundPaidConfirmationEmail, { refundPaidConfirmationSubject } from '@/lib/email-templates/refunds/refund-paid-confirmation'
import type { RefundReason } from '@/types/refunds'
import { REFUND_REASON_LABELS } from '@/types/refunds'
import { formatCurrency, formatDate } from '@/lib/utils'
import OperatorRecoveryNoticeEmail, { operatorRecoveryNoticeSubject } from '@/lib/email-templates/recovery/operator-recovery-notice'
import OperatorRecoveryReminderEmail, { operatorRecoveryReminderSubject } from '@/lib/email-templates/recovery/operator-recovery-reminder'
import OperatorRecoveryCompleteEmail, { operatorRecoveryCompleteSubject } from '@/lib/email-templates/recovery/operator-recovery-complete'
import OperatorAppealReceivedEmail, { operatorAppealReceivedSubject } from '@/lib/email-templates/recovery/operator-appeal-received'
import OperatorAppealDecisionEmail, { operatorAppealDecisionSubject } from '@/lib/email-templates/recovery/operator-appeal-decision'

const apiKey = process.env.RESEND_API_KEY
const emailEnabled = !!apiKey && !apiKey.includes('placeholder')
const resend = emailEnabled ? new Resend(apiKey) : null

const FROM = 'LifeGranted Adventures <hello@lifegranted-adventures.co.tz>'
const ADMIN_EMAIL = process.env.PLATFORM_ADMIN_EMAIL ?? 'stephen@lifegranted-adventures.co.tz'
const SITE_URL = process.env.NEXT_PUBLIC_PLATFORM_URL ?? 'https://lifegranted-adventures.co.tz'

// ─── React-email dispatcher (for rich template emails) ─────────────────────

async function dispatchEmail(to: string, subject: string, react: React.ReactElement): Promise<{ success: boolean }> {
  if (!resend) {
    const html = await render(react)
    console.log(`\n[MOCK EMAIL] To: ${to}\nSubject: ${subject}\n${html.slice(0, 400)}…\n`)
    return { success: true }
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, react })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email', error)
    return { success: false }
  }
}

// ─── Plain HTML dispatcher (for simple status / notification emails) ────────

async function dispatchHtml(
  to: string,
  subject: string,
  html: string,
  opts?: { replyTo?: string }
): Promise<{ success: boolean }> {
  if (!resend) {
    console.log(`\n[MOCK EMAIL] To: ${to}\nSubject: ${subject}\n`)
    return { success: true }
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html, replyTo: opts?.replyTo })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email', error)
    return { success: false }
  }
}

// ─── Booking emails (React Email templates) ────────────────────────────────

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
  return dispatchEmail(
    booking.tourist_email,
    preDepartureSubject(booking),
    <PreDepartureEmail booking={booking} tour={tour} operator={operator} />
  )
}

export async function sendReviewRequest(booking: Booking, tour: Tour, operatorName: string) {
  return dispatchEmail(
    booking.tourist_email,
    reviewRequestSubject(booking),
    <ReviewRequestEmail booking={booking} tour={tour} operatorName={operatorName} />
  )
}

// ─── Operator status emails ────────────────────────────────────────────────

export async function sendOperatorApproved(operatorEmail: string, businessName: string) {
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
    <h2 style="color:#1a3c2e;">You're approved! Welcome to LifeGranted Adventures 🎊</h2>
    <p>Congratulations, <strong>${businessName}</strong>! Your application has been reviewed and approved.</p>
    <p>You can now log in to your operator portal to publish tours, manage bookings, and track earnings.</p>
    <a href="${SITE_URL}/portal" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a3c2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Go to Operator Portal</a>
    <p style="margin-top:32px;color:#666;font-size:13px;">LifeGranted Adventures · Tanzania Safari Marketplace</p>
  </body></html>`
  return dispatchHtml(operatorEmail, '✅ Your LifeGranted Adventures account is approved!', html)
}

export async function sendOperatorRejected(operatorEmail: string, businessName: string, reason: string) {
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
    <h2 style="color:#1a3c2e;">Application Update — LifeGranted Adventures</h2>
    <p>Hi <strong>${businessName}</strong> team, thank you for your interest in joining LifeGranted Adventures.</p>
    <p>After reviewing your application, we're unable to approve it at this time for the following reason:</p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#991b1b;">${reason}</p>
    </div>
    <p>You're welcome to address the above and reapply. Reply to this email if you have questions.</p>
    <p style="margin-top:32px;color:#666;font-size:13px;">LifeGranted Adventures · Tanzania Safari Marketplace</p>
  </body></html>`
  return dispatchHtml(operatorEmail, 'Update on your LifeGranted Adventures application', html)
}

export async function sendOperatorSuspended(operatorEmail: string, businessName: string, reason: string) {
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
    <h2 style="color:#1a3c2e;">Account Suspended — Action Required</h2>
    <p>Hi <strong>${businessName}</strong> team, your LifeGranted Adventures operator account has been temporarily suspended.</p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#991b1b;">${reason}</p>
    </div>
    <p>Your existing bookings are unaffected. New bookings and listings are paused until the suspension is lifted. Reply to this email to discuss reinstatement.</p>
    <p style="margin-top:32px;color:#666;font-size:13px;">LifeGranted Adventures · Tanzania Safari Marketplace</p>
  </body></html>`
  return dispatchHtml(operatorEmail, '⚠️ Your LifeGranted Adventures account has been suspended', html)
}

// ─── New operator application notification ─────────────────────────────────

export async function sendNewOperatorNotification(
  businessName: string,
  city: string,
  operatorEmail: string
) {
  // Admin notification
  await dispatchHtml(
    ADMIN_EMAIL,
    `New Operator Application — ${businessName}`,
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#1a3c2e;">New Operator Application 📋</h2>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px;color:#666;width:140px;">Business</td><td style="padding:8px;font-weight:600;">${businessName}</td></tr>
        <tr><td style="padding:8px;color:#666;">City</td><td style="padding:8px;font-weight:600;">${city}</td></tr>
        <tr><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;font-weight:600;">${operatorEmail}</td></tr>
      </table>
      <a href="${SITE_URL}/admin/operators" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a3c2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Review Application</a>
    </body></html>`
  )

  // Confirmation to operator (only if email provided)
  if (!operatorEmail) return
  await dispatchHtml(
    operatorEmail,
    'Your LifeGranted Adventures application has been received',
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#1a3c2e;">Application Received! 🎉</h2>
      <p>Hi <strong>${businessName}</strong> team, thank you for applying to join LifeGranted Adventures!</p>
      <p>Our team will review your application and respond within <strong>2–3 business days</strong>.</p>
      <p style="margin-top:32px;color:#666;font-size:13px;">LifeGranted Adventures · Tanzania Safari Marketplace</p>
    </body></html>`
  )
}

// ─── Contact form ──────────────────────────────────────────────────────────

export async function sendContactMessage(name: string, email: string, message: string) {
  // Forward to admin
  await dispatchHtml(
    ADMIN_EMAIL,
    `Contact Form — ${name}`,
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#1a3c2e;">New Contact Form Message 💬</h2>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px;color:#666;width:80px;">From</td><td style="padding:8px;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;font-weight:600;">${email}</td></tr>
      </table>
      <div style="background:#f9f9f7;border-radius:8px;padding:20px;margin-top:8px;">
        <p style="margin:0;white-space:pre-wrap;">${message}</p>
      </div>
    </body></html>`,
    { replyTo: email }
  )

  // Auto-reply to sender
  await dispatchHtml(
    email,
    "We've received your message — LifeGranted Adventures",
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#1a3c2e;">We've received your message 👋</h2>
      <p>Hi ${name}, thank you for reaching out to LifeGranted Adventures!</p>
      <p>We've received your message and will get back to you within 24 hours.</p>
      <a href="${SITE_URL}/tours" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a3c2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Explore Tours</a>
      <p style="margin-top:32px;color:#666;font-size:13px;">LifeGranted Adventures · Tanzania Safari Marketplace</p>
    </body></html>`
  )
}

// ─── Refund emails ─────────────────────────────────────────────────────────

export interface RefundEmailPayload {
  touristName: string
  touristEmail: string
  operatorEmail: string | null
  operatorName: string
  refundRef: string
  bookingRef: string
  tourTitle: string
  travelDate: string
  groupSize: number
  amountPaid: number
  reasonCategory: RefundReason
  touristStatement: string
  operatorDeadline: string
}

export async function sendRefundSubmittedEmails(payload: RefundEmailPayload) {
  const trackingUrl = `${SITE_URL}/account/refunds/${payload.refundRef}`
  const responseUrl = `${SITE_URL}/portal/disputes/${payload.refundRef}`
  const reasonLabel = REFUND_REASON_LABELS[payload.reasonCategory]
  const amountStr = formatCurrency(payload.amountPaid)

  await Promise.all([
    dispatchEmail(
      payload.touristEmail,
      refundSubmittedTouristSubject(payload.refundRef),
      <RefundSubmittedTouristEmail
        touristName={payload.touristName}
        tourTitle={payload.tourTitle}
        refundRef={payload.refundRef}
        operatorDeadline={payload.operatorDeadline}
        trackingUrl={trackingUrl}
      />
    ),
    payload.operatorEmail
      ? dispatchEmail(
          payload.operatorEmail,
          operatorDisputeNotificationSubject(payload.refundRef, payload.bookingRef, payload.operatorDeadline),
          <OperatorDisputeNotificationEmail
            operatorName={payload.operatorName}
            refundRef={payload.refundRef}
            bookingRef={payload.bookingRef}
            touristName={payload.touristName}
            tourTitle={payload.tourTitle}
            travelDate={formatDate(payload.travelDate)}
            groupSize={payload.groupSize}
            amountPaid={amountStr}
            reasonLabel={reasonLabel}
            touristStatement={payload.touristStatement}
            deadline={payload.operatorDeadline}
            responseUrl={responseUrl}
          />
        )
      : Promise.resolve({ success: true }),
    dispatchEmail(
      ADMIN_EMAIL,
      adminDisputeAlertSubject(payload.refundRef, reasonLabel, amountStr),
      <AdminDisputeAlertEmail
        refundRef={payload.refundRef}
        bookingRef={payload.bookingRef}
        reasonLabel={reasonLabel}
        amountPaid={amountStr}
        touristName={payload.touristName}
        tourTitle={payload.tourTitle}
        operatorName={payload.operatorName}
        adminUrl={`${SITE_URL}/admin/disputes`}
      />
    ),
  ])
}

export async function sendRefundDecision(
  touristEmail: string,
  touristName: string,
  refundRef: string,
  approved: boolean,
  approvedAmount: number | undefined,
  decisionSummary: string
) {
  return dispatchEmail(
    touristEmail,
    refundDecisionTouristSubject(refundRef, approved, approvedAmount),
    <RefundDecisionTouristEmail
      touristName={touristName}
      refundRef={refundRef}
      approved={approved}
      approvedAmount={approvedAmount}
      decisionSummary={decisionSummary}
    />
  )
}

export async function sendRefundPaid(touristEmail: string, touristName: string, refundRef: string, amount: number, paymentMethod: string) {
  return dispatchEmail(
    touristEmail,
    refundPaidConfirmationSubject(refundRef, amount),
    <RefundPaidConfirmationEmail touristName={touristName} refundRef={refundRef} amount={amount} paymentMethod={paymentMethod} />
  )
}

export async function sendOperatorDisputeNotification(payload: RefundEmailPayload) {
  if (!payload.operatorEmail) return { success: false }
  const responseUrl = `${SITE_URL}/portal/disputes/${payload.refundRef}`
  const reasonLabel = REFUND_REASON_LABELS[payload.reasonCategory]
  return dispatchEmail(
    payload.operatorEmail,
    operatorDisputeNotificationSubject(payload.refundRef, payload.bookingRef, payload.operatorDeadline),
    <OperatorDisputeNotificationEmail
      operatorName={payload.operatorName}
      refundRef={payload.refundRef}
      bookingRef={payload.bookingRef}
      touristName={payload.touristName}
      tourTitle={payload.tourTitle}
      travelDate={formatDate(payload.travelDate)}
      groupSize={payload.groupSize}
      amountPaid={formatCurrency(payload.amountPaid)}
      reasonLabel={reasonLabel}
      touristStatement={payload.touristStatement}
      deadline={payload.operatorDeadline}
      responseUrl={responseUrl}
    />
  )
}

// ─── Recovery emails ────────────────────────────────────────────────────────

export interface RecoveryEmailPayload {
  operatorEmail: string
  operatorName: string
  recoveryRef: string
  refundRef: string
  bookingRef: string
  tourTitle: string
  travelDate: string
  touristName: string
  totalRefunded: number
  securityDepositApplied: number
  remainingToRecover: number
  appealDeadline: string
}

export async function sendRecoveryNotice(payload: RecoveryEmailPayload) {
  const portalUrl = `${SITE_URL}/portal/recovery/${payload.recoveryRef}`
  const appealUrl = `${SITE_URL}/portal/recovery/${payload.recoveryRef}?action=appeal`
  const acknowledgeUrl = `${SITE_URL}/api/recovery/${payload.recoveryRef}/acknowledge`
  return dispatchEmail(
    payload.operatorEmail,
    operatorRecoveryNoticeSubject(payload.recoveryRef, formatCurrency(payload.remainingToRecover)),
    React.createElement(OperatorRecoveryNoticeEmail, {
      operatorName: payload.operatorName,
      recoveryRef: payload.recoveryRef,
      refundRef: payload.refundRef,
      bookingRef: payload.bookingRef,
      tourTitle: payload.tourTitle,
      travelDate: payload.travelDate,
      touristName: payload.touristName,
      totalRefunded: formatCurrency(payload.totalRefunded),
      securityDepositApplied: formatCurrency(payload.securityDepositApplied),
      remainingToRecover: formatCurrency(payload.remainingToRecover),
      appealDeadline: payload.appealDeadline,
      portalUrl,
      appealUrl,
      acknowledgeUrl,
    })
  )
}

export async function sendRecoveryReminder(operatorEmail: string, operatorName: string, recoveryRef: string, appealDeadline: string) {
  const portalUrl = `${SITE_URL}/portal/recovery/${recoveryRef}`
  const appealUrl = `${SITE_URL}/portal/recovery/${recoveryRef}?action=appeal`
  return dispatchEmail(
    operatorEmail,
    operatorRecoveryReminderSubject(recoveryRef, appealDeadline),
    React.createElement(OperatorRecoveryReminderEmail, { operatorName, recoveryRef, appealDeadline, appealUrl, portalUrl })
  )
}

export async function sendRecoveryComplete(operatorEmail: string, operatorName: string, recoveryRef: string, totalRecovered: number) {
  return dispatchEmail(
    operatorEmail,
    operatorRecoveryCompleteSubject(recoveryRef, formatCurrency(totalRecovered)),
    React.createElement(OperatorRecoveryCompleteEmail, { operatorName, recoveryRef, totalRecovered: formatCurrency(totalRecovered) })
  )
}

export async function sendAppealReceived(operatorEmail: string, operatorName: string, recoveryRef: string) {
  return dispatchEmail(
    operatorEmail,
    operatorAppealReceivedSubject(recoveryRef),
    React.createElement(OperatorAppealReceivedEmail, { operatorName, recoveryRef })
  )
}

export async function sendAppealDecision(operatorEmail: string, operatorName: string, recoveryRef: string, upheld: boolean, decisionNotes: string) {
  return dispatchEmail(
    operatorEmail,
    operatorAppealDecisionSubject(recoveryRef, upheld),
    React.createElement(OperatorAppealDecisionEmail, { operatorName, recoveryRef, upheld, decisionNotes })
  )
}

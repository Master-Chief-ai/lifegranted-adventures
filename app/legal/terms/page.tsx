import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="container-sm py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: January 2025</p>
      <div className="prose mt-6 max-w-none space-y-4 text-navy/90">
        <p>
          These Terms of Service govern your use of the LifeGranted Adventures platform, operated from Mwanza, Tanzania.
          By booking a tour or registering as an operator, you agree to these terms.
        </p>
        <h2 className="font-display text-xl font-bold text-navy">1. Platform Role</h2>
        <p>
          LifeGranted Adventures acts as a marketplace connecting travelers with independent, TTB-licensed tour operators.
          We are not the tour provider — operators are solely responsible for the delivery of booked experiences.
        </p>
        <h2 className="font-display text-xl font-bold text-navy">2. Bookings and Payments</h2>
        <p>
          All bookings are processed securely. The platform retains a 15% commission on each booking (including a 3% Guarantee Fund contribution); operators receive
          the remaining 85% automatically.
        </p>
        <h2 className="font-display text-xl font-bold text-navy">3. Cancellations</h2>
        <p>Cancellation terms vary by tour and are displayed at the time of booking. See our Refund Policy for details.</p>
        <h2 className="font-display text-xl font-bold text-navy">4. Liability</h2>
        <p>
          LifeGranted Adventures is not liable for the acts, omissions, or negligence of independent tour operators. Travel
          insurance is strongly recommended for all bookings.
        </p>
      </div>
    </div>
  )
}

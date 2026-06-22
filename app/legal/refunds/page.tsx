import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Refund Policy' }

export default function RefundsPage() {
  return (
    <div className="container-sm py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: January 2025</p>
      <div className="prose mt-6 max-w-none space-y-4 text-navy/90">
        <p>Cancellation and refund terms are set per tour by each operator and shown at checkout. As a general guide:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>30+ days before travel: full refund</li>
          <li>15–29 days before travel: 50% refund</li>
          <li>Within 14 days of travel: no refund</li>
        </ul>
        <p>
          Day trips and shorter excursions typically follow a 7-day cancellation window. Exact terms are always displayed
          on the tour page before you book.
        </p>
        <h2 className="font-display text-xl font-bold text-navy">Disputes</h2>
        <p>
          If an operator fails to deliver a booked experience, contact our support team within 48 hours of your scheduled
          travel date to open a dispute and request a refund.
        </p>
      </div>
    </div>
  )
}

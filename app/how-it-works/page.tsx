import type { Metadata } from 'next'
import { Search, ShieldCheck, Tent, ClipboardList, Wallet, Headset } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'How booking and listing works on LifeGranted Adventures, for travelers and operators.',
}

const TOURIST_STEPS = [
  { icon: Search, title: 'Search and compare', text: 'Browse vetted tours by region, type, price, and rating.' },
  { icon: ShieldCheck, title: 'Book securely', text: 'Pay online with instant confirmation — no hidden fees, no back-and-forth emails.' },
  { icon: Tent, title: 'Travel with confidence', text: 'Connect directly with your operator via WhatsApp before and during your trip.' },
]

const OPERATOR_STEPS = [
  { icon: ClipboardList, title: 'Apply and get verified', text: 'Submit your TTB license and business details for review — usually within 24 hours.' },
  { icon: Wallet, title: 'List your tours', text: 'Add your tours, pricing, availability, and photos. Go live once approved.' },
  { icon: Headset, title: 'Get booked, get paid', text: 'Receive bookings with 85% payout sent automatically via Flutterwave.' },
]

export default function HowItWorksPage() {
  return (
    <div className="container-lg py-16">
      <h1 className="text-center font-display text-3xl font-bold text-navy">How It Works</h1>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-navy">For Travelers</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {TOURIST_STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-light text-teal">
                <step.icon size={26} />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase text-muted">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-navy">For Operators</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {OPERATOR_STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-light text-gold-dark">
                <step.icon size={26} />
              </span>
              <p className="mt-3 text-xs font-semibold uppercase text-muted">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-navy">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

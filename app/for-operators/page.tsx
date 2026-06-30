import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'For Tour Operators',
  description: 'List your Tanzania tours with LifeGranted Adventures — more bookings, fair commission.',
}

const BENEFITS = [
  'Only 15% commission — still below industry standard',
  'Automatic 85% payout via Flutterwave',
  'Instant booking confirmation, no back-and-forth',
  'Featured placement for top-rated operators',
  'Dedicated Mwanza-based support team',
  'Built-in review system to build trust',
  'No listing fees, no setup costs',
  'Direct WhatsApp connection to travelers',
]

const COMMISSION_ROWS = [
  { name: 'LifeGranted Adventures', rate: '15%', note: 'incl. 3% Guarantee Fund' },
  { name: 'SafariBookings', rate: '20–25%', note: '' },
  { name: 'Viator', rate: '20–30%', note: '' },
]

export default function ForOperatorsPage() {
  return (
    <div>
      <section className="bg-navy py-20 text-center text-white">
        <div className="container-sm">
          <h1 className="font-display text-4xl font-bold">More Bookings. Fair Commission.</h1>
          <p className="mt-3 text-white/80">
            Join Tanzania&apos;s fastest-growing safari marketplace and keep more of what you earn.
          </p>
          <Link href="/operator/register" className={cn(buttonVariants({ variant: 'gold' }), 'mt-6 inline-block')}>
            Apply to Join
          </Link>
        </div>
      </section>

      <section className="container-lg py-16">
        <h2 className="text-center font-display text-2xl font-bold text-navy">Commission Comparison</h2>
        <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-xl border border-border">
          {COMMISSION_ROWS.map((row, i) => (
            <div
              key={row.name}
              className={`flex items-center justify-between px-5 py-4 ${i === 0 ? 'bg-teal-light' : 'bg-white'} ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <div>
                <span className={`font-medium ${i === 0 ? 'text-teal' : 'text-navy'}`}>{row.name}</span>
                {row.note && <p className="text-xs text-muted">{row.note}</p>}
              </div>
              <span className={`font-display text-lg font-bold ${i === 0 ? 'text-teal' : 'text-navy'}`}>{row.rate}</span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted">
          Our 15% includes a 3% Guarantee Fund — this protects tourists and operators from disputes. It comes from the platform, not from your 85% share.
        </p>
      </section>

      <section className="bg-white py-16">
        <div className="container-lg">
          <h2 className="text-center font-display text-2xl font-bold text-navy">Why Operators Choose Us</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-teal" />
                <p className="text-sm text-navy">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/operator/register" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              Apply to Join
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

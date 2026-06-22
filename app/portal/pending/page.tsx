import Link from 'next/link'
import { getCurrentOperator } from '@/lib/operator-auth'
import { ConfettiCheckmark } from '@/components/booking/ConfettiCheckmark'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default async function PortalPendingPage() {
  const operator = await getCurrentOperator()

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div className="max-w-md text-center">
        <ConfettiCheckmark />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">Application Received! 🎉</h1>
        <p className="mt-2 text-muted">Thank you, {operator.business_name}. We&apos;ll review your application within 24 hours.</p>

        <div className="mx-auto mt-8 max-w-sm space-y-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 shrink-0 rounded-full bg-teal" />
            <p className="text-sm text-navy">Application submitted</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 shrink-0 animate-pulse rounded-full bg-gold" />
            <p className="text-sm font-medium text-navy">Under review</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-border" />
            <p className="text-sm text-muted">Approved — tours go live</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted">You&apos;ll receive an email at {operator.email} when your application is approved.</p>
        <p className="mt-3 text-sm text-muted">
          Still reviewing?{' '}
          <a href="https://wa.me/255000000000" target="_blank" rel="noopener noreferrer" className="font-medium text-teal hover:underline">
            WhatsApp us: +255000000000
          </a>
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
            Explore LifeGranted Adventures
          </Link>
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  )
}

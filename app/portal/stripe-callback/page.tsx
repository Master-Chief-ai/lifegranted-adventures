import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getCurrentOperator } from '@/lib/operator-auth'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default async function StripeCallbackPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const hasError = params.error === 'true'

  if (!hasError && params.account_id && isSupabaseConfigured()) {
    try {
      const operator = await getCurrentOperator()
      const supabase = await createClient()
      await supabase.from('operators').update({ stripe_account_id: params.account_id, stripe_onboarding_complete: true }).eq('id', operator.id)
    } catch {
      // best-effort
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md rounded-xl border border-border bg-white p-8 text-center shadow-card">
        {hasError ? (
          <>
            <XCircle className="mx-auto h-14 w-14 text-[#B91C1C]" />
            <h1 className="mt-4 font-display text-xl font-bold text-navy">Setup Could Not Be Completed</h1>
            <p className="mt-2 text-sm text-muted">Something went wrong connecting your payout account.</p>
            <Link href="/portal/payouts" className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 inline-block')}>
              Try Again
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#15803D]" />
            <h1 className="mt-4 font-display text-xl font-bold text-navy">Payout Account Connected</h1>
            <p className="mt-2 text-sm text-muted">You&apos;re all set to receive automatic payouts.</p>
            <Link href="/portal" className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 inline-block')}>
              Go to Portal
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

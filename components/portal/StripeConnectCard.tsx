'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import type { Operator } from '@/types'

export function StripeConnectCard({ operator }: { operator: Operator }) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(operator.stripe_onboarding_complete)

  async function handleConnect() {
    setConnecting(true)
    try {
      const res = await fetch('/api/stripe/connect/create', { method: 'POST' })
      const data = await res.json()
      if (data.url?.startsWith('/portal')) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setConnected(true)
        toast.success('Payout account connected (Development Mode)')
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Could not start Stripe Connect onboarding')
    } finally {
      setConnecting(false)
    }
  }

  if (connected) {
    return (
      <div className="rounded-xl border border-[#15803D]/30 bg-green-50 p-5">
        <p className="font-semibold text-[#15803D]">✓ Payout Account Connected</p>
        <p className="mt-1 text-sm text-[#15803D]/80">Your earnings are automatically transferred to your bank account.</p>
        <p className="mt-2 text-sm text-navy">Bank account: Account ending in ••••4242</p>
        <button className="mt-2 text-xs text-muted hover:underline">Update Bank Details</button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gold/40 bg-gold-light p-5">
      <p className="font-semibold text-gold-dark">⚠️ Payout Account Not Set Up</p>
      <p className="mt-1 text-sm text-gold-dark/80">
        Connect your bank account to receive automatic payouts within 3 business days of each completed tour.
      </p>
      <Button className="mt-3" disabled={connecting} onClick={handleConnect}>
        {connecting ? 'Connecting…' : 'Connect with Stripe'}
      </Button>
    </div>
  )
}

export default StripeConnectCard

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Operator } from '@/types'

const BANKS = ['NMB', 'CRDB', 'NBC', 'Stanbic', 'Equity', 'Other']

export function FlutterwavePayoutCard({ operator }: { operator: Operator }) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(operator.flutterwave_onboarding_complete)
  const [bankName, setBankName] = useState(BANKS[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState(operator.business_name)

  async function handleSave() {
    if (!accountNumber || !accountHolderName) {
      toast.error('Please enter your bank account details')
      return
    }
    setConnecting(true)
    try {
      const res = await fetch('/api/operator/setup-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: operator.business_name,
          email: operator.email,
          bankName,
          accountNumber,
          accountHolderName,
        }),
      })
      if (!res.ok) throw new Error()
      setConnected(true)
      toast.success('Payout account connected')
    } catch {
      toast.error('Could not save bank details')
    } finally {
      setConnecting(false)
    }
  }

  if (connected) {
    return (
      <div className="rounded-xl border border-[#15803D]/30 bg-green-50 p-5">
        <p className="font-semibold text-[#15803D]">✓ Payout Account Connected</p>
        <p className="mt-1 text-sm text-[#15803D]/80">Your earnings are automatically transferred via Flutterwave to your bank account.</p>
        <p className="mt-2 text-sm text-navy">Bank account: ••••{accountNumber.slice(-4) || '4242'}</p>
        <button onClick={() => setConnected(false)} className="mt-2 text-xs text-muted hover:underline">
          Update Bank Details
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gold/40 bg-gold-light p-5">
      <p className="font-semibold text-gold-dark">⚠️ Payout Account Not Set Up</p>
      <p className="mt-1 text-sm text-gold-dark/80">
        Add your bank account to receive automatic Flutterwave payouts within 3 business days of each completed tour.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Bank Name</label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          >
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <Input label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        <Input label="Account Holder Name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
      </div>
      <Button className="mt-3" disabled={connecting} onClick={handleSave}>
        {connecting ? 'Saving…' : 'Save Bank Details'}
      </Button>
    </div>
  )
}

export default FlutterwavePayoutCard

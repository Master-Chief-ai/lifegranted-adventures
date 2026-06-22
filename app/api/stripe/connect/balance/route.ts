import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentOperator } from '@/lib/operator-auth'

export async function GET() {
  if (!stripe) {
    return NextResponse.json({ available: 3960, pending: 1200, currency: 'usd' })
  }

  const operator = await getCurrentOperator()
  if (!operator.stripe_account_id) {
    return NextResponse.json({ available: 0, pending: 0, currency: 'usd' })
  }

  try {
    const balance = await stripe.balance.retrieve({}, { stripeAccount: operator.stripe_account_id })
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100
    return NextResponse.json({ available, pending, currency: 'usd' })
  } catch (error) {
    console.error('Failed to retrieve Stripe balance', error)
    return NextResponse.json({ available: 0, pending: 0, currency: 'usd' })
  }
}

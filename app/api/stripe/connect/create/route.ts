import { NextResponse } from 'next/server'
import { createConnectAccountLink } from '@/lib/stripe'
import { getCurrentOperator } from '@/lib/operator-auth'

export async function POST() {
  const operator = await getCurrentOperator()
  try {
    const result = await createConnectAccountLink(operator.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to create Stripe Connect link', error)
    return NextResponse.json({ url: '/portal/stripe-callback?error=true' })
  }
}

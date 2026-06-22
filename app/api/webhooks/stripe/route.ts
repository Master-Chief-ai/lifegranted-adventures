import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!webhookSecret || webhookSecret.includes('placeholder') || !stripe) {
    return NextResponse.json({ received: true })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error)
    return NextResponse.json({ received: true }, { status: 200 })
  }

  try {
    if (event.type === 'payment_intent.succeeded' && isSupabaseConfigured()) {
      const paymentIntent = event.data.object as { id: string }
      const supabase = await createClient()
      await supabase.from('bookings').update({ payment_status: 'paid' }).eq('stripe_payment_intent_id', paymentIntent.id)
    }

    if (event.type === 'account.updated' && isSupabaseConfigured()) {
      const account = event.data.object as { id: string; details_submitted?: boolean }
      const supabase = await createClient()
      await supabase
        .from('operators')
        .update({ stripe_onboarding_complete: !!account.details_submitted })
        .eq('stripe_account_id', account.id)
    }
  } catch (error) {
    console.error('Stripe webhook handling failed', error)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe =
  !secretKey || secretKey.includes('placeholder')
    ? null
    : new Stripe(secretKey)

export async function createPaymentIntent(amount: number, operatorStripeAccountId: string | null) {
  if (!stripe || !operatorStripeAccountId) {
    return { clientSecret: 'mock_secret_' + Date.now(), paymentIntentId: 'mock_pi_' + Date.now() }
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    application_fee_amount: Math.round(amount * 100 * 0.12),
    transfer_data: { destination: operatorStripeAccountId },
  })
  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
}

export async function createConnectAccountLink(operatorId: string) {
  if (!stripe) return { url: '/portal?stripe=mock-connected', accountId: `mock_acct_${operatorId}` }
  const account = await stripe.accounts.create({ type: 'express' })
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/stripe-callback?error=true`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/stripe-callback?account_id=${account.id}`,
    type: 'account_onboarding',
  })
  return { url: accountLink.url, accountId: account.id }
}

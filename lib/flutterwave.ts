const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

export const flutterwaveEnabled = !!secretKey && !secretKey.includes('placeholder')

export type FlutterwavePaymentMethod = 'card' | 'mpesa' | 'airtel' | 'tigo'

// Flutterwave processing fees, passed through to the tourist as a "Booking fee"
// rather than absorbed by the platform or the operator.
export const FLUTTERWAVE_FEES: Record<FlutterwavePaymentMethod, number> = {
  card: 0.038, // 3.8% for international Visa/Mastercard
  mpesa: 0.014, // 1.4% for M-Pesa
  airtel: 0.014, // 1.4% for Airtel Money
  tigo: 0.014, // 1.4% for Tigo Pesa
}

export interface FeeBreakdown {
  tourTotal: number
  bookingFee: number
  grandTotal: number
  platformCommission: number
  operatorPayout: number
}

// Commission and operator payout are always calculated on the tour total only,
// never on the grand total — the booking fee is a pure pass-through to Flutterwave,
// paid by the tourist, and never affects platform or operator earnings.
export function calculateFees(tourTotalUsd: number, paymentMethod: FlutterwavePaymentMethod): FeeBreakdown {
  const feeRate = FLUTTERWAVE_FEES[paymentMethod]
  const bookingFee = Math.round(tourTotalUsd * feeRate * 100) / 100
  const grandTotal = Math.round((tourTotalUsd + bookingFee) * 100) / 100
  const platformCommission = Math.round(tourTotalUsd * 0.12 * 100) / 100
  const operatorPayout = Math.round(tourTotalUsd * 0.88 * 100) / 100

  return {
    tourTotal: tourTotalUsd,
    bookingFee,
    grandTotal,
    platformCommission,
    operatorPayout,
  }
}

export interface InitiatePaymentParams {
  amount: number
  currency: string
  email: string
  phone: string
  name: string
  txRef: string
  paymentMethod: FlutterwavePaymentMethod
  operatorSubaccountId: string | null
}

export async function initiatePayment(params: InitiatePaymentParams) {
  if (!flutterwaveEnabled) {
    return { status: 'success', mockMode: true, txRef: params.txRef }
  }

  const endpoint =
    params.paymentMethod === 'card' ? 'https://api.flutterwave.com/v3/payments' : 'https://api.flutterwave.com/v3/charges?type=mpesa'

  const body = {
    tx_ref: params.txRef,
    amount: params.amount,
    currency: params.currency,
    redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/booking/flutterwave-callback`,
    customer: { email: params.email, phone_number: params.phone, name: params.name },
    subaccounts: params.operatorSubaccountId ? [{ id: params.operatorSubaccountId, transaction_split_ratio: 88 }] : [],
    customizations: {
      title: 'LifeGranted Adventures',
      description: 'Tanzania Safari Booking',
      logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function verifyPayment(transactionId: string) {
  if (!flutterwaveEnabled) return { status: 'successful', mockMode: true }
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  return response.json()
}

export interface CreateSubaccountParams {
  businessName: string
  email: string
  bankCode: string
  accountNumber: string
}

export async function createSubaccount(operator: CreateSubaccountParams) {
  if (!flutterwaveEnabled) return { id: 'mock_subaccount_' + Date.now() }
  const response = await fetch('https://api.flutterwave.com/v3/subaccounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_bank: operator.bankCode,
      account_number: operator.accountNumber,
      business_name: operator.businessName,
      business_email: operator.email,
      country: 'TZ',
      split_type: 'percentage',
      split_value: 0.88,
    }),
  })
  return response.json()
}

const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

export const flutterwaveEnabled = !!secretKey && !secretKey.includes('placeholder')

export interface InitiateChargeParams {
  amount: number
  currency: string
  email: string
  phone: string
  name: string
  txRef: string
  operatorSubaccountId: string | null
}

export async function initiateCharge(params: InitiateChargeParams) {
  if (!flutterwaveEnabled) {
    return { status: 'success', data: { id: 'mock_flw_' + Date.now(), link: null } }
  }
  const response = await fetch('https://api.flutterwave.com/v3/charges?type=mpesa', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      phone_number: params.phone,
      fullname: params.name,
      tx_ref: params.txRef,
      subaccounts: params.operatorSubaccountId ? [{ id: params.operatorSubaccountId, transaction_split_ratio: 88 }] : [],
    }),
  })
  return response.json()
}

import { NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/flutterwave'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getBookingByRef } from '@/lib/supabase/queries'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const transactionId = searchParams.get('transaction_id')
  const status = searchParams.get('status')
  const txRef = searchParams.get('tx_ref')

  if (status !== 'successful' || !transactionId) {
    const fallbackSlug = txRef ? await resolveTourSlug(txRef) : null
    const url = fallbackSlug ? `${origin}/book/${fallbackSlug}/payment?error=payment_failed` : `${origin}/tours`
    return NextResponse.redirect(url)
  }

  try {
    const verification = await verifyPayment(transactionId)
    const verifiedTxRef = verification.data?.tx_ref ?? txRef
    const verifiedStatus = verification.data?.status ?? verification.status

    if (verifiedStatus === 'successful' && verifiedTxRef) {
      if (isSupabaseConfigured()) {
        const supabase = await createClient()
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid', booking_status: 'confirmed' })
          .eq('flutterwave_tx_ref', verifiedTxRef)
      }

      const booking = await getBookingByRef(verifiedTxRef)
      const tourSlug = booking?.tour.slug
      const url = tourSlug ? `${origin}/book/${tourSlug}/confirmed?ref=${verifiedTxRef}` : `${origin}/tours`
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Flutterwave callback verification failed', error)
  }

  const fallbackSlug = txRef ? await resolveTourSlug(txRef) : null
  const url = fallbackSlug ? `${origin}/book/${fallbackSlug}/payment?error=payment_failed` : `${origin}/tours`
  return NextResponse.redirect(url)
}

async function resolveTourSlug(txRef: string): Promise<string | null> {
  try {
    const booking = await getBookingByRef(txRef)
    return booking?.tour.slug ?? null
  } catch {
    return null
  }
}

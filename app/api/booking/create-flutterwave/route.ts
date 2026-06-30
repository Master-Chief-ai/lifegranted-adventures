import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured, MOCK_TOURS, MOCK_OPERATORS } from '@/lib/supabase/mock-data'
import { addRuntimeBooking } from '@/lib/supabase/runtime-bookings'
import { sendBookingConfirmation } from '@/lib/email'
import { initiatePayment, calculateFees, flutterwaveEnabled } from '@/lib/flutterwave'
import { calculateBookingFees } from '@/lib/commission'
import type { Booking, Tour, Operator, TourAddon } from '@/types'

const schema = z.object({
  tourSlug: z.string(),
  travelDate: z.string(),
  groupSize: z.number().min(1),
  addons: z.array(z.string()).default([]),
  touristName: z.string().min(2),
  touristEmail: z.string().email(),
  touristWhatsapp: z.string().min(6),
  touristNationality: z.string().optional(),
  specialRequests: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  medicalNotes: z.string().optional(),
  paymentMethod: z.enum(['card', 'mpesa', 'airtel', 'tigo']),
  // Client-computed figures, shown for UX continuity — the server always recalculates
  // the authoritative tourTotal/bookingFee/grandTotal from the tour record below.
  tourTotal: z.number().optional(),
  bookingFee: z.number().optional(),
  grandTotal: z.number().optional(),
})

function generateBookingRef() {
  return `LGA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = schema.parse(payload)

    let tour: Tour | undefined
    let operator: Operator | undefined

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient()
        const { data: tourRow, error } = await supabase.from('tours').select('*, operator:operators(*)').eq('slug', data.tourSlug).single()
        if (error) throw error
        tour = tourRow
        operator = tourRow.operator
      } catch {
        // fall through to mock
      }
    }

    if (!tour) {
      tour = MOCK_TOURS.find((t) => t.slug === data.tourSlug)
      operator = MOCK_OPERATORS.find((o) => o.id === tour?.operator_id)
    }

    if (!tour || !operator) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 })
    }

    const selectedAddons: TourAddon[] = tour.addons.filter((a) => data.addons.includes(a.id))
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price_usd, 0) * data.groupSize
    const tourTotal = tour.price_usd * data.groupSize + addonsTotal
    const { bookingFee, grandTotal, platformCommission, operatorPayout } = calculateFees(tourTotal, data.paymentMethod)
    const paymentMethodGroup = data.paymentMethod === 'card' ? 'card' : 'mobile'
    const commissionFees = calculateBookingFees(tourTotal, paymentMethodGroup)
    const txRef = generateBookingRef()

    const paymentResult = await initiatePayment({
      amount: grandTotal,
      currency: 'USD',
      email: data.touristEmail,
      phone: data.touristWhatsapp,
      name: data.touristName,
      txRef,
      paymentMethod: data.paymentMethod,
      operatorSubaccountId: operator.flutterwave_subaccount_id,
    })

    const isMock = !flutterwaveEnabled
    const booking: Booking = {
      id: `mock-${Date.now()}`,
      booking_ref: txRef,
      tour_id: tour.id,
      operator_id: operator.id,
      tourist_id: null,
      tourist_name: data.touristName,
      tourist_email: data.touristEmail,
      tourist_phone: data.touristWhatsapp,
      tourist_whatsapp: data.touristWhatsapp,
      tourist_nationality: data.touristNationality ?? null,
      group_size: data.groupSize,
      travel_date: data.travelDate,
      special_requests: data.specialRequests ?? null,
      dietary_requirements: data.dietaryRequirements ?? null,
      medical_notes: data.medicalNotes ?? null,
      addons: selectedAddons,
      total_usd: tourTotal,
      platform_fee_usd: commissionFees.platformCommission,
      operator_payout_usd: commissionFees.operatorPayout,
      booking_fee_usd: commissionFees.bookingFee,
      charged_to_tourist_usd: commissionFees.touristTotal,
      payment_status: isMock ? 'paid' : 'pending',
      payment_method: data.paymentMethod,
      booking_status: isMock ? 'confirmed' : 'pending',
      flutterwave_tx_ref: txRef,
      payout_released: false,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient()
        const { data: inserted, error } = await supabase
          .from('bookings')
          .insert({
            tour_id: tour.id,
            operator_id: operator.id,
            tourist_name: data.touristName,
            tourist_email: data.touristEmail,
            tourist_whatsapp: data.touristWhatsapp,
            tourist_nationality: data.touristNationality ?? null,
            group_size: data.groupSize,
            travel_date: data.travelDate,
            special_requests: data.specialRequests ?? null,
            dietary_requirements: data.dietaryRequirements ?? null,
            medical_notes: data.medicalNotes ?? null,
            addons: selectedAddons,
            total_usd: tourTotal,
            platform_fee_usd: commissionFees.platformCommission,
            guarantee_fund_contribution: commissionFees.guaranteeFundContribution,
            platform_operating_revenue: commissionFees.platformOperatingRevenue,
            operator_payout_usd: commissionFees.operatorPayout,
            booking_fee_usd: commissionFees.bookingFee,
            charged_to_tourist_usd: commissionFees.touristTotal,
            payment_status: booking.payment_status,
            booking_status: booking.booking_status,
            payment_method: data.paymentMethod,
            flutterwave_tx_ref: txRef,
            source: 'platform',
          })
          .select()
          .single()
        if (error) throw error
        if (inserted) {
          if (isMock) await sendBookingConfirmation(inserted as Booking, tour, operator)
          return NextResponse.json(buildResponse(data.paymentMethod, isMock, txRef, inserted.booking_ref, inserted, paymentResult))
        }
      } catch {
        // fall through to mock booking below
      }
    }

    addRuntimeBooking(booking)
    if (isMock) await sendBookingConfirmation(booking, tour, operator)
    return NextResponse.json(buildResponse(data.paymentMethod, isMock, txRef, booking.booking_ref, booking, paymentResult))
  } catch (error) {
    console.error('Booking creation failed', error)
    return NextResponse.json({ success: false, error: 'Invalid booking data' }, { status: 400 })
  }
}

function buildResponse(
  paymentMethod: 'card' | 'mpesa' | 'airtel' | 'tigo',
  isMock: boolean,
  txRef: string,
  bookingRef: string,
  booking: unknown,
  paymentResult: { data?: { link?: string } }
) {
  if (isMock) {
    return { success: true, bookingRef, booking, txRef }
  }
  if (paymentMethod === 'card') {
    return { success: true, txRef, bookingRef, redirectUrl: paymentResult.data?.link ?? null }
  }
  return { success: true, txRef, bookingRef, message: 'Check your phone' }
}

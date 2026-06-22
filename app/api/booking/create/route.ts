import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured, MOCK_TOURS, MOCK_OPERATORS } from '@/lib/supabase/mock-data'
import { addRuntimeBooking } from '@/lib/supabase/runtime-bookings'
import { sendBookingConfirmation } from '@/lib/email'
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
  paymentMethod: z.enum(['card', 'mobile_money']).default('card'),
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
    const totalUsd = tour.price_usd * data.groupSize + addonsTotal
    const platformFee = Math.round(totalUsd * 0.12 * 100) / 100
    const operatorPayout = Math.round(totalUsd * 0.88 * 100) / 100
    const bookingRef = generateBookingRef()

    const booking: Booking = {
      id: `mock-${Date.now()}`,
      booking_ref: bookingRef,
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
      total_usd: totalUsd,
      platform_fee_usd: platformFee,
      operator_payout_usd: operatorPayout,
      payment_status: 'paid',
      payment_method: data.paymentMethod,
      booking_status: 'confirmed',
      stripe_payment_intent_id: null,
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
            total_usd: totalUsd,
            platform_fee_usd: platformFee,
            operator_payout_usd: operatorPayout,
            payment_status: 'paid',
            booking_status: 'confirmed',
            payment_method: data.paymentMethod,
            source: 'platform',
          })
          .select()
          .single()
        if (error) throw error
        if (inserted) {
          await sendBookingConfirmation(inserted as Booking, tour, operator)
          return NextResponse.json({ success: true, bookingRef: inserted.booking_ref, booking: inserted })
        }
      } catch {
        // fall through to mock booking below
      }
    }

    addRuntimeBooking(booking)
    await sendBookingConfirmation(booking, tour, operator)
    return NextResponse.json({ success: true, bookingRef: booking.booking_ref, booking })
  } catch (error) {
    console.error('Booking creation failed', error)
    return NextResponse.json({ success: false, error: 'Invalid booking data' }, { status: 400 })
  }
}

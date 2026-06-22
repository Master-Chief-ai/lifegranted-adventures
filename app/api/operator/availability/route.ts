import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({
  tourId: z.string(),
  dates: z.array(
    z.object({
      date: z.string(),
      slotsTotal: z.number(),
      slotsRemaining: z.number(),
      priceOverride: z.number().nullable().optional(),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { tourId, dates } = schema.parse(payload)

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true, count: dates.length })
    }

    const supabase = await createClient()
    const rows = dates.map((d) => ({
      tour_id: tourId,
      available_date: d.date,
      slots_total: d.slotsTotal,
      slots_remaining: d.slotsRemaining,
      price_override_usd: d.priceOverride ?? null,
    }))

    const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'tour_id,available_date' })
    if (error) throw error

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error) {
    console.error('Failed to upsert availability', error)
    return NextResponse.json({ success: false, error: 'Invalid availability data' }, { status: 400 })
  }
}

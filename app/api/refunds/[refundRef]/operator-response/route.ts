import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminSupabase } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({
  acceptance: z.enum(['full', 'partial', 'dispute']),
  partialAmount: z.number().optional(),
  responseStatement: z.string().min(20),
  evidence: z.array(z.string()).default([]),
})

export async function POST(request: Request, { params }: { params: Promise<{ refundRef: string }> }) {
  const { refundRef } = await params

  if (!isSupabaseConfigured() || !adminSupabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const data = schema.parse(await request.json())

    const { data: updated, error } = await adminSupabase
      .from('refund_requests')
      .update({
        operator_response: data.responseStatement,
        operator_evidence: data.evidence,
        operator_responded_at: new Date().toISOString(),
        status: 'under_review',
      })
      .eq('reference_code', refundRef)
      .select('*, bookings(tourist_email, tourist_name, tours(title))')
      .single()

    if (error || !updated) return NextResponse.json({ success: false, error: 'Not found or update failed' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Operator response failed', error)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

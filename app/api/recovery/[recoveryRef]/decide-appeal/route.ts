import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { sendAppealDecision } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ recoveryRef: string }> }) {
  const { recoveryRef } = await params

  try {
    const { upheld, decisionNotes } = await req.json()
    if (typeof upheld !== 'boolean' || !decisionNotes) {
      return NextResponse.json({ error: 'upheld (boolean) and decisionNotes required' }, { status: 400 })
    }

    if (!adminSupabase) return NextResponse.json({ success: true })

    const newStatus = upheld ? 'appeal_upheld' : 'appeal_rejected'

    const { data: notice } = await adminSupabase
      .from('recovery_notices')
      .update({
        status: newStatus,
        notes: decisionNotes,
        appeal_decided_at: new Date().toISOString(),
        ...(upheld ? { remaining_to_recover: 0 } : {}),
      })
      .eq('reference_code', recoveryRef)
      .select('*, operators(email, business_name)')
      .single()

    if (notice?.operators?.email) {
      await sendAppealDecision(notice.operators.email, notice.operators.business_name, recoveryRef, upheld, decisionNotes)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

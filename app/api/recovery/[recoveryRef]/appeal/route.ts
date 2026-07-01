import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendAppealReceived } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ recoveryRef: string }> }) {
  const { recoveryRef } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { statement } = await req.json()
    if (!statement || statement.trim().length < 50) {
      return NextResponse.json({ error: 'Statement must be at least 50 characters' }, { status: 400 })
    }

    if (!adminSupabase) return NextResponse.json({ success: true })

    const { data: notice } = await adminSupabase
      .from('recovery_notices')
      .update({
        status: 'appealing',
        appeal_statement: statement,
        appeal_submitted_at: new Date().toISOString(),
      })
      .eq('reference_code', recoveryRef)
      .select('*, operators(email, business_name)')
      .single()

    if (notice?.operators?.email) {
      await sendAppealReceived(notice.operators.email, notice.operators.business_name, recoveryRef)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

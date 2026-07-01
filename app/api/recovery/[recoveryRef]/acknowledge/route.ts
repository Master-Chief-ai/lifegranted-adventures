import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ recoveryRef: string }> }) {
  const { recoveryRef } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!adminSupabase) return NextResponse.json({ success: true })

    await adminSupabase
      .from('recovery_notices')
      .update({ status: 'acknowledged', operator_acknowledged_at: new Date().toISOString() })
      .eq('reference_code', recoveryRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

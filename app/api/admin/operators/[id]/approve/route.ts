import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getOperatorById } from '@/lib/supabase/queries'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!adminSupabase) {
    const operator = getOperatorById(id)
    console.log(`[MOCK EMAIL] Approval notice sent to ${operator?.email ?? id}`)
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase.from('operators').update({ status: 'approved', verified_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to approve operator', error)
    return NextResponse.json({ success: false, error: 'Could not approve operator' }, { status: 400 })
  }
}

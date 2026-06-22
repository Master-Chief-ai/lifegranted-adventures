import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminSupabase } from '@/lib/supabase/admin'
import { getOperatorById } from '@/lib/supabase/queries'

const schema = z.object({ reason: z.string().min(1) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reason } = schema.parse(await request.json())

  if (!adminSupabase) {
    const operator = getOperatorById(id)
    console.log(`[MOCK EMAIL] Suspension notice sent to ${operator?.email ?? id}: ${reason}`)
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase.from('operators').update({ status: 'suspended' }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to suspend operator', error)
    return NextResponse.json({ success: false, error: 'Could not suspend operator' }, { status: 400 })
  }
}

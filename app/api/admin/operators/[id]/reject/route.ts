import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminSupabase } from '@/lib/supabase/admin'
import { getOperatorById } from '@/lib/supabase/queries'
import { sendOperatorRejected } from '@/lib/email'

const schema = z.object({ reason: z.string().min(1) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reason } = schema.parse(await request.json())

  if (!adminSupabase) {
    const operator = getOperatorById(id)
    console.log(`[MOCK EMAIL] Rejection notice sent to ${operator?.email ?? id}: ${reason}`)
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase
      .from('operators')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
    if (error) throw error

    const { data: operator } = await adminSupabase
      .from('operators')
      .select('email, business_name')
      .eq('id', id)
      .single()

    if (operator?.email) {
      await sendOperatorRejected(operator.email, operator.business_name, reason)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reject operator', error)
    return NextResponse.json({ success: false, error: 'Could not reject operator' }, { status: 400 })
  }
}

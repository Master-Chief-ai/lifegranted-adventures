import { NextResponse } from 'next/server'
import { z } from 'zod'
import { recordAdjustment } from '@/lib/guarantee-fund'
import { adminSupabase } from '@/lib/supabase/admin'

const schema = z.object({
  amount: z.number(),
  notes: z.string().min(1),
  adminId: z.string().optional().default('admin'),
})

export async function POST(request: Request) {
  if (!adminSupabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }
  try {
    const data = schema.parse(await request.json())
    await recordAdjustment(data.amount, data.notes, data.adminId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

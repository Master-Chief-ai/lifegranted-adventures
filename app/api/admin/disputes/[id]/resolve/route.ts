import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminSupabase } from '@/lib/supabase/admin'

const schema = z.object({ decision: z.string(), resolutionNotes: z.string().min(1) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { decision, resolutionNotes } = schema.parse(await request.json())
  const resolution = `${decision} — ${resolutionNotes}`

  if (!adminSupabase) {
    console.log(`[MOCK DISPUTE RESOLUTION] ${id}: ${resolution}`)
    console.log('[MOCK EMAIL] Resolution notice sent to tourist and operator')
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { error } = await adminSupabase
      .from('disputes')
      .update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to resolve dispute', error)
    return NextResponse.json({ success: false, error: 'Could not resolve dispute' }, { status: 400 })
  }
}

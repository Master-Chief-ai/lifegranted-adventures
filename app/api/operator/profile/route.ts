import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getCurrentOperator } from '@/lib/operator-auth'

export async function GET() {
  const operator = await getCurrentOperator()
  return NextResponse.json({ data: operator })
}

export async function PUT(request: Request) {
  const operator = await getCurrentOperator()
  const payload = await request.json()

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mock: true, operator: { ...operator, ...payload } })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('operators').update(payload).eq('id', operator.id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, operator: data })
  } catch (error) {
    console.error('Failed to update operator profile', error)
    return NextResponse.json({ success: false, error: 'Could not update profile' }, { status: 400 })
  }
}

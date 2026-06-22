import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorTourById } from '@/lib/supabase/queries'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const operator = await getCurrentOperator()
  const tour = await getOperatorTourById(operator.id, id)
  if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  return NextResponse.json({ data: tour })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const operator = await getCurrentOperator()
  const payload = await request.json()

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mock: true, tour: { id, operator_id: operator.id, ...payload } })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('tours').update(payload).eq('id', id).eq('operator_id', operator.id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, tour: data })
  } catch (error) {
    console.error('Failed to update tour', error)
    return NextResponse.json({ success: false, error: 'Could not update tour' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const operator = await getCurrentOperator()

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('tours').update({ is_active: false }).eq('id', id).eq('operator_id', operator.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to archive tour', error)
    return NextResponse.json({ success: false, error: 'Could not archive tour' }, { status: 400 })
  }
}

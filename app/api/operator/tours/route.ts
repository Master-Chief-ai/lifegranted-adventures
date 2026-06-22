import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getCurrentOperator } from '@/lib/operator-auth'
import { getOperatorTours } from '@/lib/supabase/queries'
import { slugify } from '@/lib/utils'

export async function GET() {
  const operator = await getCurrentOperator()
  const tours = await getOperatorTours(operator.id)
  return NextResponse.json({ data: tours })
}

export async function POST(request: Request) {
  const operator = await getCurrentOperator()
  const payload = await request.json()

  const slug = payload.slug || slugify(payload.title ?? 'new-tour')

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      mock: true,
      tour: { id: `mock-tour-${Date.now()}`, operator_id: operator.id, ...payload, slug },
    })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tours')
      .insert({ ...payload, slug, operator_id: operator.id })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, tour: data })
  } catch (error) {
    console.error('Failed to create tour', error)
    return NextResponse.json({ success: false, error: 'Could not create tour' }, { status: 400 })
  }
}

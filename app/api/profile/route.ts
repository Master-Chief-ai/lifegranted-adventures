import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { getUser } from '@/lib/auth'

const schema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  nationality: z.string().optional(),
})

export async function PATCH(request: Request) {
  try {
    const payload = await request.json()
    const data = schema.parse(payload)

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const supabase = await createClient()
    await supabase.from('profiles').update(data).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid profile data' }, { status: 400 })
  }
}

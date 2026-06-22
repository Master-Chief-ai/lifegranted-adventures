import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient()
        await supabase.from('email_subscribers').insert({ email, source: 'newsletter' })
      } catch {
        // swallow — still report success in mock-friendly fashion
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      // ignore — redirect to login below if needed
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}

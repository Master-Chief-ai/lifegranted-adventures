import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured, MOCK_OPERATORS } from '@/lib/supabase/mock-data'
import { getUser } from '@/lib/auth'
import type { Operator } from '@/types'

// Returns the operator record for the currently signed-in user.
// In mock mode (no Supabase configured) we simulate being logged in as the
// first demo operator so the portal can be fully explored without real auth.
export async function getCurrentOperator(): Promise<Operator> {
  if (isSupabaseConfigured()) {
    try {
      const user = await getUser()
      if (user) {
        const supabase = await createClient()
        const { data, error } = await supabase.from('operators').select('*').eq('user_id', user.id).single()
        if (!error && data) return data as Operator
      }
    } catch {
      // fall through to mock
    }
  }
  return MOCK_OPERATORS[0]
}

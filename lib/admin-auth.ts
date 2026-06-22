import { getUserProfile } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

export interface AdminUser {
  name: string
  email: string
}

// Mirrors getCurrentOperator's mock-mode behaviour so /admin is fully explorable
// without real auth when Supabase is not connected.
export async function getCurrentAdmin(): Promise<AdminUser> {
  if (isSupabaseConfigured()) {
    const profile = await getUserProfile()
    if (profile) {
      return { name: profile.full_name ?? 'Admin', email: 'admin@lifegrantedadventures.co.tz' }
    }
  }
  return { name: 'Stephen (Admin)', email: 'stephen@lifegrantedadventures.co.tz' }
}

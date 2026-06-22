import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Service-role client that bypasses RLS — server-only, never import from a client component.
export const adminSupabase =
  isSupabaseConfigured() && serviceKey && !serviceKey.includes('placeholder') ? createClient(url!, serviceKey) : null

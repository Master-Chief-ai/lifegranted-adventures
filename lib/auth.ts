import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import type { UserProfile, UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user ?? null
  } catch {
    return null
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const user = await getUser()
    if (!user) return null
    const supabase = await createClient()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (error) return null
    return data as UserProfile
  } catch {
    return null
  }
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile()
  return profile?.role ?? null
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // no-op in mock mode
  }
}

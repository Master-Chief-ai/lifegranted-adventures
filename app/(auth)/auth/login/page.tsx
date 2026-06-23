'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'
  const [loading, setLoading] = useState(false)
  const devMode = !isSupabaseConfigured()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    if (devMode) {
      toast.info('Development mode — login unavailable until Supabase is connected')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error, data } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      toast.success('Welcome back!')
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'operator') {
        router.push('/portal')
      } else {
        router.push(returnTo === '/auth/login' ? '/' : returnTo)
      }
    } catch {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (devMode) {
      toast.info('Development mode — login unavailable until Supabase is connected')
      return
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-teal font-display text-sm font-bold text-white">
            LGA
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your bookings and trips</p>
        </div>

        {devMode && (
          <p className="mt-4 rounded-lg bg-gold-light p-3 text-center text-xs text-gold-dark">
            Development mode — login unavailable until Supabase is connected
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-teal hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-teal hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}

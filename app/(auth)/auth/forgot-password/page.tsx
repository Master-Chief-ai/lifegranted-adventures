'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const devMode = !isSupabaseConfigured()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    if (devMode) {
      toast.info('Password reset unavailable — Supabase not connected')
      setSent(true)
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        {sent ? (
          <>
            <h1 className="font-display text-2xl font-bold text-navy">Check your email</h1>
            <p className="mt-2 text-sm text-muted">
              If an account exists for that email, we&apos;ve sent a link to reset your password.
            </p>
            <Link href="/auth/login" className="mt-6 inline-block text-sm font-medium text-teal hover:underline">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-navy">Reset your password</h1>
            <p className="mt-1 text-sm text-muted">Enter your email and we&apos;ll send you a reset link</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}

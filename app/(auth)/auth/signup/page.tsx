'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'
import { COUNTRIES } from '@/lib/constants'

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    whatsapp: z.string().optional(),
    nationality: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const devMode = !isSupabaseConfigured()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    if (devMode) {
      toast.info('Account creation unavailable — Supabase not connected')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.fullName } },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          role: 'tourist',
          full_name: values.fullName,
          whatsapp: values.whatsapp || null,
          nationality: values.nationality || null,
        })
      }
      toast.success('Account created! Welcome to LifeGranted Adventures.')
      router.push('/')
    } catch {
      toast.error('Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-navy">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Book Tanzania safaris direct with vetted operators</p>
        </div>

        {devMode && (
          <p className="mt-4 rounded-lg bg-gold-light p-3 text-center text-xs text-gold-dark">
            Account creation unavailable — Supabase not connected
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full Name" placeholder="Jane Traveler" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Input label="WhatsApp (optional)" placeholder="+1 555 000 0000" {...register('whatsapp')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Nationality (optional)</label>
            <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" {...register('nationality')}>
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-teal hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}

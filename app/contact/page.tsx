'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { MessageCircle, MapPin, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormValues = z.infer<typeof schema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      toast.success("Message sent! We'll get back to you within 24 hours.")
      reset()
    } catch {
      toast.error('Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-lg py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Get in Touch</h1>
      <p className="mt-1 text-muted">We typically respond within 24 hours</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Message</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
                placeholder="How can we help?"
                {...register('message')}
              />
              {errors.message && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <a
            href="https://wa.me/255000000000?text=Hello+LifeGranted+Adventures"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-card hover:shadow-card-hover"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-gold-dark">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="font-semibold text-navy">Chat on WhatsApp</p>
              <p className="text-sm text-muted">Fastest way to reach us</p>
            </div>
          </a>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-light text-teal">
              <Mail size={20} />
            </span>
            <div>
              <p className="font-semibold text-navy">hello@lifegranted-adventures.co.tz</p>
              <p className="text-sm text-muted">Email support</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-light text-teal">
              <MapPin size={20} />
            </span>
            <div>
              <p className="font-semibold text-navy">Mwanza Office</p>
              <p className="text-sm text-muted">Capri Point Road, Mwanza, Tanzania</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

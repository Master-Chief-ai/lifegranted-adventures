'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COUNTRIES } from '@/lib/constants'
import { getBookingDraft, saveBookingDraft, type BookingDraft } from '@/lib/booking-state'
import { formatCurrency } from '@/lib/utils'

const schema = z
  .object({
    touristName: z.string().min(2, 'Enter the lead traveller name'),
    touristEmail: z.string().email('Enter a valid email'),
    confirmEmail: z.string().email('Enter a valid email'),
    countryCode: z.string(),
    whatsappNumber: z.string().min(6, 'Enter a WhatsApp number'),
    touristNationality: z.string().min(1, 'Select your nationality'),
    children: z.number().min(0).max(10),
    childrenAges: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    medicalNotes: z.string().optional(),
    specialOccasion: z.string().optional(),
    hearAboutUs: z.string().optional(),
    agreedTerms: z.boolean().refine((v) => v, 'You must agree to the terms'),
    agreedConsent: z.boolean().refine((v) => v, 'You must consent to receive pre-departure information'),
  })
  .refine((data) => data.touristEmail === data.confirmEmail, { message: 'Emails do not match', path: ['confirmEmail'] })

type FormValues = z.infer<typeof schema>

const HEAR_OPTIONS = ['Google', 'Instagram', 'Facebook', 'Travel Agent', 'Friend', 'Repeat visitor', 'Other']

export default function BookingDetailsPage() {
  const params = useParams<{ tourSlug: string }>()
  const router = useRouter()
  const [draft, setDraft] = useState<BookingDraft>(() => getBookingDraft(params.tourSlug))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      touristName: draft.touristName,
      touristEmail: draft.touristEmail,
      confirmEmail: draft.touristEmail,
      countryCode: '+255',
      whatsappNumber: draft.touristWhatsapp,
      touristNationality: draft.touristNationality,
      children: draft.children,
      childrenAges: draft.childrenAges,
      dietaryRequirements: draft.dietaryRequirements,
      medicalNotes: draft.medicalNotes,
      specialOccasion: draft.specialOccasion,
      hearAboutUs: draft.hearAboutUs,
      agreedTerms: draft.agreedTerms,
      agreedConsent: draft.agreedConsent,
    },
  })

  const children = watch('children')

  useEffect(() => {
    if (!draft.date) router.replace(`/book/${params.tourSlug}/dates`)
  }, [draft.date, params.tourSlug, router])

  function onSubmit(values: FormValues) {
    const updated: BookingDraft = {
      ...draft,
      touristName: values.touristName,
      touristEmail: values.touristEmail,
      touristWhatsapp: `${values.countryCode}${values.whatsappNumber}`,
      touristNationality: values.touristNationality,
      children: values.children,
      childrenAges: values.childrenAges ?? '',
      dietaryRequirements: values.dietaryRequirements ?? '',
      medicalNotes: values.medicalNotes ?? '',
      specialOccasion: values.specialOccasion ?? '',
      hearAboutUs: values.hearAboutUs ?? '',
      agreedTerms: values.agreedTerms,
      agreedConsent: values.agreedConsent,
    }
    saveBookingDraft(updated)
    setDraft(updated)
    router.push(`/book/${params.tourSlug}/payment`)
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy">Guest Details</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm">
        <span className="text-navy">Tour total: {formatCurrency(draft.tourTotal)}</span>
        <span className="text-muted">+</span>
        <span className="text-navy">Booking fee: {formatCurrency(draft.bookingFee)}</span>
        <span className="text-muted">=</span>
        <span className="font-semibold text-teal">Total: {formatCurrency(draft.grandTotal)}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
        <section className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Lead Traveller</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" error={errors.touristName?.message} {...register('touristName')} />
            <Input label="Email Address" type="email" error={errors.touristEmail?.message} {...register('touristEmail')} />
            <Input label="Confirm Email" type="email" error={errors.confirmEmail?.message} {...register('confirmEmail')} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">WhatsApp Number</label>
              <div className="flex gap-2">
                <select className="h-11 rounded-lg border border-border bg-white px-2 text-sm text-navy focus:border-teal" {...register('countryCode')}>
                  <option value="+255">+255 (TZ)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+254">+254 (KE)</option>
                </select>
                <input
                  className="h-11 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                  placeholder="700 000 000"
                  {...register('whatsappNumber')}
                />
              </div>
              {errors.whatsappNumber && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.whatsappNumber.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Nationality</label>
              <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" {...register('touristNationality')}>
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.touristNationality && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.touristNationality.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Your Group</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Adults" type="number" defaultValue={draft.guests} disabled />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Children (0-10)</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setValue('children', Math.max(0, children - 1))} className="h-9 w-9 rounded-lg border border-border hover:border-teal">
                  −
                </button>
                <span className="w-8 text-center font-medium text-navy">{children}</span>
                <button type="button" onClick={() => setValue('children', Math.min(10, children + 1))} className="h-9 w-9 rounded-lg border border-border hover:border-teal">
                  +
                </button>
              </div>
            </div>
          </div>
          {children > 0 && (
            <div className="mt-4">
              <Input label="Ages of children (optional)" placeholder="e.g. 6, 9" {...register('childrenAges')} />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Special Requirements (optional)</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Dietary requirements</label>
              <textarea
                rows={2}
                placeholder="Vegetarian, halal, allergies…"
                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
                {...register('dietaryRequirements')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Medical conditions your guide should know</label>
              <textarea rows={2} className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal" {...register('medicalNotes')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Special occasion</label>
              <textarea
                rows={2}
                placeholder="Honeymoon, birthday, anniversary…"
                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
                {...register('specialOccasion')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">How did you hear about us?</label>
              <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" {...register('hearAboutUs')}>
                <option value="">Select an option</option>
                {HEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Confirm</h3>
          <div className="mt-3 space-y-3">
            <label className="flex items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-0.5 accent-teal" {...register('agreedTerms')} />
              <span>
                I have read and agree to the{' '}
                <Link href="/legal/terms" className="text-teal hover:underline" target="_blank">
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link href="/legal/refunds" className="text-teal hover:underline" target="_blank">
                  Cancellation Policy
                </Link>
              </span>
            </label>
            {errors.agreedTerms && <p className="text-xs text-[#B91C1C]">{errors.agreedTerms.message}</p>}
            <label className="flex items-start gap-2 text-sm text-navy">
              <input type="checkbox" className="mt-0.5 accent-teal" {...register('agreedConsent')} />
              <span>I consent to receiving pre-departure information by email and WhatsApp</span>
            </label>
            {errors.agreedConsent && <p className="text-xs text-[#B91C1C]">{errors.agreedConsent.message}</p>}
          </div>
        </section>

        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push(`/book/${params.tourSlug}/dates`)}>
            ← Back
          </Button>
          <Button type="submit" variant="gold">
            Continue to Payment →
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CheckCircle2, Zap, Smartphone, Megaphone, LifeBuoy, Headset, FileCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button, buttonVariants } from '@/components/ui/Button'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { ConfettiCheckmark } from '@/components/booking/ConfettiCheckmark'
import { TANZANIA_REGIONS, TOUR_TYPES } from '@/lib/constants'
import { slugify, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/mock-data'

interface WizardState {
  businessName: string
  contactName: string
  email: string
  password: string
  confirmPassword: string
  whatsapp: string
  city: string
  regions: string[]
  description: string
  ttbNumber: string
  ttbExpiry: string
  tatoMember: boolean
  stripeConnected: boolean
  stripeSkipped: boolean
  firstTour: {
    title: string
    tourType: string
    regions: string[]
    durationDays: number
    priceUsd: number
    shortDescription: string
    photos: string[]
  } | null
  confirmAccurate: boolean
}

const BENEFITS = [
  { icon: Zap, text: '12% commission — lowest in Tanzania' },
  { icon: CheckCircle2, text: 'Instant booking technology' },
  { icon: Smartphone, text: 'M-Pesa payments included' },
  { icon: Megaphone, text: 'Western Tanzania marketing reach' },
  { icon: LifeBuoy, text: 'Free profile setup support' },
  { icon: Headset, text: '24/7 operator support' },
]

function initialState(): WizardState {
  return {
    businessName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    city: 'Mwanza',
    regions: [],
    description: '',
    ttbNumber: '',
    ttbExpiry: '',
    tatoMember: false,
    stripeConnected: false,
    stripeSkipped: false,
    firstTour: null,
    confirmAccurate: false,
  }
}

export default function OperatorRegisterWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardState>(initialState())
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function validateStep1(): boolean {
    if (!data.businessName || !data.contactName || !data.email || !data.password || data.password !== data.confirmPassword) {
      toast.error('Please complete all required fields — passwords must match')
      return false
    }
    if (!data.whatsapp || !data.description || data.description.length < 50 || !data.ttbNumber || !data.ttbExpiry) {
      toast.error('Please complete all required fields (description must be 50+ characters)')
      return false
    }
    return true
  }

  async function handleSubmitApplication() {
    if (!data.confirmAccurate) {
      toast.error('Please confirm your information is accurate')
      return
    }
    setSubmitting(true)
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.contactName } },
        })
        if (error) throw error
        if (authData.user) {
          await supabase.from('profiles').upsert({ id: authData.user.id, role: 'operator', full_name: data.contactName, whatsapp: data.whatsapp })
          await supabase.from('operators').insert({
            user_id: authData.user.id,
            business_name: data.businessName,
            slug: slugify(data.businessName),
            description: data.description,
            city: data.city,
            regions: data.regions,
            whatsapp: data.whatsapp,
            email: data.email,
            ttb_licence_number: data.ttbNumber,
            ttb_expiry: data.ttbExpiry,
            tato_member: data.tatoMember,
            status: 'pending',
          })
          if (data.firstTour) {
            await supabase.from('tours').insert({
              operator_id: authData.user.id,
              slug: slugify(data.firstTour.title),
              title: data.firstTour.title,
              tour_type: data.firstTour.tourType,
              regions: data.firstTour.regions,
              duration_days: data.firstTour.durationDays,
              price_usd: data.firstTour.priceUsd,
              meta_description: data.firstTour.shortDescription,
              is_active: false,
            })
          }
        }
      }
      await fetch('/api/notifications/new-operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: data.businessName, city: data.city }),
      })
      setStep(5)
    } catch {
      toast.error('Could not submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream">
      <OnboardingProgress step={step} />
      <div className="container-lg pb-20">
        {step === 1 && (
          <Step1BusinessInfo
            data={data}
            update={update}
            onContinue={() => {
              if (validateStep1()) setStep(2)
            }}
          />
        )}
        {step === 2 && <Step2Payout data={data} update={update} onContinue={() => setStep(3)} />}
        {step === 3 && <Step3FirstTour data={data} update={update} onContinue={() => setStep(4)} />}
        {step === 4 && <Step4Review data={data} update={update} onBackToStep={setStep} onSubmit={handleSubmitApplication} submitting={submitting} />}
        {step === 5 && <Step5Submitted name={data.contactName} email={data.email} />}
      </div>
    </div>
  )
}

function Step1BusinessInfo({
  data,
  update,
  onContinue,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
  onContinue: () => void
}) {
  function toggleRegion(name: string) {
    update('regions', data.regions.includes(name) ? data.regions.filter((r) => r !== name) : [...data.regions, name])
  }

  return (
    <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Why join LifeGranted Adventures?</h1>
        <div className="mt-6 space-y-4">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal">
                <b.icon size={18} />
              </span>
              <p className="text-sm text-navy">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-navy">Business Information</h2>
        <div className="mt-4 space-y-4">
          <Input label="Business Name" value={data.businessName} onChange={(e) => update('businessName', e.target.value)} />
          <Input label="Contact Name" value={data.contactName} onChange={(e) => update('contactName', e.target.value)} />
          <Input label="Email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} />
          <Input label="Password" type="password" value={data.password} onChange={(e) => update('password', e.target.value)} />
          <Input label="Confirm Password" type="password" value={data.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
          <Input label="WhatsApp Number" placeholder="+255 700 000 000" value={data.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">City</label>
            <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" value={data.city} onChange={(e) => update('city', e.target.value)}>
              {['Mwanza', 'Arusha', 'Dar es Salaam', 'Zanzibar', 'Moshi', 'Other'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Regions</label>
            <div className="flex flex-wrap gap-2">
              {TANZANIA_REGIONS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRegion(r.name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${data.regions.includes(r.name) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'}`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Description</label>
            <textarea
              rows={3}
              maxLength={300}
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <p className="mt-1 text-xs text-muted">{data.description.length}/300 (50 minimum)</p>
          </div>
          <Input label="TTB Licence Number" value={data.ttbNumber} onChange={(e) => update('ttbNumber', e.target.value)} />
          <Input label="TTB Expiry Date" type="date" value={data.ttbExpiry} onChange={(e) => update('ttbExpiry', e.target.value)} />
          <label className="flex items-center justify-between text-sm font-medium text-navy">
            TATO Member
            <input type="checkbox" checked={data.tatoMember} onChange={(e) => update('tatoMember', e.target.checked)} className="accent-teal" />
          </label>
          <Button className="w-full" onClick={onContinue}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  )
}

function Step2Payout({
  data,
  update,
  onContinue,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
  onContinue: () => void
}) {
  const [connecting, setConnecting] = useState(false)

  async function connect() {
    setConnecting(true)
    await new Promise((r) => setTimeout(r, 1000))
    update('stripeConnected', true)
    setConnecting(false)
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="font-display text-2xl font-bold text-navy">Set up your payout account</h1>
      <div className="mt-4 rounded-xl border border-teal/30 bg-teal-light p-5 text-sm text-teal">
        Every booking you receive, we automatically transfer 88% to your bank account within 3 business days of tour
        completion. Setup takes about 10 minutes.
      </div>

      {data.stripeConnected ? (
        <div className="mt-6 rounded-xl border border-[#15803D]/30 bg-green-50 p-5 text-center">
          <p className="font-semibold text-[#15803D]">✓ Payout account connected (Development Mode)</p>
        </div>
      ) : (
        <Button className="mt-6 w-full" disabled={connecting} onClick={connect}>
          {connecting ? 'Connecting…' : 'Connect with Stripe'}
        </Button>
      )}

      <div className="mt-8 text-right">
        <Button onClick={onContinue}>Continue →</Button>
      </div>

      {!data.stripeConnected && (
        <button
          onClick={() => {
            update('stripeSkipped', true)
            onContinue()
          }}
          className="mt-3 block text-sm text-muted hover:underline"
        >
          Skip for now — set up later
        </button>
      )}
      {data.stripeSkipped && !data.stripeConnected && (
        <p className="mt-2 text-xs text-gold-dark">You won&apos;t receive payouts until this is set up.</p>
      )}
    </div>
  )
}

function Step3FirstTour({
  data,
  update,
  onContinue,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
  onContinue: () => void
}) {
  const [title, setTitle] = useState(data.firstTour?.title ?? '')
  const [tourType, setTourType] = useState(data.firstTour?.tourType ?? 'safari')
  const [regions, setRegions] = useState<string[]>(data.firstTour?.regions ?? [])
  const [days, setDays] = useState(data.firstTour?.durationDays ?? 3)
  const [price, setPrice] = useState(data.firstTour?.priceUsd ?? 0)
  const [shortDesc, setShortDesc] = useState(data.firstTour?.shortDescription ?? '')

  function toggleRegion(name: string) {
    setRegions((prev) => (prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]))
  }

  function saveAndContinue() {
    update('firstTour', { title, tourType, regions, durationDays: days, priceUsd: price, shortDescription: shortDesc, photos: [] })
    onContinue()
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="font-display text-2xl font-bold text-navy">Add your first tour</h1>
      <p className="mt-1 text-muted">You can add more and edit this later</p>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-white p-6">
        <Input label="Tour Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Tour Type</label>
          <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" value={tourType} onChange={(e) => setTourType(e.target.value)}>
            {TOUR_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">Regions</label>
          <div className="flex flex-wrap gap-2">
            {TANZANIA_REGIONS.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => toggleRegion(r.name)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${regions.includes(r.name) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'}`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Duration (days)" type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
          <Input label="Base Price (USD)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Short Description</label>
          <textarea rows={2} maxLength={100} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal" />
          <p className="mt-1 text-xs text-muted">{shortDesc.length}/100</p>
        </div>
        <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted">
          Upload 1-3 Photos
          <input type="file" accept="image/*" multiple className="hidden" />
        </label>
        <Button className="w-full" onClick={saveAndContinue}>
          Save Tour &amp; Continue →
        </Button>
        <button onClick={onContinue} className="block w-full text-center text-sm text-muted hover:underline">
          Skip — I&apos;ll add tours after approval
        </button>
      </div>
    </div>
  )
}

function Step4Review({
  data,
  update,
  onBackToStep,
  onSubmit,
  submitting,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
  onBackToStep: (step: number) => void
  onSubmit: () => void
  submitting: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="font-display text-2xl font-bold text-navy">Review your application</h1>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">Business Info</h3>
            <button onClick={() => onBackToStep(1)} className="text-xs font-medium text-teal hover:underline">
              Edit
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            {data.businessName} · {data.city} · {data.regions.join(', ') || 'No regions selected'} · TTB {data.ttbNumber}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">Payment</h3>
            <button onClick={() => onBackToStep(2)} className="text-xs font-medium text-teal hover:underline">
              Edit
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">{data.stripeConnected ? 'Stripe connected' : 'Not yet connected'}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">First Tour</h3>
            <button onClick={() => onBackToStep(3)} className="text-xs font-medium text-teal hover:underline">
              Edit
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">{data.firstTour ? `${data.firstTour.title} — $${data.firstTour.priceUsd}` : 'No tour added yet'}</p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold-light p-4 text-sm text-gold-dark">
        <FileCheck size={18} className="mt-0.5 shrink-0" />
        After submitting, our team reviews applications within 24 hours. You&apos;ll receive an email when approved.
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-navy">
        <input type="checkbox" checked={data.confirmAccurate} onChange={(e) => update('confirmAccurate', e.target.checked)} className="mt-0.5 accent-teal" />
        I confirm all information is accurate and I hold a valid TTB Operator Licence
      </label>

      <Button variant="gold" size="lg" className="mt-6 w-full" disabled={submitting} onClick={onSubmit}>
        {submitting ? 'Submitting…' : 'Submit Application'}
      </Button>
    </div>
  )
}

function Step5Submitted({ name, email }: { name: string; email: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <ConfettiCheckmark />
      <h1 className="mt-4 font-display text-2xl font-bold text-navy">Application Received! 🎉</h1>
      <p className="mt-2 text-muted">Thank you, {name || 'partner'}. We&apos;ll review your application within 24 hours.</p>

      <div className="mx-auto mt-8 max-w-sm space-y-4 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 shrink-0 rounded-full bg-teal" />
          <p className="text-sm text-navy">Application submitted</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 shrink-0 animate-pulse rounded-full bg-gold" />
          <p className="text-sm font-medium text-navy">Under review</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-border" />
          <p className="text-sm text-muted">Approved — tours go live</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">You&apos;ll receive an email at {email || 'your email'} when your application is approved.</p>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
          Explore LifeGranted Adventures
        </Link>
        <Link href="/auth/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Log In to Your Account
        </Link>
      </div>
    </div>
  )
}

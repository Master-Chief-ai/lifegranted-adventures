'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { X, Plus, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { TANZANIA_REGIONS, LANGUAGES } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import type { Operator } from '@/types'

const CITIES = ['Mwanza', 'Arusha', 'Dar es Salaam', 'Zanzibar', 'Moshi', 'Other']

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function OperatorProfileForm({ operator }: { operator: Operator }) {
  const [form, setForm] = useState({
    business_name: operator.business_name,
    contact_name: '',
    whatsapp: operator.whatsapp ?? '',
    email: operator.email ?? '',
    city: operator.city ?? CITIES[0],
    description: operator.description ?? '',
    regions: operator.regions,
    languages: ['en'] as string[],
    logo_url: operator.logo_url ?? '',
    cover_url: operator.cover_url ?? '',
    ttb_licence_number: operator.ttb_licence_number ?? '',
    ttb_expiry: '',
    tato_member: operator.tato_member,
    certifications: operator.certifications,
  })
  const [saving, setSaving] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleRegion(name: string) {
    update('regions', form.regions.includes(name) ? form.regions.filter((r) => r !== name) : [...form.regions, name])
  }
  function toggleLanguage(code: string) {
    update('languages', form.languages.includes(code) ? form.languages.filter((l) => l !== code) : [...form.languages, code])
  }

  async function handleLogoUpload(file: File | undefined) {
    if (!file) return
    update('logo_url', await readFileAsDataURL(file))
  }
  async function handleCoverUpload(file: File | undefined) {
    if (!file) return
    update('cover_url', await readFileAsDataURL(file))
  }

  function addCertification() {
    update('certifications', [...form.certifications, ''])
  }
  function updateCertification(i: number, value: string) {
    update(
      'certifications',
      form.certifications.map((c, idx) => (idx === i ? value : c))
    )
  }
  function removeCertification(i: number) {
    update('certifications', form.certifications.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/operator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          whatsapp: form.whatsapp,
          email: form.email,
          city: form.city,
          description: form.description,
          regions: form.regions,
          logo_url: form.logo_url,
          cover_url: form.cover_url,
          ttb_licence_number: form.ttb_licence_number,
          tato_member: form.tato_member,
          certifications: form.certifications.filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated!')
    } catch {
      toast.error('Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-20 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Business Identity</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Business Name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
            <Input label="Contact Person Name" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">City</label>
              <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" value={form.city} onChange={(e) => update('city', e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-navy">About Your Business</h2>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-navy">Description</label>
            <textarea
              rows={5}
              minLength={50}
              maxLength={1000}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Tell tourists about your business, your guides, your experience…"
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <p className="mt-1 text-xs text-muted">{form.description.length}/1000</p>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-navy">Regions Covered</label>
            <div className="flex flex-wrap gap-2">
              {TANZANIA_REGIONS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRegion(r.name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${form.regions.includes(r.name) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'}`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-navy">Languages Offered</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => toggleLanguage(l.code)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${form.languages.includes(l.code) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Profile Images</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Logo</p>
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-teal-light">
                  {form.logo_url ? (
                    <Image src={form.logo_url} alt="Logo" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-sm font-bold text-teal">{getInitials(form.business_name)}</span>
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-medium text-navy hover:border-teal">
                  Change Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Cover Photo</p>
              <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-teal to-teal-dark">
                {form.cover_url && <Image src={form.cover_url} alt="Cover" fill className="object-cover" />}
              </div>
              <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-medium text-navy hover:border-teal">
                Change Cover Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Certifications</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="TTB Licence Number" value={form.ttb_licence_number} onChange={(e) => update('ttb_licence_number', e.target.value)} />
            <Input label="TTB Expiry Date" type="date" value={form.ttb_expiry} onChange={(e) => update('ttb_expiry', e.target.value)} />
          </div>
          <label className="mt-4 flex items-center justify-between text-sm font-medium text-navy">
            TATO Member
            <input type="checkbox" checked={form.tato_member} onChange={(e) => update('tato_member', e.target.checked)} className="accent-teal" />
          </label>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-navy">Other Certifications</label>
            <div className="space-y-2">
              {form.certifications.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input value={c} onChange={(e) => updateCertification(i, e.target.value)} className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
                  <button type="button" onClick={() => removeCertification(i)} className="text-[#B91C1C]">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCertification} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              <Plus size={14} /> Add
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Payout &amp; Banking</h2>
          <p className="mt-2 text-sm text-muted">
            Stripe Connect status:{' '}
            <span className={operator.stripe_onboarding_complete ? 'font-medium text-[#15803D]' : 'font-medium text-gold-dark'}>
              {operator.stripe_onboarding_complete ? 'Connected' : 'Not connected'}
            </span>
          </p>
          <Link href="/portal/payouts" className="mt-1 inline-block text-sm font-medium text-teal hover:underline">
            To update bank details, visit the Payouts page →
          </Link>
        </section>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-navy">Live Preview</p>
        <div className="sticky top-6 rounded-xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-teal-light">
              {form.logo_url ? (
                <Image src={form.logo_url} alt="Logo" fill className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-display text-sm font-bold text-teal">{getInitials(form.business_name)}</span>
              )}
            </div>
            <div>
              <p className="font-display text-base font-semibold text-navy">{form.business_name || 'Your Business Name'}</p>
              <p className="text-sm text-muted">{form.city}</p>
            </div>
          </div>
          <StarRating rating={operator.avg_rating} reviewCount={operator.total_reviews} className="mt-2" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.regions.map((r) => (
              <Badge key={r} variant="teal">
                {r}
              </Badge>
            ))}
            {form.ttb_licence_number && (
              <Badge variant="green" className="flex items-center gap-1">
                <ShieldCheck size={11} /> TTB Licensed
              </Badge>
            )}
            {form.tato_member && <Badge variant="gold">TATO Member</Badge>}
          </div>
          <p className="mt-3 line-clamp-4 text-sm text-navy/80">{form.description || 'Your business description will appear here.'}</p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white p-4 lg:left-60">
        <div className="container-lg">
          <Button className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OperatorProfileForm

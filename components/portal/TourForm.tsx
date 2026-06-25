'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TANZANIA_REGIONS, LANGUAGES, TOUR_TYPES, DIFFICULTIES, USD_TO_TZS } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import {
  type TourFormState,
  emptyTourForm,
  DEFAULT_CANCELLATION_POLICY,
  INCLUSION_SUGGESTIONS,
  EXCLUSION_SUGGESTIONS,
} from '@/lib/tour-form-types'

const ACCOMMODATION_TYPES = ['Tented camp', 'Lodge', 'Hotel', 'Fly camping', 'Boat/Dhow', 'Hostel']
const TRANSPORT_TYPES = ['4×4 Vehicle', 'Charter Flight', 'Boat', 'Walking', 'Bicycle', 'Mixed']

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function TourForm({ tourId, initial }: { tourId?: string; initial?: TourFormState }) {
  const router = useRouter()
  const storageKey = `lga_tour_draft_${tourId ?? 'new'}`

  const [form, setForm] = useState<TourFormState>(() => {
    if (initial) return initial
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) return JSON.parse(raw)
      } catch {
        // ignore
      }
    }
    return emptyTourForm()
  })
  const [lastSavedSecondsAgo, setLastSavedSecondsAgo] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const lastSaveRef = useRef<number | null>(null)

  useEffect(() => {
    lastSaveRef.current = Date.now()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(form))
      lastSaveRef.current = Date.now()
    }, 30000)
    return () => clearInterval(interval)
  }, [form, storageKey])

  useEffect(() => {
    const tick = setInterval(() => {
      if (lastSaveRef.current !== null) {
        setLastSavedSecondsAgo(Math.floor((Date.now() - lastSaveRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  function update<K extends keyof TourFormState>(key: K, value: TourFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({ ...f, title: value.slice(0, 80), slug: f.slug || slugify(value), seoTitle: f.seoTitle || value.slice(0, 60) }))
  }

  function toggleListItem(key: 'regions' | 'languages', value: string) {
    setForm((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }))
  }

  function addHighlight() {
    if (form.highlights.length >= 8) return
    update('highlights', [...form.highlights, ''])
  }
  function updateHighlight(i: number, value: string) {
    update(
      'highlights',
      form.highlights.map((h, idx) => (idx === i ? value : h))
    )
  }
  function removeHighlight(i: number) {
    update('highlights', form.highlights.filter((_, idx) => idx !== i))
  }

  function addDay() {
    update('itinerary', [
      ...form.itinerary,
      {
        day: form.itinerary.length + 1,
        title: '',
        activities: '',
        accommodation: '',
        accommodation_type: ACCOMMODATION_TYPES[0],
        meals: { breakfast: false, lunch: false, dinner: false },
        transport: TRANSPORT_TYPES[0],
      },
    ])
  }
  function updateDay(i: number, patch: Partial<TourFormState['itinerary'][number]>) {
    update(
      'itinerary',
      form.itinerary.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    )
  }
  function removeDay(i: number) {
    update(
      'itinerary',
      form.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 }))
    )
  }

  function addListItem(key: 'inclusions' | 'exclusions', value = '') {
    update(key, [...form[key], value])
  }
  function updateListItem(key: 'inclusions' | 'exclusions', i: number, value: string) {
    update(
      key,
      form[key].map((v, idx) => (idx === i ? value : v))
    )
  }
  function removeListItem(key: 'inclusions' | 'exclusions', i: number) {
    update(key, form[key].filter((_, idx) => idx !== i))
  }

  function addAddon() {
    update('addons', [...form.addons, { id: `addon-${Date.now()}`, name: '', price_usd: 0, description: '' }])
  }
  function updateAddon(i: number, patch: Partial<TourFormState['addons'][number]>) {
    update(
      'addons',
      form.addons.map((a, idx) => (idx === i ? { ...a, ...patch } : a))
    )
  }
  function removeAddon(i: number) {
    update('addons', form.addons.filter((_, idx) => idx !== i))
  }

  async function handlePhotoUpload(files: FileList | null) {
    if (!files) return
    const remaining = 20 - form.images.length
    const toUpload = Array.from(files).slice(0, remaining)
    const newImages = await Promise.all(
      toUpload.map(async (file) => ({ url: await readFileAsDataURL(file), alt: '' }))
    )
    update('images', [...form.images, ...newImages])
  }
  function updateImageAlt(i: number, alt: string) {
    update(
      'images',
      form.images.map((img, idx) => (idx === i ? { ...img, alt } : img))
    )
  }
  function removeImage(i: number) {
    update('images', form.images.filter((_, idx) => idx !== i))
  }

  function validate(forActivation: boolean): boolean {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.description.trim()) errs.description = 'Full description is required'
    if (form.priceUsd <= 0) errs.priceUsd = 'Enter a price greater than 0'
    if (form.regions.length === 0) errs.regions = 'Select at least one region'
    if (form.durationDays < 1) errs.durationDays = 'Duration must be at least 1 day'
    if (forActivation && form.images.length < 5) errs.images = 'Add at least 5 photos to activate this tour'
    if (forActivation && form.itinerary.length === 0) errs.itinerary = 'Add at least one itinerary day'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function persist(status: 'draft' | 'active' | 'inactive') {
    const ok = validate(status === 'active')
    if (!ok) {
      toast.error('Please fix the highlighted fields before continuing')
      return
    }
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      tour_type: form.tourType,
      difficulty: form.difficulty,
      regions: form.regions,
      languages: form.languages,
      duration_days: form.durationDays,
      duration_nights: form.durationNights,
      price_usd: form.priceUsd,
      min_group: form.minGroup,
      max_group: form.maxGroup,
      description: form.description,
      meta_description: form.shortDescription || form.seoDescription,
      highlights: form.highlights.filter(Boolean),
      itinerary: form.itinerary,
      inclusions: form.inclusions.filter(Boolean),
      exclusions: form.exclusions.filter(Boolean),
      addons: form.addons.filter((a) => a.name),
      images: form.images,
      meta_title: form.seoTitle,
      cancellation_policy: form.cancellationPolicyType === 'default' ? DEFAULT_CANCELLATION_POLICY : form.customCancellationPolicy,
      is_active: status === 'active',
    }

    try {
      const url = tourId ? `/api/operator/tours/${tourId}` : '/api/operator/tours'
      const res = await fetch(url, {
        method: tourId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      window.localStorage.removeItem(storageKey)
      toast.success(status === 'active' ? 'Tour saved and activated!' : 'Tour saved as draft')
      router.push('/portal/tours')
    } catch {
      toast.error('Could not save tour. Please try again.')
    }
  }

  async function handleArchive() {
    if (!confirm('Are you sure? This will hide the tour from tourists.')) return
    if (tourId) {
      try {
        await fetch(`/api/operator/tours/${tourId}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
    }
    toast.success('Tour archived')
    router.push('/portal/tours')
  }

  const suggestions = INCLUSION_SUGGESTIONS[form.tourType] ?? INCLUSION_SUGGESTIONS.default

  return (
    <div className="pb-24">
      {/* SECTION 1 — BASIC INFO */}
      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Basic Info</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Input label="Tour Title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} error={errors.title} maxLength={80} />
            <p className="mt-1 text-xs text-muted">{form.title.length}/80</p>
          </div>
          <div>
            <Input label="Slug" value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
            <p className="mt-1 text-xs text-muted">/tours/{form.slug || 'your-tour-slug'}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Tour Type</label>
              <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" value={form.tourType} onChange={(e) => update('tourType', e.target.value)}>
                {TOUR_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Difficulty</label>
              <select className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Regions Covered</label>
            <div className="flex flex-wrap gap-2">
              {TANZANIA_REGIONS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleListItem('regions', r.name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    form.regions.includes(r.name) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
            {errors.regions && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.regions}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Languages Offered</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => toggleListItem('languages', l.code)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    form.languages.includes(l.code) ? 'border-teal bg-teal-light text-teal' : 'border-border text-muted'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Days</label>
              <input type="number" min={1} value={form.durationDays} onChange={(e) => update('durationDays', Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
              {errors.durationDays && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.durationDays}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Nights</label>
              <input type="number" min={0} value={form.durationNights} onChange={(e) => update('durationNights', Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PRICING */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Pricing</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Input
              label="Base Price Per Person (USD)"
              type="number"
              min={0}
              value={form.priceUsd}
              onChange={(e) => update('priceUsd', Number(e.target.value))}
              error={errors.priceUsd}
            />
            <p className="mt-1 text-xs text-muted">Approx. TZS {(form.priceUsd * USD_TO_TZS).toLocaleString('en-US')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Minimum Group Size</label>
              <input type="number" min={1} value={form.minGroup} onChange={(e) => update('minGroup', Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Maximum Group Size</label>
              <input type="number" min={1} value={form.maxGroup} onChange={(e) => update('maxGroup', Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
            </div>
          </div>
          <label className="flex items-center justify-between text-sm font-medium text-navy">
            Solo traveller surcharge
            <input type="checkbox" checked={form.soloSurchargeEnabled} onChange={(e) => update('soloSurchargeEnabled', e.target.checked)} className="accent-teal" />
          </label>
          {form.soloSurchargeEnabled && (
            <Input label="Surcharge amount (USD)" type="number" value={form.soloSurchargeAmount} onChange={(e) => update('soloSurchargeAmount', Number(e.target.value))} />
          )}
          <label className="flex items-center justify-between text-sm font-medium text-navy">
            Group discount
            <input type="checkbox" checked={form.groupDiscountEnabled} onChange={(e) => update('groupDiscountEnabled', e.target.checked)} className="accent-teal" />
          </label>
          {form.groupDiscountEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="% off" type="number" value={form.groupDiscountPercent} onChange={(e) => update('groupDiscountPercent', Number(e.target.value))} />
              <Input label="For groups of" type="number" value={form.groupDiscountMinSize} onChange={(e) => update('groupDiscountMinSize', Number(e.target.value))} />
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3 — DESCRIPTION */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Description</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Short Description</label>
            <textarea
              rows={2}
              maxLength={200}
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <p className="mt-1 text-xs text-muted">{form.shortDescription.length}/200 · Used in search results and tour cards</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Full Description</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            {errors.description && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.description}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Highlights</label>
            <p className="mb-2 text-xs text-muted">Short punchy phrases: &quot;Sit 5 metres from wild chimpanzees&quot;</p>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input value={h} onChange={(e) => updateHighlight(i, e.target.value)} className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
                  <button type="button" onClick={() => removeHighlight(i)} className="text-[#B91C1C]">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {form.highlights.length < 8 && (
              <button type="button" onClick={addHighlight} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
                <Plus size={14} /> Add Highlight
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4 — ITINERARY */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Itinerary</h2>
        {errors.itinerary && <p className="mt-1 text-xs text-[#B91C1C]">{errors.itinerary}</p>}
        <div className="mt-4 space-y-4">
          {form.itinerary.map((day, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted">≡</span>
                  <span className="rounded-full bg-teal-light px-2 py-0.5 text-xs font-semibold text-teal">Day {day.day}</span>
                  <input
                    value={day.title}
                    onChange={(e) => updateDay(i, { title: e.target.value })}
                    placeholder="e.g. Arrival at Mahale"
                    className="h-9 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                  />
                </div>
                <button type="button" onClick={() => removeDay(i)} className="text-xs font-medium text-[#B91C1C]">
                  Remove Day
                </button>
              </div>
              <textarea
                rows={2}
                value={day.activities}
                onChange={(e) => updateDay(i, { activities: e.target.value })}
                placeholder="Morning trek to find chimpanzee group…"
                className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
              />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={day.accommodation}
                  onChange={(e) => updateDay(i, { accommodation: e.target.value })}
                  placeholder="Accommodation name"
                  className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                />
                <select
                  value={day.accommodation_type}
                  onChange={(e) => updateDay(i, { accommodation_type: e.target.value })}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
                >
                  {ACCOMMODATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex gap-2">
                {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                  <button
                    type="button"
                    key={meal}
                    onClick={() => updateDay(i, { meals: { ...day.meals, [meal]: !day.meals[meal] } })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${
                      day.meals[meal] ? 'border-teal bg-teal text-white' : 'border-border text-muted'
                    }`}
                  >
                    {meal[0].toUpperCase()} {meal}
                  </button>
                ))}
              </div>
              <select
                value={day.transport}
                onChange={(e) => updateDay(i, { transport: e.target.value })}
                className="mt-3 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal sm:w-1/2"
              >
                {TRANSPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button type="button" onClick={addDay} className="mt-4 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
          <Plus size={14} /> Add Day
        </button>
      </section>

      {/* SECTION 5 — INCLUSIONS & EXCLUSIONS */}
      <section className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-border bg-white p-5 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-semibold text-[#15803D]">What&apos;s Included</h3>
          <div className="mt-3 space-y-2">
            {form.inclusions.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item} onChange={(e) => updateListItem('inclusions', i, e.target.value)} className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
                <button type="button" onClick={() => removeListItem('inclusions', i)} className="text-[#B91C1C]">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('inclusions')} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
            <Plus size={14} /> Add item
          </button>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => addListItem('inclusions', s)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-teal">
                + {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-[#B91C1C]">Not Included</h3>
          <div className="mt-3 space-y-2">
            {form.exclusions.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item} onChange={(e) => updateListItem('exclusions', i, e.target.value)} className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal" />
                <button type="button" onClick={() => removeListItem('exclusions', i)} className="text-[#B91C1C]">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('exclusions')} className="mt-2 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
            <Plus size={14} /> Add item
          </button>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXCLUSION_SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => addListItem('exclusions', s)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-teal">
                + {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — ADD-ONS */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Optional Add-ons</h2>
        <p className="mt-1 text-xs text-muted">Extra services tourists can add at booking</p>
        <div className="mt-4 space-y-3">
          {form.addons.map((addon, i) => (
            <div key={addon.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_2fr_auto]">
              <input
                value={addon.name}
                onChange={(e) => updateAddon(i, { name: e.target.value })}
                placeholder="Hot air balloon safari"
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
              <input
                type="number"
                value={addon.price_usd}
                onChange={(e) => updateAddon(i, { price_usd: Number(e.target.value) })}
                placeholder="450"
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
              <input
                value={addon.description}
                onChange={(e) => updateAddon(i, { description: e.target.value })}
                placeholder="Sunrise balloon over the Serengeti"
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
              />
              <button type="button" onClick={() => removeAddon(i)} className="text-[#B91C1C]">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addAddon} className="mt-3 flex items-center gap-1 text-sm font-medium text-teal hover:underline">
          <Plus size={14} /> Add Optional Extra
        </button>
      </section>

      {/* SECTION 7 — PHOTOS */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Photos</h2>
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-teal">
          <span className="text-sm font-medium text-navy">Click or drag photos here</span>
          <span className="text-xs text-muted">Up to 20 photos · minimum 5 to activate</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} />
        </label>
        {errors.images && <p className="mt-1.5 text-xs text-[#B91C1C]">{errors.images}</p>}
        {form.images.length > 0 && form.images.length < 5 && (
          <p className="mt-2 text-xs text-gold-dark">Add at least 5 photos to activate this tour</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {form.images.map((img, i) => (
            <div key={i} className="relative rounded-lg border border-border p-2">
              {i === 0 && <span className="absolute left-2 top-2 z-10 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-white">HERO</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className="h-24 w-full rounded object-cover" />
              <input
                value={img.alt}
                onChange={(e) => updateImageAlt(i, e.target.value)}
                placeholder="Chimpanzees at Mahale Mountains"
                className="mt-2 h-8 w-full rounded border border-border px-2 text-xs text-navy focus:border-teal"
              />
              <button type="button" onClick={() => removeImage(i)} className="absolute right-2 top-2 z-10 rounded-full bg-white p-1 text-[#B91C1C]">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — SEO */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">SEO</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Input label="SEO Title" value={form.seoTitle} maxLength={60} onChange={(e) => update('seoTitle', e.target.value)} />
            <p className="mt-1 text-xs text-muted">{form.seoTitle.length}/60</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Meta Description</label>
            <textarea
              rows={2}
              maxLength={155}
              value={form.seoDescription}
              onChange={(e) => update('seoDescription', e.target.value)}
              className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
            />
            <p className="mt-1 text-xs text-muted">{form.seoDescription.length}/155</p>
          </div>
          <div className="rounded-lg border border-border bg-gray-50 p-4">
            <p className="text-xs text-[#15803D]">lifegranted-adventures.co.tz › tours › {form.slug || 'your-tour-slug'}</p>
            <p className="mt-1 text-base text-blue-700">{form.seoTitle || form.title || 'Your tour title'}</p>
            <p className="mt-1 text-sm text-gray-600">{form.seoDescription || form.shortDescription || 'Your meta description will appear here.'}</p>
          </div>
        </div>
      </section>

      {/* SECTION 9 — CANCELLATION POLICY */}
      <section className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Cancellation Policy</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="radio" checked={form.cancellationPolicyType === 'default'} onChange={() => update('cancellationPolicyType', 'default')} className="accent-teal" />
            Use platform default policy (recommended)
          </label>
          {form.cancellationPolicyType === 'default' && <div className="rounded-lg bg-gray-50 p-3 text-sm text-muted">{DEFAULT_CANCELLATION_POLICY}</div>}
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="radio" checked={form.cancellationPolicyType === 'custom'} onChange={() => update('cancellationPolicyType', 'custom')} className="accent-teal" />
            Set custom policy
          </label>
          {form.cancellationPolicyType === 'custom' && (
            <div>
              <textarea
                rows={3}
                value={form.customCancellationPolicy}
                onChange={(e) => update('customCancellationPolicy', e.target.value)}
                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-navy focus:border-teal"
              />
              <p className="mt-1 text-xs text-gold-dark">Must not be stricter than platform minimum</p>
            </div>
          )}
        </div>
      </section>

      {/* STICKY FORM ACTIONS */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white p-4 lg:left-60">
        <div className="container-lg flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {lastSavedSecondsAgo !== null ? `Last saved ${lastSavedSecondsAgo}s ago` : 'Not saved yet'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleArchive}>
              Archive Tour
            </Button>
            <Button type="button" variant="secondary" onClick={() => persist('draft')}>
              Save as Draft
            </Button>
            <Button type="button" variant="primary" onClick={() => persist('active')}>
              Save &amp; Activate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TourForm

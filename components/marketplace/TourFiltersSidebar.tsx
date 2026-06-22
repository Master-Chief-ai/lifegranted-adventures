'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { TANZANIA_REGIONS, TOUR_TYPES } from '@/lib/constants'

const RATING_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '3+', value: '3' },
  { label: '4+', value: '4' },
  { label: '4.5+', value: '4.5' },
]

export function TourFiltersSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleListValue(key: string, value: string) {
    const current = searchParams.get(key)?.split(',').filter(Boolean) ?? []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    update(key, next.length ? next.join(',') : null)
  }

  const regions = searchParams.get('regions')?.split(',').filter(Boolean) ?? []
  const types = searchParams.get('types')?.split(',').filter(Boolean) ?? []

  return (
    <aside className="w-full space-y-6 lg:w-[280px]">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Search tours…"
          className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-navy focus:border-teal"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Region</h4>
        <div className="space-y-1.5">
          {TANZANIA_REGIONS.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={regions.includes(r.name)} onChange={() => toggleListValue('regions', r.name)} className="accent-teal" />
              {r.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Tour Type</h4>
        <div className="space-y-1.5">
          {TOUR_TYPES.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={types.includes(t.id)} onChange={() => toggleListValue('types', t.id)} className="accent-teal" />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Duration (days)</h4>
        <input
          type="range"
          min={1}
          max={21}
          defaultValue={searchParams.get('maxDuration') ?? '21'}
          onChange={(e) => update('maxDuration', e.target.value)}
          className="w-full accent-teal"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Max Price (USD)</h4>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          defaultValue={searchParams.get('maxPrice') ?? '10000'}
          onChange={(e) => update('maxPrice', e.target.value)}
          className="w-full accent-teal"
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Group Size</h4>
        <input
          type="number"
          min={1}
          max={20}
          placeholder="Any"
          defaultValue={searchParams.get('groupSize') ?? ''}
          onChange={(e) => update('groupSize', e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
        />
      </div>

      <label className="flex items-center justify-between text-sm font-medium text-navy">
        Instant Book Only
        <input
          type="checkbox"
          checked={searchParams.get('instant') === '1'}
          onChange={(e) => update('instant', e.target.checked ? '1' : null)}
          className="accent-teal"
        />
      </label>

      <label className="flex items-center justify-between text-sm font-medium text-navy">
        TTB Licensed Only
        <input
          type="checkbox"
          checked={searchParams.get('ttb') === '1'}
          onChange={(e) => update('ttb', e.target.checked ? '1' : null)}
          className="accent-teal"
        />
      </label>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy">Minimum Rating</h4>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => update('minRating', opt.value || null)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                (searchParams.get('minRating') ?? '') === opt.value
                  ? 'border-teal bg-teal-light text-teal'
                  : 'border-border text-muted hover:border-teal'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => router.push(pathname)} className="w-full text-sm font-medium text-teal hover:underline">
        Clear all filters
      </button>
    </aside>
  )
}

export default TourFiltersSidebar

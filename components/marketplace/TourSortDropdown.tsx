'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
]

export function TourSortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      defaultValue={searchParams.get('sortBy') ?? 'featured'}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default TourSortDropdown

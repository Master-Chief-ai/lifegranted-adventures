'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Map, Calendar, Users, Search } from 'lucide-react'
import { TANZANIA_REGIONS } from '@/lib/constants'

export function HeroSearchBar() {
  const router = useRouter()
  const [region, setRegion] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(2)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (region) params.set('region', region)
    if (date) params.set('date', date)
    if (guests) params.set('guests', String(guests))
    router.push(`/tours?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-3 shadow-card-hover sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className="flex flex-1 items-center gap-2 border-b border-border px-3 py-2 sm:border-b-0 sm:border-r">
        <Map size={18} className="text-teal" />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full bg-transparent text-sm text-navy outline-none"
        >
          <option value="">Where in Tanzania?</option>
          <option value="">All Tanzania</option>
          {TANZANIA_REGIONS.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 items-center gap-2 border-b border-border px-3 py-2 sm:border-b-0 sm:border-r">
        <Calendar size={18} className="text-teal" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-transparent text-sm text-navy outline-none"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <Users size={18} className="text-teal" />
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-16 bg-transparent text-sm text-navy outline-none"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark"
      >
        <Search size={16} /> Search Tours
      </button>
    </form>
  )
}

export default HeroSearchBar

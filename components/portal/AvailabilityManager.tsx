'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Tour } from '@/types'

interface DayRecord {
  slotsTotal: number
  slotsRemaining: number
  priceOverride: number | null
}

function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function buildMonth(year: number, month: number, tourSeed: number): { date: Date; record: DayRecord | null }[] {
  const days: { date: Date; record: DayRecord | null }[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const seed = tourSeed + year * 10000 + month * 100 + d
    const rand = seedRandom(seed)
    let record: DayRecord | null = null
    if (rand < 0.8) {
      const total = 8
      const remaining = rand < 0.1 ? 0 : Math.max(1, Math.floor(seedRandom(seed + 1) * total))
      record = { slotsTotal: total, slotsRemaining: remaining, priceOverride: null }
    }
    days.push({ date, record })
  }
  return days
}

export function AvailabilityManager({ tours }: { tours: Tour[] }) {
  const [tourId, setTourId] = useState(tours[0]?.id ?? '')
  const [viewDate, setViewDate] = useState(() => new Date())
  const [overrides, setOverrides] = useState<Record<string, DayRecord | null>>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkSlots, setBulkSlots] = useState(8)
  const [bulkPrice, setBulkPrice] = useState('')

  const tourSeed = useMemo(() => tourId.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0), [tourId])
  const monthDays = useMemo(() => buildMonth(viewDate.getFullYear(), viewDate.getMonth(), tourSeed), [viewDate, tourSeed])

  function keyFor(date: Date) {
    return `${tourId}_${date.toISOString().split('T')[0]}`
  }

  function recordFor(date: Date, baseRecord: DayRecord | null): DayRecord | null {
    const key = keyFor(date)
    return key in overrides ? overrides[key] : baseRecord
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOffset = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  async function persistDates(dates: { date: string; slotsTotal: number; slotsRemaining: number; priceOverride: number | null }[]) {
    try {
      await fetch('/api/operator/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, dates }),
      })
    } catch {
      // mock mode — ignore network errors
    }
  }

  function handleDateClick(date: Date) {
    if (date < today) return
    if (bulkMode) {
      const key = date.toISOString()
      setBulkSelected((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      return
    }
    setSelectedDate(date)
  }

  async function applyBulk() {
    const dates = Array.from(bulkSelected).map((iso) => ({
      date: new Date(iso).toISOString().split('T')[0],
      slotsTotal: bulkSlots,
      slotsRemaining: bulkSlots,
      priceOverride: bulkPrice ? Number(bulkPrice) : null,
    }))
    setOverrides((prev) => {
      const next = { ...prev }
      for (const d of dates) {
        next[`${tourId}_${d.date}`] = { slotsTotal: d.slotsTotal, slotsRemaining: d.slotsRemaining, priceOverride: d.priceOverride }
      }
      return next
    })
    await persistDates(dates)
    toast.success(`Updated ${dates.length} dates`)
    setBulkSelected(new Set())
  }

  async function closeBulk() {
    const dates = Array.from(bulkSelected).map((iso) => ({
      date: new Date(iso).toISOString().split('T')[0],
      slotsTotal: 0,
      slotsRemaining: 0,
      priceOverride: null,
    }))
    setOverrides((prev) => {
      const next = { ...prev }
      for (const d of dates) next[`${tourId}_${d.date}`] = { slotsTotal: 0, slotsRemaining: 0, priceOverride: null }
      return next
    })
    await persistDates(dates)
    toast.success(`Closed ${dates.length} dates`)
    setBulkSelected(new Set())
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-navy">Managing availability for:</label>
          <select
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="ml-2 h-10 rounded-lg border border-border bg-white px-3 text-sm text-navy focus:border-teal"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setBulkMode((b) => !b)
            setBulkSelected(new Set())
          }}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${bulkMode ? 'border-teal bg-teal-light text-teal' : 'border-border text-navy'}`}
        >
          {bulkMode ? 'Exit Bulk Mode' : 'Select Multiple Dates'}
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-lg p-1.5 hover:bg-teal-light">
            <ChevronLeft size={18} />
          </button>
          <p className="font-display font-semibold text-navy">{monthLabel}</p>
          <button onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-lg p-1.5 hover:bg-teal-light">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`offset-${i}`} />
          ))}
          {monthDays.map(({ date, record: baseRecord }) => {
            const record = recordFor(date, baseRecord)
            const isPast = date < today
            const isToday = date.toDateString() === today.toDateString()
            const isSelected = bulkSelected.has(date.toISOString())
            let classes = 'border-border text-gray-300'
            let label = ''
            if (!isPast && record) {
              if (record.slotsRemaining === 0) {
                classes = 'bg-red-50 text-[#B91C1C] border-[#B91C1C]/20'
                label = 'Full'
              } else {
                classes = 'bg-green-50 text-[#15803D] border-[#15803D]/30'
                label = `${record.slotsRemaining}/${record.slotsTotal}`
              }
            }
            if (isToday) classes += ' ring-2 ring-teal'
            if (isSelected) classes = 'bg-teal text-white border-teal'

            return (
              <button
                key={date.toISOString()}
                disabled={isPast}
                onClick={() => handleDateClick(date)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-[10px] font-medium ${classes} ${isPast ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
              >
                <span className="text-xs">{date.getDate()}</span>
                {label && <span>{label}</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-50 border border-[#15803D]/30" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-50 border border-[#B91C1C]/20" /> Fully Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-border" /> Not Offered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border-2 border-teal" /> Today
          </span>
        </div>
      </div>

      {bulkMode && bulkSelected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-teal/30 bg-teal-light p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy">Set Available Slots</label>
            <input type="number" value={bulkSlots} onChange={(e) => setBulkSlots(Number(e.target.value))} className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-navy">Price Override ($)</label>
            <input type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} className="h-9 w-28 rounded-lg border border-border bg-white px-2 text-sm" placeholder="Optional" />
          </div>
          <Button size="sm" onClick={applyBulk}>
            Apply to Selected ({bulkSelected.size} dates)
          </Button>
          <Button size="sm" variant="destructive" onClick={closeBulk}>
            Mark All Closed
          </Button>
        </div>
      )}

      {selectedDate && !bulkMode && (
        <DateEditorPanel
          date={selectedDate}
          tourTitle={tours.find((t) => t.id === tourId)?.title ?? ''}
          record={recordFor(selectedDate, monthDays.find((d) => d.date.toDateString() === selectedDate.toDateString())?.record ?? null)}
          onClose={() => setSelectedDate(null)}
          onSave={async (record) => {
            setOverrides((prev) => ({ ...prev, [keyFor(selectedDate)]: record }))
            await persistDates([{ date: selectedDate.toISOString().split('T')[0], slotsTotal: record.slotsTotal, slotsRemaining: record.slotsRemaining, priceOverride: record.priceOverride }])
            toast.success('Availability saved')
            setSelectedDate(null)
          }}
          onClear={async () => {
            setOverrides((prev) => ({ ...prev, [keyFor(selectedDate)]: null }))
            toast.success('Date cleared')
            setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}

function DateEditorPanel({
  date,
  tourTitle,
  record,
  onClose,
  onSave,
  onClear,
}: {
  date: Date
  tourTitle: string
  record: DayRecord | null
  onClose: () => void
  onSave: (record: DayRecord) => void
  onClear: () => void
}) {
  const [slotsTotal, setSlotsTotal] = useState(record?.slotsTotal ?? 8)
  const [slotsRemaining, setSlotsRemaining] = useState(record?.slotsRemaining ?? 8)
  const [priceOverride, setPriceOverride] = useState(record?.priceOverride?.toString() ?? '')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-sm overflow-y-auto bg-white p-6 shadow-card-hover">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy">Availability for {formatDate(date)}</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Tour: {tourTitle}</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Total Slots</label>
            <input type="number" min={0} max={50} value={slotsTotal} onChange={(e) => setSlotsTotal(Number(e.target.value))} className="h-10 w-full rounded-lg border border-border px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Slots Remaining</label>
            <input
              type="number"
              min={0}
              max={slotsTotal}
              value={slotsRemaining}
              onChange={(e) => setSlotsRemaining(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Override price for this date (optional)</label>
            <input
              type="number"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder="Leave blank to use tour base price"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button
            className="w-full"
            onClick={() => onSave({ slotsTotal, slotsRemaining, priceOverride: priceOverride ? Number(priceOverride) : null })}
          >
            Save Date
          </Button>
          <Button variant="destructive" className="w-full" onClick={() => onSave({ slotsTotal: 0, slotsRemaining: 0, priceOverride: null })}>
            Mark as Closed
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClear}>
            Clear Date
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityManager

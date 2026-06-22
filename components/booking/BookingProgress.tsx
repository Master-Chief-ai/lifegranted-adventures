'use client'

import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'

const STEPS = [
  { key: 'dates', label: 'Dates' },
  { key: 'details', label: 'Details' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirmed', label: 'Confirmed' },
]

export function BookingProgress() {
  const pathname = usePathname()
  const activeIndex = STEPS.findIndex((s) => pathname.includes(s.key))

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {STEPS.map((step, i) => {
        const completed = i < activeIndex
        const active = i === activeIndex
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  completed ? 'bg-teal text-white' : active ? 'bg-teal text-white' : 'bg-gray-200 text-muted'
                }`}
              >
                {completed ? <Check size={16} /> : i + 1}
              </span>
              <span className={`hidden text-sm font-medium sm:inline ${active || completed ? 'text-teal' : 'text-muted'}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-16 ${completed ? 'bg-teal' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default BookingProgress

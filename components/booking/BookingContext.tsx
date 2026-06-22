'use client'

import { createContext, useContext } from 'react'
import type { Tour, Operator, TourAvailability } from '@/types'

export interface BookingContextValue {
  tour: Tour
  operator: Operator
  availability: TourAvailability[]
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ value, children }: { value: BookingContextValue; children: React.ReactNode }) {
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBookingContext() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingContext must be used within BookingProvider')
  return ctx
}

'use client'

export interface BookingDraft {
  tourSlug: string
  date: string | null
  guests: number
  addons: string[]
  touristName: string
  touristEmail: string
  touristWhatsapp: string
  touristNationality: string
  children: number
  childrenAges: string
  dietaryRequirements: string
  medicalNotes: string
  specialOccasion: string
  hearAboutUs: string
  agreedTerms: boolean
  agreedConsent: boolean
}

const STORAGE_KEY = 'lga_booking_draft'

export function getBookingDraft(tourSlug: string): BookingDraft {
  if (typeof window === 'undefined') return defaultDraft(tourSlug)
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDraft(tourSlug)
    const parsed = JSON.parse(raw) as BookingDraft
    if (parsed.tourSlug !== tourSlug) return defaultDraft(tourSlug)
    return { ...defaultDraft(tourSlug), ...parsed }
  } catch {
    return defaultDraft(tourSlug)
  }
}

export function saveBookingDraft(draft: BookingDraft) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function defaultDraft(tourSlug: string): BookingDraft {
  return {
    tourSlug,
    date: null,
    guests: 1,
    addons: [],
    touristName: '',
    touristEmail: '',
    touristWhatsapp: '',
    touristNationality: '',
    children: 0,
    childrenAges: '',
    dietaryRequirements: '',
    medicalNotes: '',
    specialOccasion: '',
    hearAboutUs: '',
    agreedTerms: false,
    agreedConsent: false,
  }
}

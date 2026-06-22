import type { Tour, TourItineraryDay, TourAddon, TourImage } from '@/types'

export interface TourFormState {
  id: string | null
  title: string
  slug: string
  tourType: string
  difficulty: string
  regions: string[]
  languages: string[]
  durationDays: number
  durationNights: number
  priceUsd: number
  minGroup: number
  maxGroup: number
  soloSurchargeEnabled: boolean
  soloSurchargeAmount: number
  groupDiscountEnabled: boolean
  groupDiscountPercent: number
  groupDiscountMinSize: number
  shortDescription: string
  description: string
  highlights: string[]
  itinerary: TourItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  addons: TourAddon[]
  images: TourImage[]
  seoTitle: string
  seoDescription: string
  cancellationPolicyType: 'default' | 'custom'
  customCancellationPolicy: string
  status: 'draft' | 'active' | 'inactive'
}

export const DEFAULT_CANCELLATION_POLICY =
  'Free cancellation more than 30 days before travel. 50% refund 15–29 days before. No refund within 14 days.'

export function emptyTourForm(): TourFormState {
  return {
    id: null,
    title: '',
    slug: '',
    tourType: 'safari',
    difficulty: 'moderate',
    regions: [],
    languages: ['en'],
    durationDays: 3,
    durationNights: 2,
    priceUsd: 0,
    minGroup: 1,
    maxGroup: 12,
    soloSurchargeEnabled: false,
    soloSurchargeAmount: 0,
    groupDiscountEnabled: false,
    groupDiscountPercent: 10,
    groupDiscountMinSize: 6,
    shortDescription: '',
    description: '',
    highlights: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
    addons: [],
    images: [],
    seoTitle: '',
    seoDescription: '',
    cancellationPolicyType: 'default',
    customCancellationPolicy: '',
    status: 'draft',
  }
}

export const INCLUSION_SUGGESTIONS: Record<string, string[]> = {
  safari: ['Park entrance fees', 'Game drives', 'Accommodation', 'All meals', 'Professional guide'],
  trekking: ['All camping equipment', 'Cook', 'Porters', 'Rescue fees', 'Certificate'],
  default: ['Park entrance fees', 'Accommodation', 'Professional guide'],
}

export const EXCLUSION_SUGGESTIONS = ['International flights', 'Travel insurance', 'Visa fees', 'Tips/gratuities', 'Personal expenses']

export function tourToFormState(tour: Tour): TourFormState {
  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    tourType: tour.tour_type,
    difficulty: tour.difficulty,
    regions: tour.regions,
    languages: tour.languages,
    durationDays: tour.duration_days,
    durationNights: tour.duration_nights,
    priceUsd: tour.price_usd,
    minGroup: tour.min_group,
    maxGroup: tour.max_group,
    soloSurchargeEnabled: false,
    soloSurchargeAmount: 0,
    groupDiscountEnabled: false,
    groupDiscountPercent: 10,
    groupDiscountMinSize: 6,
    shortDescription: tour.meta_description ?? '',
    description: tour.description ?? '',
    highlights: tour.highlights,
    itinerary: tour.itinerary,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    addons: tour.addons,
    images: tour.images,
    seoTitle: tour.meta_title ?? tour.title,
    seoDescription: tour.meta_description ?? '',
    cancellationPolicyType: tour.cancellation_policy ? 'custom' : 'default',
    customCancellationPolicy: tour.cancellation_policy ?? '',
    status: tour.is_active ? 'active' : 'draft',
  }
}

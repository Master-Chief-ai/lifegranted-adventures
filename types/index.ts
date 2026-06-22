export type UserRole = 'tourist' | 'operator' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
export type OperatorStatus = 'pending' | 'approved' | 'suspended' | 'rejected'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  whatsapp: string | null
  nationality: string | null
  avatar_url: string | null
  created_at: string
}

export interface Operator {
  id: string
  user_id: string
  business_name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  location: string | null
  city: string | null
  regions: string[]
  certifications: string[]
  tato_member: boolean
  ttb_licensed: boolean
  ttb_licence_number: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  avg_rating: number
  total_reviews: number
  total_bookings: number
  status: OperatorStatus
  featured: boolean
  verified_at: string | null
  created_at: string
}

export interface TourImage {
  url: string
  alt: string
  public_id?: string
}

export interface TourItineraryDay {
  day: number
  title: string
  activities: string
  accommodation: string
  accommodation_type: string
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
  transport: string
}

export interface TourAddon {
  id: string
  name: string
  price_usd: number
  description: string
}

export interface Tour {
  id: string
  operator_id: string
  slug: string
  title: string
  description: string | null
  tour_type: string
  regions: string[]
  duration_days: number
  duration_nights: number
  min_group: number
  max_group: number
  price_usd: number
  price_tzs: number | null
  difficulty: string
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: TourItineraryDay[]
  addons: TourAddon[]
  cancellation_policy: string | null
  languages: string[]
  images: TourImage[]
  is_instant_book: boolean
  is_active: boolean
  is_featured: boolean
  avg_rating: number
  total_reviews: number
  total_bookings: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

export interface TourWithOperator extends Tour {
  operator: Operator
}

export interface Review {
  id: string
  booking_id: string | null
  tour_id: string
  operator_id: string
  tourist_id: string | null
  tourist_name: string
  tourist_country: string | null
  rating: number
  title: string | null
  body: string
  photos: string[]
  operator_response: string | null
  operator_responded_at: string | null
  is_verified: boolean
  is_published: boolean
  created_at: string
}

export interface ReviewWithTour extends Review {
  tour?: { title: string; slug: string }
}

export interface Booking {
  id: string
  booking_ref: string
  tour_id: string
  operator_id: string
  tourist_id: string | null
  tourist_name: string
  tourist_email: string
  tourist_phone: string | null
  tourist_whatsapp: string | null
  tourist_nationality: string | null
  group_size: number
  travel_date: string
  special_requests: string | null
  dietary_requirements: string | null
  medical_notes: string | null
  addons: TourAddon[]
  total_usd: number
  platform_fee_usd: number
  operator_payout_usd: number
  payment_status: PaymentStatus
  payment_method: string
  booking_status: BookingStatus
  stripe_payment_intent_id: string | null
  payout_released: boolean
  review_reminder_sent?: boolean
  created_at: string
}

export interface BookingWithDetails extends Booking {
  tour: Tour
  operator: Operator
}

export interface TourAvailability {
  id: string
  tour_id: string
  available_date: string
  slots_total: number
  slots_remaining: number
  price_override_usd: number | null
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  author: string
  category: string
  tags: string[]
  featured_image: string | null
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
}

export interface TourFilters {
  region?: string
  regions?: string[]
  tourType?: string
  tourTypes?: string[]
  minDuration?: number
  maxDuration?: number
  minPrice?: number
  maxPrice?: number
  groupSize?: number
  instantBookOnly?: boolean
  ttbOnly?: boolean
  minRating?: number
  searchQuery?: string
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type DisputeStatus = 'open' | 'resolved'
export type DisputeCategory = 'Quality Issue' | 'Cancellation' | 'No Show' | 'Payment' | 'Other'

export interface Dispute {
  id: string
  booking_id: string
  booking_ref: string
  tour_title: string
  operator_id: string
  operator_name: string
  raised_by_id: string | null
  raised_by_role: 'tourist' | 'operator'
  tourist_name: string
  tourist_country: string | null
  category: DisputeCategory
  description: string
  operator_response: string | null
  status: DisputeStatus
  resolution: string | null
  resolved_by_id: string | null
  resolved_at: string | null
  created_at: string
}

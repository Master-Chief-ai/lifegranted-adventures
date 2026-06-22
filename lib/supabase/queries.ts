import { createClient } from '@/lib/supabase/server'
import {
  MOCK_OPERATORS,
  MOCK_TOURS,
  MOCK_REVIEWS,
  MOCK_BLOG_POSTS,
  MOCK_AVAILABILITY,
  MOCK_BOOKINGS,
  MOCK_DISPUTES,
  isSupabaseConfigured,
} from '@/lib/supabase/mock-data'
import { getRuntimeBooking } from '@/lib/supabase/runtime-bookings'
import type { Dispute } from '@/types'
import type {
  Tour,
  TourWithOperator,
  Operator,
  Review,
  Booking,
  BookingWithDetails,
  TourAvailability,
  TourFilters,
  BlogPost,
} from '@/types'

function attachOperator(tour: Tour): TourWithOperator {
  const operator = MOCK_OPERATORS.find((o) => o.id === tour.operator_id) as Operator
  return { ...tour, operator }
}

function applyMockFilters(tours: TourWithOperator[], filters?: TourFilters): TourWithOperator[] {
  let result = [...tours]
  if (!filters) return result

  if (filters.region) {
    result = result.filter((t) => t.regions.includes(filters.region!))
  }
  if (filters.regions && filters.regions.length > 0) {
    result = result.filter((t) => t.regions.some((r) => filters.regions!.includes(r)))
  }
  if (filters.tourType) {
    result = result.filter((t) => t.tour_type === filters.tourType)
  }
  if (filters.tourTypes && filters.tourTypes.length > 0) {
    result = result.filter((t) => filters.tourTypes!.includes(t.tour_type))
  }
  if (filters.minDuration) {
    result = result.filter((t) => t.duration_days >= filters.minDuration!)
  }
  if (filters.maxDuration) {
    result = result.filter((t) => t.duration_days <= filters.maxDuration!)
  }
  if (filters.minPrice) {
    result = result.filter((t) => t.price_usd >= filters.minPrice!)
  }
  if (filters.maxPrice) {
    result = result.filter((t) => t.price_usd <= filters.maxPrice!)
  }
  if (filters.groupSize) {
    result = result.filter((t) => t.max_group >= filters.groupSize!)
  }
  if (filters.instantBookOnly) {
    result = result.filter((t) => t.is_instant_book)
  }
  if (filters.ttbOnly) {
    result = result.filter((t) => t.operator.ttb_licensed)
  }
  if (filters.minRating) {
    result = result.filter((t) => t.avg_rating >= filters.minRating!)
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase()
    result = result.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    )
  }

  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price_usd - b.price_usd)
      break
    case 'price_desc':
      result.sort((a, b) => b.price_usd - a.price_usd)
      break
    case 'rating':
      result.sort((a, b) => b.avg_rating - a.avg_rating)
      break
    case 'newest':
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    default:
      result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
  }

  return result
}

export async function getActiveTours(filters?: TourFilters): Promise<TourWithOperator[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      let query = supabase.from('tours').select('*, operator:operators(*)').eq('is_active', true)
      if (filters?.tourType) query = query.eq('tour_type', filters.tourType)
      if (filters?.minPrice) query = query.gte('price_usd', filters.minPrice)
      if (filters?.maxPrice) query = query.lte('price_usd', filters.maxPrice)
      const { data, error } = await query
      if (error) throw error
      return (data as TourWithOperator[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  const tours = MOCK_TOURS.filter((t) => t.is_active).map(attachOperator)
  return applyMockFilters(tours, filters)
}

export async function getTourBySlug(slug: string): Promise<{
  tour: TourWithOperator
  reviews: Review[]
  availability: TourAvailability[]
} | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: tour, error } = await supabase
        .from('tours')
        .select('*, operator:operators(*)')
        .eq('slug', slug)
        .single()
      if (error) throw error
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('tour_id', tour.id)
        .eq('is_published', true)
      const { data: availability } = await supabase.from('availability').select('*').eq('tour_id', tour.id)
      return { tour: tour as TourWithOperator, reviews: (reviews as Review[]) ?? [], availability: (availability as TourAvailability[]) ?? [] }
    } catch {
      // fall through to mock
    }
  }
  const tour = MOCK_TOURS.find((t) => t.slug === slug)
  if (!tour) return null
  const reviews = MOCK_REVIEWS.filter((r) => r.tour_id === tour.id)
  const availability = MOCK_AVAILABILITY[tour.id] ?? []
  return { tour: attachOperator(tour), reviews, availability }
}

export async function getOperatorBySlug(slug: string): Promise<{
  operator: Operator
  tours: Tour[]
  reviews: Review[]
} | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: operator, error } = await supabase.from('operators').select('*').eq('slug', slug).single()
      if (error) throw error
      const { data: tours } = await supabase.from('tours').select('*').eq('operator_id', operator.id).eq('is_active', true)
      const { data: reviews } = await supabase.from('reviews').select('*').eq('operator_id', operator.id).eq('is_published', true)
      return { operator: operator as Operator, tours: (tours as Tour[]) ?? [], reviews: (reviews as Review[]) ?? [] }
    } catch {
      // fall through to mock
    }
  }
  const operator = MOCK_OPERATORS.find((o) => o.slug === slug)
  if (!operator) return null
  const tours = MOCK_TOURS.filter((t) => t.operator_id === operator.id)
  const reviews = MOCK_REVIEWS.filter((r) => r.operator_id === operator.id)
  return { operator, tours, reviews }
}

export async function getFeaturedTours(limit = 6): Promise<TourWithOperator[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tours')
        .select('*, operator:operators(*)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('avg_rating', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data as TourWithOperator[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_TOURS.filter((t) => t.is_active && t.is_featured)
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, limit)
    .map(attachOperator)
}

export async function searchTours(query: string, filters?: TourFilters): Promise<TourWithOperator[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tours')
        .select('*, operator:operators(*)')
        .eq('is_active', true)
        .textSearch('title', query)
      if (error) throw error
      return (data as TourWithOperator[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return getActiveTours({ ...filters, searchQuery: query })
}

export async function getAvailabilityForTour(tourId: string, year: number, month: number): Promise<TourAvailability[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end = `${year}-${String(month).padStart(2, '0')}-31`
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('tour_id', tourId)
        .gte('available_date', start)
        .lte('available_date', end)
      if (error) throw error
      return (data as TourAvailability[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  const all = MOCK_AVAILABILITY[tourId] ?? []
  return all.filter((a) => {
    const d = new Date(a.available_date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

function attachBookingDetails(booking: Booking): BookingWithDetails {
  const tour = MOCK_TOURS.find((t) => t.id === booking.tour_id) as Tour
  const operator = MOCK_OPERATORS.find((o) => o.id === booking.operator_id) as Operator
  return { ...booking, tour, operator }
}

export async function getBookingByRef(ref: string): Promise<BookingWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*, tour:tours(*), operator:operators(*)')
        .eq('booking_ref', ref)
        .single()
      if (error) throw error
      return data as BookingWithDetails
    } catch {
      return null
    }
  }
  const booking = MOCK_BOOKINGS.find((b) => b.booking_ref === ref) ?? getRuntimeBooking(ref)
  return booking ? attachBookingDetails(booking) : null
}

export async function getUserBookings(): Promise<BookingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('bookings').select('*, tour:tours(*), operator:operators(*)')
      if (error) throw error
      return (data as BookingWithDetails[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BOOKINGS.map(attachBookingDetails)
}

export async function getRecentReviews(limit = 3): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data as Review[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return [...MOCK_REVIEWS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit)
}

export async function getPublishedBlogPosts(limit = 4): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data as BlogPost[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BLOG_POSTS.slice(0, limit)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      return (data as BlogPost[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return [...MOCK_BLOG_POSTS].sort(
    (a, b) => new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime()
  )
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data as BlogPost[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return [...MOCK_BLOG_POSTS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
      if (error) throw error
      return data as BlogPost
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BLOG_POSTS.find((p) => p.id === id) ?? null
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
      if (error) throw error
      return data as BlogPost
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BLOG_POSTS.find((p) => p.slug === slug) ?? null
}

export async function getAllOperators(): Promise<Operator[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('operators').select('*').eq('status', 'approved')
      if (error) throw error
      return (data as Operator[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_OPERATORS.filter((o) => o.status === 'approved')
}

export async function getToursByRegion(region: string): Promise<TourWithOperator[]> {
  const tours = await getActiveTours()
  return tours.filter((t) => t.regions.includes(region))
}

export function getOperatorById(operatorId: string): Operator | undefined {
  return MOCK_OPERATORS.find((o) => o.id === operatorId)
}

export async function getOperatorTours(operatorId: string): Promise<Tour[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('tours').select('*').eq('operator_id', operatorId)
      if (error) throw error
      return (data as Tour[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_TOURS.filter((t) => t.operator_id === operatorId)
}

export async function getOperatorTourById(operatorId: string, tourId: string): Promise<Tour | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('tours').select('*').eq('id', tourId).eq('operator_id', operatorId).single()
      if (error) throw error
      return data as Tour
    } catch {
      // fall through to mock
    }
  }
  return MOCK_TOURS.find((t) => t.id === tourId && t.operator_id === operatorId) ?? null
}

export async function getOperatorBookings(operatorId: string): Promise<BookingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('bookings').select('*, tour:tours(*), operator:operators(*)').eq('operator_id', operatorId)
      if (error) throw error
      return (data as BookingWithDetails[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BOOKINGS.filter((b) => b.operator_id === operatorId).map(attachBookingDetails)
}

export async function getOperatorReviews(operatorId: string): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('reviews').select('*').eq('operator_id', operatorId)
      if (error) throw error
      return (data as Review[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_REVIEWS.filter((r) => r.operator_id === operatorId)
}

export async function getAllBookingsAdmin(): Promise<BookingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('bookings').select('*, tour:tours(*), operator:operators(*)')
      if (error) throw error
      return (data as BookingWithDetails[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_BOOKINGS.map(attachBookingDetails)
}

export async function getAllOperatorsAdmin(): Promise<Operator[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('operators').select('*')
      if (error) throw error
      return (data as Operator[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_OPERATORS
}

export async function getAllReviewsAdmin(): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('reviews').select('*')
      if (error) throw error
      return (data as Review[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_REVIEWS
}

export async function getAllDisputes(): Promise<Dispute[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('disputes').select('*')
      if (error) throw error
      return (data as Dispute[]) ?? []
    } catch {
      // fall through to mock
    }
  }
  return MOCK_DISPUTES
}

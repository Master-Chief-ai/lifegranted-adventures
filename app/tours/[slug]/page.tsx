import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Clock, Users, Mountain, Tag, Languages } from 'lucide-react'
import { getTourBySlug, getActiveTours } from '@/lib/supabase/queries'
import { MOCK_TOURS } from '@/lib/supabase/mock-data'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { TourCard } from '@/components/common/TourCard'
import { TourGallery } from '@/components/marketplace/TourGallery'
import { TourTabs } from '@/components/marketplace/TourTabs'
import { BookingWidget } from '@/components/marketplace/BookingWidget'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 3600

const TYPE_IMAGES: Record<string, string> = {
  safari: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
  chimpanzee: 'https://images.unsplash.com/photo-1534476478164-b15fec4f091c?w=1200',
  trekking: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200',
  beach: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200',
  default: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
}

export async function generateStaticParams() {
  return MOCK_TOURS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getTourBySlug(slug)
  if (!result) return {}
  return {
    title: result.tour.meta_title ?? result.tour.title,
    description: result.tour.meta_description ?? result.tour.description ?? undefined,
  }
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getTourBySlug(slug)
  if (!result) notFound()

  const { tour, reviews, availability } = result
  const fallbackImage = TYPE_IMAGES[tour.tour_type] ?? TYPE_IMAGES.default

  const allTours = await getActiveTours()
  const related = allTours.filter((t) => t.id !== tour.id && t.regions.some((r) => tour.regions.includes(r))).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.images[0]?.url ?? fallbackImage,
    touristType: 'Adventure',
    provider: {
      '@type': 'LocalBusiness',
      name: tour.operator.business_name,
      address: { '@type': 'PostalAddress', addressLocality: tour.operator.city, addressCountry: 'TZ' },
    },
    offers: {
      '@type': 'Offer',
      price: tour.price_usd,
      priceCurrency: 'USD',
    },
    ...(tour.total_reviews > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: tour.avg_rating, reviewCount: tour.total_reviews } }
      : {}),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lifegranted-adventures.co.tz' },
      { '@type': 'ListItem', position: 2, name: 'Tours', item: 'https://lifegranted-adventures.co.tz/tours' },
      { '@type': 'ListItem', position: 3, name: tour.title, item: `https://lifegranted-adventures.co.tz/tours/${tour.slug}` },
    ],
  }

  return (
    <div className="container-lg py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 lg:w-[65%]">
          <TourGallery images={tour.images} fallback={fallbackImage} />

          <h1 className="mt-6 font-display text-3xl font-bold text-navy">{tour.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-navy">
            <span className="flex items-center gap-1.5">
              <Clock size={16} className="text-teal" /> {tour.duration_days}D / {tour.duration_nights}N
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-teal" /> {tour.min_group}-{tour.max_group} guests
            </span>
            <span className="flex items-center gap-1.5">
              <Mountain size={16} className="text-teal" /> {tour.difficulty}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={16} className="text-teal" /> {tour.tour_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Languages size={16} className="text-teal" /> {tour.languages.join(', ').toUpperCase()}
            </span>
            <StarRating rating={tour.avg_rating} reviewCount={tour.total_reviews} />
          </div>

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-teal-light">
                {tour.operator.logo_url && <Image src={tour.operator.logo_url} alt={tour.operator.business_name} fill className="object-cover" />}
              </div>
              <div>
                <p className="font-semibold text-navy">{tour.operator.business_name}</p>
                <p className="text-sm text-muted">{tour.operator.city}</p>
              </div>
              <StarRating rating={tour.operator.avg_rating} reviewCount={tour.operator.total_reviews} />
              {tour.operator.ttb_licensed && <Badge variant="green">TTB Licensed</Badge>}
            </div>
            <div className="flex gap-2">
              <Link href={`/operators/${tour.operator.slug}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                View All Tours
              </Link>
              <a
                href={`https://wa.me/255000000000`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}
              >
                WhatsApp
              </a>
            </div>
          </Card>

          <TourTabs tour={tour} reviews={reviews} />

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-navy">Related Tours</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((t) => (
                  <TourCard key={t.id} tour={t} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-[35%]">
          <BookingWidget tour={tour} availability={availability} />
        </div>
      </div>
    </div>
  )
}

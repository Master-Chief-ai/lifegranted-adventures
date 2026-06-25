import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react'
import { getOperatorBySlug } from '@/lib/supabase/queries'
import { MOCK_OPERATORS } from '@/lib/supabase/mock-data'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { TourCard } from '@/components/common/TourCard'
import { ReviewCard } from '@/components/common/ReviewCard'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TourWithOperator } from '@/types'

export async function generateStaticParams() {
  return MOCK_OPERATORS.map((o) => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getOperatorBySlug(slug)
  if (!result) return {}
  return {
    title: result.operator.business_name,
    description: result.operator.description ?? undefined,
  }
}

export default async function OperatorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getOperatorBySlug(slug)
  if (!result) notFound()

  const { operator, tours, reviews } = result
  const toursWithOperator: TourWithOperator[] = tours.map((t) => ({ ...t, operator }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: operator.business_name,
    description: operator.description,
    telephone: operator.phone,
    email: operator.email,
    address: { '@type': 'PostalAddress', addressLocality: operator.city, addressCountry: 'TZ' },
    openingHours: 'Mo-Su 08:00-18:00',
    aggregateRating: operator.total_reviews
      ? { '@type': 'AggregateRating', ratingValue: operator.avg_rating, reviewCount: operator.total_reviews }
      : undefined,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lifegranted-adventures.co.tz' },
      { '@type': 'ListItem', position: 2, name: 'Operators', item: 'https://lifegranted-adventures.co.tz/operators' },
      { '@type': 'ListItem', position: 3, name: operator.business_name, item: `https://lifegranted-adventures.co.tz/operators/${operator.slug}` },
    ],
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="relative h-64 w-full">
        {operator.cover_url && <Image src={operator.cover_url} alt={operator.business_name} fill className="object-cover" />}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container-lg -mt-12 pb-10">
        <div className="flex items-end gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-teal-light">
            {operator.logo_url && <Image src={operator.logo_url} alt={operator.business_name} fill className="object-cover" />}
          </div>
          <div className="pb-2">
            <h1 className="font-display text-2xl font-bold text-navy">{operator.business_name}</h1>
            <p className="text-sm text-muted">{operator.city}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StarRating rating={operator.avg_rating} reviewCount={operator.total_reviews} />
          {operator.regions.map((r) => (
            <Badge key={r} variant="teal">
              {r}
            </Badge>
          ))}
          {operator.ttb_licensed && (
            <Badge variant="green" className="flex items-center gap-1">
              <ShieldCheck size={12} /> TTB Licensed
            </Badge>
          )}
          {operator.tato_member && <Badge variant="gold">TATO Member</Badge>}
        </div>

        <div className="mt-4 flex gap-2">
          <a href={`https://wa.me/255000000000`} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'flex items-center gap-1.5')}>
            <MessageCircle size={14} /> WhatsApp
          </a>
          <a href={`mailto:${operator.email}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-1.5')}>
            <Mail size={14} /> Email
          </a>
          <a href="#tours" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            View Tours
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-navy">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/90">{operator.description}</p>

            <h2 id="tours" className="mt-8 font-display text-xl font-bold text-navy">
              Tours by {operator.business_name}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {toursWithOperator.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            <h2 className="mt-10 font-display text-xl font-bold text-navy">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 ? <p className="text-sm text-muted">No reviews yet.</p> : reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          </div>

          <div className="lg:w-[300px]">
            <Card className="sticky top-24 p-5">
              <p className="font-semibold text-navy">Contact {operator.business_name}</p>
              <p className="mt-1 text-sm text-muted">{operator.phone}</p>
              <p className="text-sm text-muted">{operator.email}</p>
              <a href={`https://wa.me/255000000000`} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'primary' }), 'mt-4 w-full')}>
                Message on WhatsApp
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

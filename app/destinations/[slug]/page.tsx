import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Calendar, Lightbulb } from 'lucide-react'
import { DESTINATIONS, TANZANIA_REGIONS } from '@/lib/constants'
import { getActiveTours } from '@/lib/supabase/queries'
import { TourCard } from '@/components/common/TourCard'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { JsonLd } from '@/components/JsonLd'

export async function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const destination = DESTINATIONS.find((d) => d.slug === slug)
  if (!destination) return {}
  return { title: destination.name, description: destination.tagline }
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const destination = DESTINATIONS.find((d) => d.slug === slug)
  if (!destination) notFound()

  const regionName = TANZANIA_REGIONS.find((r) => r.slug === slug)?.name
  const allTours = await getActiveTours()
  const tours = regionName ? allTours.filter((t) => t.regions.includes(regionName)) : []
  const related = DESTINATIONS.filter((d) => d.slug !== slug).slice(0, 3)

  return (
    <div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristDestination',
          name: destination.name,
          description: destination.overview,
          photo: destination.image,
          containedInPlace: { '@type': 'Country', name: 'Tanzania' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lifegranted-adventures.co.tz' },
            { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://lifegranted-adventures.co.tz/destinations' },
            { '@type': 'ListItem', position: 3, name: destination.name, item: `https://lifegranted-adventures.co.tz/destinations/${destination.slug}` },
          ],
        }}
      />
      <div className="relative h-72 w-full">
        <Image src={destination.image} alt={destination.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-lg absolute inset-0 flex flex-col items-start justify-end pb-8 text-white">
          <h1 className="font-display text-4xl font-bold">{destination.name}</h1>
          <p className="mt-1 text-lg text-white/80">{destination.tagline}</p>
        </div>
      </div>

      <div className="container-lg py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-navy">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/90">{destination.overview}</p>

            <h2 className="mt-8 font-display text-xl font-bold text-navy">Highlights</h2>
            <ul className="mt-3 space-y-2">
              {destination.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-navy">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" /> {h}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold text-navy">
              <Calendar size={20} className="text-teal" /> Best Time to Visit
            </h2>
            <p className="mt-2 text-sm text-navy/90">{destination.bestTime}</p>

            <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold text-navy">
              <Lightbulb size={20} className="text-teal" /> Travel Tips
            </h2>
            <ul className="mt-3 space-y-2">
              {destination.tips.map((tip) => (
                <li key={tip} className="text-sm text-navy/90">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-[300px]">
            <Card className="sticky top-24 p-5 text-center">
              <p className="font-display text-3xl font-bold text-teal">{destination.tourCount}</p>
              <p className="text-sm text-muted">tours available</p>
              <Link href={`/tours?regions=${encodeURIComponent(regionName ?? '')}`} className={cn(buttonVariants({ variant: 'gold' }), 'mt-4 w-full')}>
                Browse Tours in This Region →
              </Link>
            </Card>
          </div>
        </div>

        {tours.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-navy">Tours in {destination.name}</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-navy">Other Destinations</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={d.image} alt={d.name} fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-display text-base font-bold">{d.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

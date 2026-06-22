import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Star, Lock, Zap, Leaf, MessageCircle, Search, Shield, Tent } from 'lucide-react'
import { getFeaturedTours, getRecentReviews } from '@/lib/supabase/queries'
import { TourCard } from '@/components/common/TourCard'
import { ReviewCard } from '@/components/common/ReviewCard'
import { HeroSearchBar } from '@/components/marketplace/HeroSearchBar'
import { DESTINATIONS } from '@/lib/constants'
import { NewsletterForm } from '@/components/marketplace/NewsletterForm'
import { JsonLd } from '@/components/JsonLd'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'TTB Licensed Operators' },
  { icon: Star, label: 'Verified Reviews' },
  { icon: Lock, label: 'Secure Payments' },
  { icon: Zap, label: 'Instant Booking' },
  { icon: Leaf, label: 'Western TZ Specialists' },
  { icon: MessageCircle, label: '24/7 WhatsApp' },
]

const HOW_IT_WORKS = [
  { icon: Search, title: 'Search and Compare', text: 'Browse vetted tours across Tanzania and compare prices direct from operators.' },
  { icon: Shield, title: 'Book Securely Online', text: 'Pay safely online with instant confirmation — no hidden fees.' },
  { icon: Tent, title: 'Experience Tanzania', text: 'Meet your local operator and enjoy an unforgettable Tanzania adventure.' },
]

const SPOTLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1534476478164-b15fec4f091c?w=600',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600',
]

export default async function HomePage() {
  const [featuredTours, recentReviews] = await Promise.all([getFeaturedTours(6), getRecentReviews(3)])

  return (
    <div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'LifeGranted Adventures',
          url: 'https://lifegrantedadventures.co.tz',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://lifegrantedadventures.co.tz/tours?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LifeGranted Adventures',
          url: 'https://lifegrantedadventures.co.tz',
          logo: 'https://lifegrantedadventures.co.tz/logo.png',
          description: "Tanzania's premier safari marketplace",
          address: { '@type': 'PostalAddress', addressLocality: 'Mwanza', addressCountry: 'TZ' },
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['English', 'Swahili'] },
          sameAs: [
            'https://instagram.com/lifegrantedadventures',
            'https://facebook.com/lifegrantedadventures',
            'https://linkedin.com/company/lifegrantedadventures',
          ],
        }}
      />
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-teal to-teal-dark">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600"
            alt="Tanzania landscape"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container-lg relative z-10 py-20 text-center">
          <span className="inline-block rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-navy">
            🦁 Tanzania&apos;s Premier Safari Marketplace
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold text-white sm:text-6xl">
            Tanzania&apos;s Wild Heart Awaits
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-white/80 sm:text-xl">
            Book authentic safaris direct with vetted local operators.
          </p>
          <HeroSearchBar />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-white py-4">
        <div className="container-lg flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm font-medium text-navy">
              <b.icon size={18} className="text-teal" />
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Featured tours */}
      <section className="container-lg py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-navy">Hand-Picked by Our Tanzania Team</h2>
            <p className="mt-1 text-muted">Top-rated tours from our most trusted operators</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/tours" className="font-medium text-teal hover:underline">
            View All Tours →
          </Link>
        </div>
      </section>

      {/* Western Tanzania spotlight */}
      <section className="bg-teal py-16">
        <div className="container-lg grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {SPOTLIGHT_IMAGES.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={src} alt="Western Tanzania" fill className="object-cover" />
              </div>
            ))}
          </div>
          <div className="text-white">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold">Western Tanzania Circuit</span>
            <h2 className="mt-3 font-display text-3xl font-bold">Africa&apos;s Best-Kept Secret</h2>
            <ul className="mt-5 space-y-2 text-white/90">
              <li>• No tourist convoys</li>
              <li>• Chimpanzees at Mahale</li>
              <li>• Katavi&apos;s hippo pools</li>
              <li>• Fly-in access</li>
            </ul>
            <Link
              href="/destinations/western-circuit"
              className="mt-6 inline-block rounded-lg border border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-teal"
            >
              Explore Western Tanzania →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="container-lg">
          <h2 className="text-center font-display text-3xl font-bold text-navy">Book Your Safari in 3 Simple Steps</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-light text-teal">
                  <step.icon size={26} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-16">
        <div className="container-lg">
          <h2 className="text-center font-display text-3xl font-bold text-navy">What Our Travellers Say</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Destinations preview */}
      <section className="bg-white py-16">
        <div className="container-lg">
          <h2 className="text-center font-display text-3xl font-bold text-navy">Explore Tanzania&apos;s Wild Regions</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={d.image} alt={d.name} fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-display text-lg font-bold">{d.name}</p>
                  <p className="text-sm text-white/80">{d.tourCount} tours</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-navy py-16">
        <div className="container-sm text-center">
          <h2 className="font-display text-2xl font-bold text-white">Get Tanzania Safari Tips</h2>
          <p className="mt-2 text-white/70">Seasonal migration updates, new tours, and exclusive offers.</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { DESTINATIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: "Explore Tanzania's Destinations",
  description: 'Discover the Western Circuit, Northern Circuit, Kilimanjaro, Southern Circuit, Zanzibar, and Lake Victoria.',
}

export default function DestinationsPage() {
  return (
    <div className="container-lg py-10">
      <h1 className="font-display text-3xl font-bold text-navy">Explore Tanzania&apos;s Wild Regions</h1>
      <p className="mt-1 text-muted">Six distinct circuits, each with its own character and wildlife</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-xl">
            <Image src={d.image} alt={d.name} fill className="object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-display text-xl font-bold">{d.name}</p>
              <p className="text-sm text-white/80">{d.tagline}</p>
              <p className="mt-1 text-xs text-white/70">{d.tourCount} tours</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { ShieldCheck, Heart, Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: "LifeGranted Adventures' story — founded in Mwanza to connect travelers directly with Tanzania's best local operators.",
}

export default function AboutPage() {
  return (
    <div className="container-sm py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Our Story</h1>
      <p className="mt-4 text-navy/90">
        LifeGranted Adventures was founded in Mwanza, Tanzania, by a team who grew tired of watching local tour operators lose
        30% or more of every booking to international marketplaces — while travelers paid inflated prices for the privilege.
        We built a platform that keeps more money with the people actually running the safaris, while giving travelers direct
        access to vetted, TTB-licensed operators at fairer prices.
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold text-navy">Our Mission</h2>
      <p className="mt-3 text-navy/90">
        To make Tanzania&apos;s wildest, least-visited corners — Mahale, Katavi, Rubondo, Gombe — as easy to book as the
        Serengeti, while ensuring local operators earn a fair share of every trip they deliver.
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold text-navy">Why We&apos;re Different</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <ShieldCheck className="text-teal" size={28} />
          <p className="mt-2 font-semibold text-navy">Vetted Operators</p>
          <p className="text-sm text-muted">Every operator is reviewed for TTB licensing and TATO membership before going live.</p>
        </div>
        <div>
          <Heart className="text-teal" size={28} />
          <p className="mt-2 font-semibold text-navy">Fair Commission</p>
          <p className="text-sm text-muted">We take 12% — half what most international marketplaces charge.</p>
        </div>
        <div>
          <Compass className="text-teal" size={28} />
          <p className="mt-2 font-semibold text-navy">Local Expertise</p>
          <p className="text-sm text-muted">Based in Mwanza, gateway to the Western Circuit — we know this country.</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold text-navy">Our Commitments</h2>
      <ul className="mt-3 space-y-2 text-navy/90">
        <li>• Every booking is protected by secure payment processing</li>
        <li>• Operators receive 88% of every booking, paid automatically</li>
        <li>• We verify TTB licensing before listing any operator</li>
        <li>• Reviews are only from travelers who completed a verified booking</li>
      </ul>
    </div>
  )
}

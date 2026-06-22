import Link from 'next/link'
import { getFeaturedTours } from '@/lib/supabase/queries'
import { TourCard } from '@/components/common/TourCard'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default async function NotFound() {
  const suggested = await getFeaturedTours(3)

  return (
    <div className="container-lg py-20 text-center">
      <span className="font-display text-6xl font-bold text-teal">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-navy">Looks like this trail doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for may have been moved or never existed.</p>

      <form action="/tours" className="mx-auto mt-6 flex max-w-md gap-2">
        <input
          name="q"
          placeholder="Search tours…"
          className="h-11 flex-1 rounded-lg border border-border bg-white px-4 text-sm text-navy focus:border-teal"
        />
        <button type="submit" className={cn(buttonVariants({ variant: 'primary' }))}>
          Search
        </button>
      </form>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/tours" className={cn(buttonVariants({ variant: 'secondary' }))}>
          Browse Tours
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
          Home
        </Link>
      </div>

      {suggested.length > 0 && (
        <div className="mt-16 text-left">
          <h2 className="text-center font-display text-xl font-bold text-navy">You Might Like These Tours</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {suggested.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { notFound } from 'next/navigation'
import { getTourBySlug } from '@/lib/supabase/queries'
import { BookingProgress } from '@/components/booking/BookingProgress'
import { BookingProvider } from '@/components/booking/BookingContext'
import { TourSummaryCard } from '@/components/booking/TourSummaryCard'

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tourSlug: string }>
}) {
  const { tourSlug } = await params
  const result = await getTourBySlug(tourSlug)
  if (!result) notFound()

  const { tour, availability } = result

  return (
    <div className="bg-cream">
      <BookingProgress />
      <div className="container-lg pb-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 lg:w-[60%]">
            <BookingProvider value={{ tour, operator: tour.operator, availability }}>{children}</BookingProvider>
          </div>
          <div className="lg:w-[40%]">
            <TourSummaryCard tour={tour} operator={tour.operator} />
          </div>
        </div>
      </div>
    </div>
  )
}

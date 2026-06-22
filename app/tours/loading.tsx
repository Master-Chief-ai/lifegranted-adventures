import { SkeletonCard } from '@/components/common/SkeletonCard'

export default function ToursLoading() {
  return (
    <div className="container-lg py-10">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

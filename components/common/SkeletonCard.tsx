export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="aspect-video w-full animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard

export default function AdminLoading() {
  return (
    <div>
      <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
        <div className="h-10 animate-pulse bg-gray-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-border p-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

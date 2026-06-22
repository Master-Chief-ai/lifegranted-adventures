export default function PortalLoading() {
  return (
    <div>
      <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="h-64 animate-pulse rounded-xl bg-gray-200 lg:col-span-3" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200 lg:col-span-2" />
      </div>
    </div>
  )
}

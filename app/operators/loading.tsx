export default function OperatorsLoading() {
  return (
    <div className="container-lg py-10">
      <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-9 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/account/bookings', label: 'My Bookings' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/wishlist', label: 'Wishlist' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-lg py-10">
      <h1 className="font-display text-2xl font-bold text-navy">My Account</h1>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-teal-light hover:text-teal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

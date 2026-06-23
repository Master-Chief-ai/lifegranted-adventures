import Link from 'next/link'
import { Camera, Users, Link2, PlaySquare, MessageCircle, Lock } from 'lucide-react'

export function Footer() {
  return (
    <>
      <footer className="bg-navy text-white">
        <div className="container-lg grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal font-display text-sm font-bold text-white">
                LGA
              </span>
              <span className="font-display text-lg font-bold text-white">LifeGranted Adventures</span>
            </Link>
            <p className="mt-3 text-sm text-[#5A6B7A]">Tanzania&apos;s premier safari marketplace</p>
            <div className="mt-4 flex gap-3">
              {[Camera, Users, Link2, PlaySquare, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="text-[#5A6B7A] hover:text-gold" aria-label="social link">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#5A6B7A]">
              <li><Link href="/tours" className="hover:text-gold">Tours</Link></li>
              <li><Link href="/destinations" className="hover:text-gold">Destinations</Link></li>
              <li><Link href="/operators" className="hover:text-gold">Operators</Link></li>
              <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
              <li><Link href="/about" className="hover:text-gold">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">For Operators</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#5A6B7A]">
              <li><Link href="/operator/register" className="hover:text-gold">List Your Tours</Link></li>
              <li><Link href="/auth/login" className="hover:text-gold">Operator Login</Link></li>
              <li><Link href="/for-operators" className="hover:text-gold">Operator FAQ</Link></li>
              <li><Link href="/for-operators" className="hover:text-gold">Become a Partner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#5A6B7A]">
              <li><Link href="/contact" className="hover:text-gold">Contact Us</Link></li>
              <li><Link href="/contact" className="hover:text-gold">FAQ</Link></li>
              <li><Link href="/legal/terms" className="hover:text-gold">Terms</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-gold">Privacy</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:text-gold">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-lg flex flex-col items-center justify-between gap-3 py-5 text-xs text-[#5A6B7A] sm:flex-row">
            <p>© 2025 LifeGranted Adventures Ltd. TTB Licensed Travel Agent. Mwanza, Tanzania.</p>
            <p className="flex items-center gap-1.5">
              <Lock size={12} /> Payments secured by Flutterwave
            </p>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/255000000000?text=Hello+LifeGranted+Adventures"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-gold transition-transform hover:scale-105 sm:h-12 sm:w-12"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </>
  )
}

export default Footer

import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifegrantedadventures.co.tz'),
  title: {
    template: '%s | LifeGranted Adventures',
    default: 'LifeGranted Adventures — Tanzania Safari Marketplace',
  },
  description:
    'Discover and book Tanzania safaris with vetted local operators. Western Tanzania specialists — Mahale Mountains, Katavi National Park, Rubondo Island, and Gombe Stream. Secure booking, lower prices, instant confirmation.',
  keywords: [
    'Tanzania safari',
    'Western Tanzania',
    'Mahale Mountains safari',
    'chimpanzee trekking Tanzania',
    'Katavi National Park',
    'book Tanzania safari',
    'LifeGranted Adventures',
    'Mwanza safari',
    'Tanzania tour operator',
    'Rubondo Island',
  ],
  authors: [{ name: 'LifeGranted Adventures', url: 'https://lifegrantedadventures.co.tz' }],
  creator: 'LifeGranted Adventures',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lifegrantedadventures.co.tz',
    siteName: 'LifeGranted Adventures',
    title: 'LifeGranted Adventures — Tanzania Safari Marketplace',
    description: 'Book Tanzania safaris direct with vetted local operators. Western Tanzania specialists.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'LifeGranted Adventures — Tanzania Safari Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lifegrantedadv',
    creator: '@lifegrantedadv',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: 'placeholder-google-verification' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="container-sm py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: January 2025</p>
      <div className="prose mt-6 max-w-none space-y-4 text-navy/90">
        <p>
          LifeGranted Adventures collects only the information necessary to process bookings, verify operators, and
          improve our service.
        </p>
        <h2 className="font-display text-xl font-bold text-navy">1. Information We Collect</h2>
        <p>Name, email, phone/WhatsApp number, nationality, and payment details necessary to complete a booking.</p>
        <h2 className="font-display text-xl font-bold text-navy">2. How We Use It</h2>
        <p>To process bookings, communicate with you about your trip, and share necessary details with your tour operator.</p>
        <h2 className="font-display text-xl font-bold text-navy">3. Data Sharing</h2>
        <p>We share booking details only with the relevant operator and our payment processor, Flutterwave.</p>
        <h2 className="font-display text-xl font-bold text-navy">4. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
      </div>
    </div>
  )
}

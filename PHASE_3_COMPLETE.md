# Phase 3 — Booking Flow & Payments: Complete

## Status
`npm run build` passes with zero errors. `npx tsc --noEmit` is clean. The complete 4-step booking flow works end-to-end: date selection → guest details → payment (card or mobile money, both mocked) → confirmation with a real downloadable PDF and `.ics` calendar file.

## Booking flow (`app/book/[tourSlug]/`)
- **Layout** (`layout.tsx`) — fetches the tour server-side, renders `BookingProgress` (4-step indicator with teal active/checkmark states) and a sticky `TourSummaryCard`, and provides tour/operator/availability via `BookingContext` to all steps.
- **Step 1 — Dates** (`dates/page.tsx`) — full month calendar with prev/next navigation, deterministically-seeded mock availability (85% available / 10% booked out / 5% unavailable), group-size stepper, add-on toggles, live price breakdown, continue button disabled until a date is picked. State is persisted to `sessionStorage` via `lib/booking-state.ts` so the back button is safe.
- **Step 2 — Details** (`details/page.tsx`) — react-hook-form + zod: lead traveller info with country-code WhatsApp input, nationality select, children stepper, special requirements (dietary/medical/occasion), "how did you hear about us," and required terms/consent checkboxes.
- **Step 3 — Payment** (`payment/page.tsx`) — Radix Tabs for Card vs M-Pesa/Mobile Money. Card tab shows a styled mock card form, 2-second simulated processing, then calls `/api/booking/create`. Mobile money tab shows a network selector (Vodacom/Airtel/Tigo/Halotel), a "waiting for confirmation" countdown UI, 3-second simulated approval, then books. Both redirect to the confirmation page with `?ref=`.
- **Step 4 — Confirmed** (`confirmed/page.tsx`) — animated CSS checkmark + confetti (`ConfettiCheckmark`), copyable booking reference pill (`CopyRefButton`), full booking summary card with operator WhatsApp link, PDF/calendar/WhatsApp-share action buttons, a "What Happens Next" timeline, and a link to `/account/bookings`. Falls back to a friendly not-found state if the ref doesn't resolve.

## API routes
- `POST /api/booking/create` — validates with zod, resolves the tour/operator (Supabase first, mock fallback), computes the 12%/88% commission split, generates a `LGA-YYYY-NNNNN` ref, persists the booking (Supabase when configured; otherwise a file-backed mock store — see below), and sends the confirmation email (which also triggers the operator notification).
- `GET /api/booking/pdf/[ref]` — renders a real PDF via `@react-pdf/renderer` (booking details, guest details, payment breakdown, inclusions, cancellation/meeting-point/emergency info) and returns it as a downloadable attachment. **Verified**: produces a valid `PDF document, version 1.3` file.
- `GET /api/booking/calendar/[ref]` — generates a valid `.ics` VEVENT with correct `DTSTART`/`DTEND` (offset by `tour.duration_days`), operator contact, and region as location.

## Mock booking persistence
A plain in-memory `Map` does not survive Next.js dev-server hot reloads, so bookings created in mock mode are persisted to `.next/cache/lga-mock-bookings.json` via `lib/supabase/runtime-bookings.ts` (server-only — kept out of `mock-data.ts` specifically because that file is also imported by a client component, and bundling `fs`/`path` there would break the client build). `getBookingByRef` checks `MOCK_BOOKINGS` (seeded demo bookings) then this runtime store.

## Email templates (`lib/email-templates/`)
`booking-confirmation.tsx`, `operator-notification.tsx`, `pre-departure.tsx`, `review-request.tsx` — all built as React Email components. `lib/email.tsx` sends via Resend when `RESEND_API_KEY` is real; otherwise renders the email to HTML and logs it to the console, always returning `{ success: true }`.

## Payments (stub, real-key-ready)
- `lib/stripe.ts` — `stripe` client is `null` when `STRIPE_SECRET_KEY` is a placeholder; `createPaymentIntent` and `createConnectAccountLink` both return realistic mock responses in that case and call the real Stripe API otherwise.
- `lib/flutterwave.ts` — `flutterwaveEnabled` flag; `initiateCharge` returns a mock success response when disabled.
- `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/flutterwave/route.ts` — both verify signatures and no-op (return 200) when the relevant secret is a placeholder; otherwise update booking/operator records on the relevant events.

## Verified end-to-end (fresh dev server, no intervening edits)
1. `POST /api/booking/create` → returns `{ success: true, bookingRef: "LGA-2026-50978", booking: {...} }` with correct 12%/88% math.
2. `GET /book/mahale-chimpanzee-trek-5-days/confirmed?ref=LGA-2026-50978` → 200, page contains "Tanzania Adventure", "Download Booking PDF", "Add to Google Calendar", "What Happens Next", and the booking ref.
3. `GET /api/booking/pdf/LGA-2026-50978` → 200, `file` confirms a real `PDF document, version 1.3`.
4. `GET /api/booking/calendar/LGA-2026-50978` → 200, valid `.ics` with correct `VEVENT`.
5. `/book/[tourSlug]/dates`, `/details`, `/payment` all return 200.
6. `npx tsc --noEmit` and `npm run build` both clean.

## Ready for Phase 4
Operator portal (managing tours/availability/bookings, Stripe Connect onboarding via `createConnectAccountLink`) and admin dashboard build on the booking, payment, and email infrastructure now in place.

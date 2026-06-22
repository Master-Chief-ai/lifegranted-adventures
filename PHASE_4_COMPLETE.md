# Phase 4 — Operator Portal: Complete

## Status
`npm run build` passes with zero errors. `npx tsc --noEmit` is clean. All portal routes render with mock data, the tour editor auto-saves, and the booking details slide-over opens and can mark bookings completed.

## Structure note
`/portal` routes are split into a route group: `app/portal/(gated)/*` holds every page that requires an approved operator (dashboard, tours, availability, bookings, payouts, reviews, profile) and is wrapped by `app/portal/(gated)/layout.tsx`, which fetches the current operator and redirects to `/portal/pending` if `status === 'pending'`. `app/portal/pending/page.tsx` and `app/portal/stripe-callback/page.tsx` sit outside that group specifically to avoid a redirect loop (a gated layout wrapping the pending page would redirect to itself forever).

## Mock "logged in operator"
`lib/operator-auth.ts` exports `getCurrentOperator()`, which resolves the real operator from Supabase when configured, and otherwise returns `MOCK_OPERATORS[0]` (Namiri Tours Mwanza) so the entire portal is explorable without real auth — consistent with how `/account` worked in Phase 2.

## Pages built
- **Layout & sidebar** (`PortalSidebar.tsx`) — dark sidebar with icon nav, active-state styling, operator name/city, view-listing and sign-out links; collapses to a hamburger drawer on mobile.
- **Dashboard** (`/portal`) — stats cards (bookings, revenue, rating, pending payout), two recharts (`DashboardCharts.tsx`: bookings-by-month bar chart, revenue-by-tour horizontal bar chart), recent bookings table, recent reviews, conditional alerts (Stripe not connected / TTB expiring / unanswered reviews), and quick-action buttons.
- **Tours** (`/portal/tours`, `/new`, `/[id]/edit`) — list with filter tabs and a 9-section `TourForm.tsx` (basic info, pricing, description/highlights, itinerary builder, inclusions/exclusions with smart suggestion chips, add-ons, photo upload with data-URL preview and HERO badge, SEO with live Google preview, cancellation policy). Auto-saves to `localStorage` every 30s with a live "last saved Xs ago" indicator; validates required fields and a 5-photo minimum before allowing "Save & Activate."
- **Availability** (`/portal/availability`) — `AvailabilityManager.tsx`: per-tour monthly calendar with seeded mock availability, a date-click slide-over editor (slots/price override/close/clear), and a bulk-select mode with batch apply/close actions.
- **Bookings** (`/portal/bookings`) — `BookingsInbox.tsx` with filter tabs + counts, search, sort, and a `BookingDetailsPanel.tsx` slide-over (Details/Guest Info/Financials tabs, WhatsApp/email links, Mark as Completed with confirmation, PDF download, pre-filled WhatsApp pre-departure message).
- **Payouts** (`/portal/payouts`) — summary cards, `StripeConnectCard.tsx` (mocked connect flow), payout history table, `ExportCsvButton.tsx` (real client-side CSV generation/download), policy note.
- **Reviews** (`/portal/reviews`) — `ReviewsManager.tsx`: sort/filter, inline response composer with character counter and tone tip, rating distribution bars, response-rate metric (color-coded by threshold).
- **Profile** (`/portal/profile`) — `OperatorProfileForm.tsx`: two-column edit form + live preview card that updates as you type; logo/cover upload (data-URL mock), certifications list, Stripe status read-only link.
- **Operator onboarding** (`/operator/register`) — rebuilt as a 5-step client-side wizard (`OnboardingProgress.tsx` + step components in the same file): Business Info → Payout Setup (mocked Stripe connect) → First Tour (optional) → Review & Submit → Submitted (animated checkmark, status timeline).
- **`/portal/pending`** — waiting-for-approval page with status timeline and WhatsApp support link.
- **`/portal/stripe-callback`** — reads `?account_id=`/`?error=`, updates the operator record when Supabase is configured, shows success/error state.

## API routes
`operator/tours` (GET/POST), `operator/tours/[id]` (GET/PUT/DELETE — soft-delete via `is_active: false`), `operator/availability` (batch upsert), `operator/bookings` (GET with status/search filters), `operator/complete-booking` (POST), `operator/profile` (GET/PUT), `stripe/connect/create`, `stripe/connect/balance`, `notifications/new-operator` — all Supabase-first with mock-success fallback, matching the pattern from Phases 2–3.

## Data layer additions
`lib/supabase/queries.ts`: `getOperatorTours`, `getOperatorTourById`, `getOperatorBookings`, `getOperatorReviews`. `lib/tour-form-types.ts`: `TourFormState`, `emptyTourForm`, `tourToFormState`, inclusion/exclusion suggestion maps.

## Verified
- `npx tsc --noEmit` and `npm run build` — both clean (71 routes generated).
- Every required route returns 200: `/operator/register`, `/portal`, `/portal/tours`, `/portal/tours/new`, `/portal/tours/[id]/edit`, `/portal/availability`, `/portal/bookings`, `/portal/payouts`, `/portal/reviews`, `/portal/profile`, `/portal/pending`.
- `POST /api/operator/tours` → returns a mock tour with generated slug.
- `POST /api/operator/complete-booking` → returns `booking_status: "completed"`.
- `POST /api/operator/availability` → confirms batch upsert count.
- Dashboard, tours list, bookings inbox, payouts, and reviews pages all render their key headings/content with no console errors in the dev log.

## Ready for Phase 5
Admin dashboard (operator approval queue, dispute resolution, platform-wide analytics) and final production polish build on the operator data model, booking lifecycle, and payout logic now in place.

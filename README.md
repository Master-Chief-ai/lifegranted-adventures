# LifeGranted Adventures — Tanzania Safari Marketplace

Tanzania's premier two-sided safari marketplace connecting tourists with vetted local tour operators. Specialising in Western Tanzania (Mahale Mountains, Katavi, Rubondo Island, Gombe Stream).

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe Connect (cards) + Flutterwave (M-Pesa)
- **Styling**: Tailwind CSS + Radix UI
- **Images**: Cloudinary
- **Email**: Resend + React Email
- **PDF**: @react-pdf/renderer
- **Charts**: Recharts
- **Deployment**: Vercel

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your values
3. Run `npm install`
4. Run `npm run dev`
5. Visit http://localhost:3000

The platform runs fully on mock data when Supabase/Stripe/Flutterwave/Cloudinary/Resend keys are placeholders — every page, the full booking flow, the operator portal, and the admin panel are explorable with zero real accounts connected.

## Database Setup

Run these SQL files in your Supabase SQL Editor (in order):

1. `supabase/migrations/001_extensions_enums.sql`
2. `supabase/migrations/002_core_tables.sql`
3. `supabase/migrations/003_rls_policies.sql`
4. `supabase/migrations/004_functions_triggers.sql`
5. `supabase/migrations/005_indexes.sql`
6. `supabase/migrations/006_seed_data.sql`

## Deployment

1. Push code to GitHub
2. Import the repository in the Vercel dashboard
3. Add all environment variables from `.env.example`
4. Deploy

`vercel.json` configures two daily cron jobs (pre-departure emails and review requests) — these run automatically once deployed to Vercel.

## Platform Architecture

- `/` — Tourist-facing marketplace (public)
- `/tours` — Tour listing with filters
- `/book/[tourSlug]` — 4-step booking flow
- `/account` — Tourist dashboard (authenticated)
- `/portal` — Operator portal (operator role)
- `/admin` — Admin panel (admin role)
- `/api` — REST API routes

## Commission Structure

- Platform takes 12% of each booking
- Operator receives 88% via automatic Stripe Connect transfer
- Payouts released within 3 business days of tour completion

Built with ❤️ in Mwanza, Tanzania 🇹🇿

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'tourist',
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  nationality TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- operators table
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  location TEXT,
  city TEXT,
  regions TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  tato_member BOOLEAN DEFAULT false,
  ttb_licensed BOOLEAN DEFAULT false,
  ttb_licence_number TEXT,
  ttb_expiry DATE,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  flutterwave_subaccount_id TEXT,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  status operator_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tours table
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tour_type TEXT NOT NULL DEFAULT 'safari',
  regions TEXT[] DEFAULT '{}',
  duration_days INT NOT NULL DEFAULT 1,
  duration_nights INT NOT NULL DEFAULT 0,
  min_group INT NOT NULL DEFAULT 1,
  max_group INT NOT NULL DEFAULT 12,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_tzs NUMERIC(12,0),
  difficulty TEXT DEFAULT 'moderate',
  highlights TEXT[] DEFAULT '{}',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  itinerary JSONB DEFAULT '[]',
  addons JSONB DEFAULT '[]',
  cancellation_policy TEXT,
  languages TEXT[] DEFAULT '{en}',
  images JSONB DEFAULT '[]',
  is_instant_book BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- availability table
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  slots_total INT NOT NULL DEFAULT 12,
  slots_remaining INT NOT NULL DEFAULT 12,
  price_override_usd NUMERIC(10,2),
  UNIQUE(tour_id, available_date)
);

-- bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref TEXT UNIQUE NOT NULL,
  tour_id UUID NOT NULL REFERENCES tours(id),
  operator_id UUID NOT NULL REFERENCES operators(id),
  tourist_id UUID REFERENCES profiles(id),
  tourist_name TEXT NOT NULL,
  tourist_email TEXT NOT NULL,
  tourist_phone TEXT,
  tourist_whatsapp TEXT,
  tourist_nationality TEXT,
  group_size INT NOT NULL DEFAULT 1,
  travel_date DATE NOT NULL,
  special_requests TEXT,
  dietary_requirements TEXT,
  medical_notes TEXT,
  addons JSONB DEFAULT '[]',
  total_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  operator_payout_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'card',
  booking_status booking_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  flutterwave_tx_ref TEXT,
  payout_released BOOLEAN DEFAULT false,
  payout_released_at TIMESTAMPTZ,
  tour_completed_at TIMESTAMPTZ,
  review_reminder_sent BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'platform',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  tour_id UUID NOT NULL REFERENCES tours(id),
  operator_id UUID NOT NULL REFERENCES operators(id),
  tourist_id UUID REFERENCES profiles(id),
  tourist_name TEXT NOT NULL,
  tourist_country TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  photos JSONB DEFAULT '[]',
  operator_response TEXT,
  operator_responded_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  raised_by_id UUID REFERENCES profiles(id),
  raised_by_role TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by_id UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tourist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tourist_id, tour_id)
);

-- blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  author TEXT DEFAULT 'LifeGranted Adventures Team',
  category TEXT DEFAULT 'guides',
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'newsletter',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE operator_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('tourist', 'operator', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

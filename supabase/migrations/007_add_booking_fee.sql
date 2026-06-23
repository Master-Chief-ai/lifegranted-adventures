ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_fee_usd NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS charged_to_tourist_usd NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN bookings.booking_fee_usd IS 'Flutterwave processing fee paid by tourist';
COMMENT ON COLUMN bookings.charged_to_tourist_usd IS 'Total amount charged to tourist including booking fee';

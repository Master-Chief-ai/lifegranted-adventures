-- Add new columns to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guarantee_fund_contribution NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_operating_revenue NUMERIC(10,2) DEFAULT 0;

-- Update trigger for new rates
CREATE OR REPLACE FUNCTION calculate_booking_fees()
RETURNS TRIGGER AS $$
BEGIN
  NEW.platform_fee_usd := ROUND(NEW.total_usd * 0.15, 2);
  NEW.guarantee_fund_contribution := ROUND(NEW.total_usd * 0.03, 2);
  NEW.platform_operating_revenue := ROUND(NEW.total_usd * 0.12, 2);
  NEW.operator_payout_usd := ROUND(NEW.total_usd * 0.85, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add operator security deposit columns
ALTER TABLE operators
  ADD COLUMN IF NOT EXISTS security_deposit_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS security_deposit_amount NUMERIC(10,2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS security_deposit_balance NUMERIC(10,2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS security_deposit_paid_at TIMESTAMPTZ;

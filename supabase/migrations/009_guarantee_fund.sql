CREATE TABLE IF NOT EXISTS guarantee_fund_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'contribution',
      'payout_tourist',
      'recovery',
      'adjustment'
    )
  ),
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guarantee_fund_balance (
  id INT PRIMARY KEY DEFAULT 1,
  current_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_contributed NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_paid_out NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_recovered NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO guarantee_fund_balance (id, current_balance)
VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION update_guarantee_fund_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'contribution' THEN
    UPDATE guarantee_fund_balance SET
      current_balance = current_balance + NEW.amount,
      total_contributed = total_contributed + NEW.amount,
      updated_at = NOW()
    WHERE id = 1;
  ELSIF NEW.transaction_type = 'payout_tourist' THEN
    UPDATE guarantee_fund_balance SET
      current_balance = current_balance - NEW.amount,
      total_paid_out = total_paid_out + NEW.amount,
      updated_at = NOW()
    WHERE id = 1;
  ELSIF NEW.transaction_type = 'recovery' THEN
    UPDATE guarantee_fund_balance SET
      current_balance = current_balance + NEW.amount,
      total_recovered = total_recovered + NEW.amount,
      updated_at = NOW()
    WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fund_balance_trigger ON guarantee_fund_transactions;
CREATE TRIGGER update_fund_balance_trigger
  AFTER INSERT ON guarantee_fund_transactions
  FOR EACH ROW EXECUTE FUNCTION update_guarantee_fund_balance();

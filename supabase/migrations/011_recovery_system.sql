CREATE TYPE recovery_status AS ENUM (
  'notice_sent',
  'acknowledged',
  'appealing',
  'appeal_upheld',
  'appeal_rejected',
  'recovery_scheduled',
  'partially_recovered',
  'fully_recovered',
  'written_off',
  'security_deposit_used'
);

CREATE TABLE IF NOT EXISTS recovery_notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_code TEXT UNIQUE NOT NULL DEFAULT '',
  refund_request_id UUID NOT NULL REFERENCES refund_requests(id),
  operator_id UUID NOT NULL REFERENCES operators(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),

  total_recovery_amount NUMERIC(10,2) NOT NULL,
  security_deposit_applied NUMERIC(10,2) DEFAULT 0,
  remaining_to_recover NUMERIC(10,2) NOT NULL,
  total_recovered_so_far NUMERIC(10,2) DEFAULT 0,

  status recovery_status NOT NULL DEFAULT 'notice_sent',

  notice_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  operator_acknowledged_at TIMESTAMPTZ,

  appeal_deadline TIMESTAMPTZ NOT NULL,
  appeal_submitted_at TIMESTAMPTZ,
  appeal_statement TEXT,
  appeal_evidence JSONB DEFAULT '[]',
  appeal_decision TEXT,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES profiles(id),

  recovery_schedule JSONB DEFAULT '[]',

  created_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS recovery_ref_seq START 1000;

CREATE OR REPLACE FUNCTION generate_recovery_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := 'RCV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
      LPAD(nextval('recovery_ref_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_recovery_ref ON recovery_notices;
CREATE TRIGGER set_recovery_ref
  BEFORE INSERT ON recovery_notices
  FOR EACH ROW EXECUTE FUNCTION generate_recovery_ref();

CREATE TABLE IF NOT EXISTS recovery_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recovery_notice_id UUID NOT NULL REFERENCES recovery_notices(id),
  booking_id UUID REFERENCES bookings(id),
  amount_deducted NUMERIC(10,2) NOT NULL,
  deducted_from_payout_booking_ref TEXT,
  deducted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- RLS
ALTER TABLE recovery_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_deductions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operators_view_own_recovery" ON recovery_notices;
CREATE POLICY "operators_view_own_recovery" ON recovery_notices
  FOR SELECT USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "operators_view_own_deductions" ON recovery_deductions;
CREATE POLICY "operators_view_own_deductions" ON recovery_deductions
  FOR SELECT USING (
    recovery_notice_id IN (
      SELECT id FROM recovery_notices
      WHERE operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    )
  );

CREATE TYPE IF NOT EXISTS refund_status AS ENUM (
  'submitted',
  'operator_notified',
  'under_review',
  'approved_full',
  'approved_partial',
  'rejected',
  'paid',
  'recovery_initiated',
  'recovery_complete',
  'closed'
);

CREATE TYPE IF NOT EXISTS refund_reason AS ENUM (
  'operator_cancelled',
  'tour_not_as_described',
  'quality_failure',
  'operator_no_show',
  'force_majeure',
  'tourist_cancelled_30_plus',
  'tourist_cancelled_15_29',
  'tourist_cancelled_under_14',
  'other'
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_code TEXT UNIQUE NOT NULL DEFAULT '',
  booking_id UUID NOT NULL REFERENCES bookings(id),
  tourist_id UUID REFERENCES profiles(id),
  operator_id UUID NOT NULL REFERENCES operators(id),

  reason_category refund_reason NOT NULL,
  reason_detail TEXT NOT NULL,
  tourist_evidence JSONB DEFAULT '[]',
  tourist_submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  operator_response TEXT,
  operator_evidence JSONB DEFAULT '[]',
  operator_response_deadline TIMESTAMPTZ,
  operator_responded_at TIMESTAMPTZ,
  operator_notified_at TIMESTAMPTZ,

  policy_eligible_refund_pct NUMERIC(5,2),
  policy_eligible_refund_usd NUMERIC(10,2),
  policy_tier TEXT,

  status refund_status NOT NULL DEFAULT 'submitted',
  admin_decision TEXT,
  admin_decision_notes TEXT,
  approved_refund_amount NUMERIC(10,2) DEFAULT 0,
  admin_id UUID REFERENCES profiles(id),
  decision_made_at TIMESTAMPTZ,

  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS refund_ref_seq START 1000;

CREATE OR REPLACE FUNCTION generate_refund_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := 'RFD-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
      LPAD(nextval('refund_ref_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_refund_ref ON refund_requests;
CREATE TRIGGER set_refund_ref
  BEFORE INSERT ON refund_requests
  FOR EACH ROW EXECUTE FUNCTION generate_refund_ref();

CREATE OR REPLACE FUNCTION calculate_refund_eligibility(
  p_booking_id UUID,
  p_reason TEXT
)
RETURNS TABLE(eligible_pct NUMERIC, eligible_usd NUMERIC, tier TEXT) AS $$
DECLARE
  b RECORD;
  days_until_travel INT;
BEGIN
  SELECT * INTO b FROM bookings WHERE id = p_booking_id;
  days_until_travel := (b.travel_date::DATE - CURRENT_DATE)::INT;

  IF p_reason = 'operator_cancelled' OR p_reason = 'operator_no_show' THEN
    RETURN QUERY SELECT 100.0::NUMERIC, b.total_usd, 'Operator fault — full refund'::TEXT;
  ELSIF p_reason = 'force_majeure' THEN
    RETURN QUERY SELECT 80.0::NUMERIC, ROUND(b.total_usd * 0.8, 2), 'Force majeure — 80% refund'::TEXT;
  ELSIF p_reason IN ('tour_not_as_described', 'quality_failure') THEN
    RETURN QUERY SELECT 0.0::NUMERIC, 0.0::NUMERIC, 'Quality dispute — admin determines'::TEXT;
  ELSIF p_reason = 'tourist_cancelled_30_plus' AND days_until_travel >= 30 THEN
    RETURN QUERY SELECT 100.0::NUMERIC, b.total_usd, '30+ days notice — full refund'::TEXT;
  ELSIF p_reason = 'tourist_cancelled_15_29' AND days_until_travel BETWEEN 15 AND 29 THEN
    RETURN QUERY SELECT 50.0::NUMERIC, ROUND(b.total_usd * 0.5, 2), '15-29 days notice — 50% refund'::TEXT;
  ELSE
    RETURN QUERY SELECT 0.0::NUMERIC, 0.0::NUMERIC, 'Under 14 days or policy ineligible — no refund'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tourists_view_own_refunds" ON refund_requests;
CREATE POLICY "tourists_view_own_refunds" ON refund_requests
  FOR SELECT USING (tourist_id = auth.uid());

DROP POLICY IF EXISTS "operators_view_own_refunds" ON refund_requests;
CREATE POLICY "operators_view_own_refunds" ON refund_requests
  FOR SELECT USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tourists_insert_refunds" ON refund_requests;
CREATE POLICY "tourists_insert_refunds" ON refund_requests
  FOR INSERT WITH CHECK (tourist_id = auth.uid());

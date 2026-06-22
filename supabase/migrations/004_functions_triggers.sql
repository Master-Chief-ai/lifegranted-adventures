-- Booking reference sequence
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1000;

-- Auto-generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref := 'LGA-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('booking_ref_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_ref
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL OR NEW.booking_ref = '')
  EXECUTE FUNCTION generate_booking_ref();

-- Auto-calculate platform fees
CREATE OR REPLACE FUNCTION calculate_booking_fees()
RETURNS TRIGGER AS $$
BEGIN
  NEW.platform_fee_usd := ROUND(NEW.total_usd * 0.12, 2);
  NEW.operator_payout_usd := ROUND(NEW.total_usd * 0.88, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calc_booking_fees
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_fees();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (NEW.id, 'tourist', NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update tour rating after review
CREATE OR REPLACE FUNCTION update_tour_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tours SET
    avg_rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE tour_id = NEW.tour_id AND is_published = true),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE tour_id = NEW.tour_id AND is_published = true)
  WHERE id = NEW.tour_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tour_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tour_rating();

-- Update operator rating after tour rating changes
CREATE OR REPLACE FUNCTION update_operator_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE operators SET
    avg_rating = (SELECT AVG(avg_rating)::NUMERIC(3,2) FROM tours WHERE operator_id = NEW.operator_id AND is_active = true AND total_reviews > 0),
    total_reviews = (SELECT SUM(total_reviews) FROM tours WHERE operator_id = NEW.operator_id)
  WHERE id = NEW.operator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_operator_rating_trigger
  AFTER UPDATE OF avg_rating ON tours
  FOR EACH ROW EXECUTE FUNCTION update_operator_rating();

-- Decrement availability on booking confirmation
CREATE OR REPLACE FUNCTION decrement_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    UPDATE availability
    SET slots_remaining = GREATEST(0, slots_remaining - NEW.group_size)
    WHERE tour_id = NEW.tour_id AND available_date = NEW.travel_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_availability_on_booking
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION decrement_availability();

CREATE INDEX IF NOT EXISTS idx_tours_operator ON tours(operator_id);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_type ON tours(tour_type);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_rating ON tours(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_tours_regions ON tours USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_tours_fts ON tours USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_operator ON bookings(operator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tourist ON bookings(tourist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);

CREATE INDEX IF NOT EXISTS idx_operators_slug ON operators(slug);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);
CREATE INDEX IF NOT EXISTS idx_operators_user ON operators(user_id);
CREATE INDEX IF NOT EXISTS idx_operators_rating ON operators(avg_rating DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_operator ON reviews(operator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);

CREATE INDEX IF NOT EXISTS idx_availability_tour_date ON availability(tour_id, available_date);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Operators policies
CREATE POLICY "Approved operators are public" ON operators FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Operators can insert own record" ON operators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Operators can update own record" ON operators FOR UPDATE USING (auth.uid() = user_id);

-- Tours policies
CREATE POLICY "Active tours of approved operators are public" ON tours FOR SELECT USING (is_active = true);
CREATE POLICY "Operators can manage own tours" ON tours FOR ALL USING (
  operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
);

-- Availability policies
CREATE POLICY "Availability is public" ON availability FOR SELECT USING (true);
CREATE POLICY "Operators manage own availability" ON availability FOR ALL USING (
  tour_id IN (SELECT t.id FROM tours t JOIN operators o ON t.operator_id = o.id WHERE o.user_id = auth.uid())
);

-- Bookings policies
CREATE POLICY "Tourists see own bookings" ON bookings FOR SELECT USING (tourist_id = auth.uid());
CREATE POLICY "Operators see their tour bookings" ON bookings FOR SELECT USING (
  operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can create a booking" ON bookings FOR INSERT WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Published reviews are public" ON reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Tourists can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = tourist_id);
CREATE POLICY "Operators can respond to reviews" ON reviews FOR UPDATE USING (
  operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
);

-- Wishlist policies
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (tourist_id = auth.uid());

-- Blog policies
CREATE POLICY "Published posts are public" ON blog_posts FOR SELECT USING (is_published = true);

-- Settings are public read
CREATE POLICY "Settings are public" ON settings FOR SELECT USING (true);

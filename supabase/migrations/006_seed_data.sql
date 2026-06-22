-- Default platform settings
INSERT INTO settings (key, value) VALUES
  ('commission_rate', '0.12'),
  ('founding_operator_rate', '0.08'),
  ('platform_name', 'LifeGranted Adventures'),
  ('support_whatsapp', '+255000000000'),
  ('support_email', 'hello@lifegrantedadventures.co.tz')
ON CONFLICT (key) DO NOTHING;

-- NOTE: Full seed data with operators, tours, and reviews
-- will be inserted after auth users are created.
-- See README.md for seeding instructions.

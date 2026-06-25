-- Sample reviews for the homepage testimonials section.
-- Picks 3 existing tours (and their operators) from your database and attaches
-- one realistic review to each. Run in the Supabase SQL Editor.
--
-- Requires at least 1 row in `tours` already (run supabase/migrations/006_seed_data.sql
-- and insert your real tours/operators first if you haven't yet — this script does not
-- create tours, it only attaches reviews to tours that already exist).

WITH target_tours AS (
  SELECT id AS tour_id, operator_id
  FROM tours
  ORDER BY created_at
  LIMIT 3
),
numbered AS (
  SELECT tour_id, operator_id, row_number() OVER () AS rn
  FROM target_tours
)
INSERT INTO reviews (
  tour_id, operator_id, tourist_name, tourist_country, rating, title, body, is_verified, is_published
)
SELECT
  tour_id,
  operator_id,
  CASE rn
    WHEN 1 THEN 'Emily Carter'
    WHEN 2 THEN 'Marco Bianchi'
    WHEN 3 THEN 'Aiko Tanaka'
  END,
  CASE rn
    WHEN 1 THEN 'US'
    WHEN 2 THEN 'IT'
    WHEN 3 THEN 'JP'
  END,
  5,
  CASE rn
    WHEN 1 THEN 'Trip of a lifetime'
    WHEN 2 THEN 'Esperienza incredibile'
    WHEN 3 THEN 'Unforgettable safari'
  END,
  CASE rn
    WHEN 1 THEN 'We saw the Big Five within the first two days and our guide''s knowledge of animal behaviour was incredible. Every camp we stayed at felt safe, comfortable, and genuinely welcoming. LifeGranted Adventures made the whole booking process effortless compared to other operators we contacted in Tanzania.'
    WHEN 2 THEN 'Un viaggio organizzato alla perfezione. La nostra guida ci ha mostrato leoni, elefanti e una vista incredibile della migrazione degli gnu. Lo staff ha risposto a ogni domanda su WhatsApp anche prima di partire. Consiglio vivamente questo operatore per chi visita la Tanzania per la prima volta.'
    WHEN 3 THEN 'This was my first time in Africa and the team made everything so easy, from airport pickup to the final night at camp. The sunrise game drive over the savanna is something I will never forget. Highly recommend for solo travellers — I felt safe the entire trip.'
  END,
  true,
  true
FROM numbered;

-- Confirm 3 rows were inserted:
SELECT id, tourist_name, tourist_country, rating, title, created_at
FROM reviews
WHERE tourist_name IN ('Emily Carter', 'Marco Bianchi', 'Aiko Tanaka')
ORDER BY created_at DESC
LIMIT 3;

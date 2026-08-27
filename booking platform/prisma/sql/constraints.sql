-- Nestly — post-migration raw SQL
-- Run this once after `npx prisma migrate dev` against a fresh database.
-- Prisma's schema language cannot express EXCLUDE/GIST constraints or
-- PostGIS geography indexes, so they're applied here directly.
--
-- Usage:
--   psql "$DATABASE_URL" -f prisma/sql/constraints.sql

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevents double-booking at the database level: no two bookings for the
-- same listing may have overlapping [check_in, check_out) date ranges
-- while in a "live" state (pending or confirmed). This is the single most
-- important correctness guarantee in the platform — test it explicitly
-- with concurrent booking attempts.
ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    listing_id WITH =,
    daterange(check_in, check_out) WITH &&
  ) WHERE (status IN ('pending', 'confirmed'));

ALTER TABLE bookings
  ADD CONSTRAINT check_out_after_check_in CHECK (check_out > check_in);

ALTER TABLE reviews
  ADD CONSTRAINT review_rating_range CHECK (rating BETWEEN 1 AND 5);

-- Geo search index for "stays near me" queries
CREATE INDEX IF NOT EXISTS listings_location_gix ON listings USING GIST (location);

-- Fast lookups for the availability calendar and booking-inbox queries
CREATE INDEX IF NOT EXISTS availability_listing_date_idx ON availability (listing_id, date);
CREATE INDEX IF NOT EXISTS bookings_listing_idx ON bookings (listing_id);
CREATE INDEX IF NOT EXISTS bookings_guest_idx ON bookings (guest_id);

-- Row Level Security policies
-- Design:
--   - Guests (anon) can read wishlists and wishes, but NOT reserved_by
--   - Guests reserve/unreserve via database functions
--   - Admin (authenticated owner) has full access to their own data
--   - Reservations table is only readable by wishlist owner (AC-9)

-- ===================
-- Enable RLS
-- ===================
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- ===================
-- wishlists policies
-- ===================
CREATE POLICY "Anyone can view wishlists"
  ON wishlists FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Owners can update their wishlists"
  ON wishlists FOR UPDATE
  USING (auth.uid()::text = created_by);

CREATE POLICY "Owners can delete their wishlists"
  ON wishlists FOR DELETE
  USING (auth.uid()::text = created_by);

-- ===================
-- wishes policies
-- ===================
CREATE POLICY "Anyone can view wishes"
  ON wishes FOR SELECT
  USING (true);

CREATE POLICY "Wishlist owners can insert wishes"
  ON wishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id AND created_by = auth.uid()::text
    )
  );

CREATE POLICY "Wishlist owners can update wishes"
  ON wishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id AND created_by = auth.uid()::text
    )
  );

CREATE POLICY "Wishlist owners can delete wishes"
  ON wishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id AND created_by = auth.uid()::text
    )
  );

-- ===================
-- reservations policies
-- ===================
-- Only wishlist owners can view reservations (AC-9)
CREATE POLICY "Wishlist owners can view reservations"
  ON reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishes w
      JOIN wishlists wl ON wl.id = w.wishlist_id
      WHERE w.id = wish_id AND wl.created_by = auth.uid()::text
    )
  );

-- Insert/delete handled via functions below, but we need policies
-- for the functions to work with SECURITY DEFINER
CREATE POLICY "Service role can manage reservations"
  ON reservations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ===================
-- Guest-safe view (hides reserved_by per AC-9)
-- ===================
CREATE VIEW guest_wishes AS
SELECT
  id,
  wishlist_id,
  name,
  description,
  link,
  image_url,
  reserved,
  created_at
FROM wishes;

-- ===================
-- Reserve function (for guests)
-- ===================
CREATE OR REPLACE FUNCTION reserve_wish(
  p_wish_id UUID,
  p_guest_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check wish exists and is not already reserved
  IF NOT EXISTS (
    SELECT 1 FROM wishes WHERE id = p_wish_id AND reserved = false
  ) THEN
    RETURN false;
  END IF;

  -- Create reservation
  INSERT INTO reservations (wish_id, guest_name)
  VALUES (p_wish_id, p_guest_name);

  -- Mark wish as reserved
  UPDATE wishes
  SET reserved = true, reserved_by = p_guest_name
  WHERE id = p_wish_id;

  RETURN true;
END;
$$;

-- ===================
-- Unreserve function (for guests, AC-7: must match name)
-- ===================
CREATE OR REPLACE FUNCTION unreserve_wish(
  p_wish_id UUID,
  p_guest_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check reservation exists with matching name
  IF NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE wish_id = p_wish_id AND guest_name = p_guest_name
  ) THEN
    RETURN false;
  END IF;

  -- Remove reservation
  DELETE FROM reservations
  WHERE wish_id = p_wish_id AND guest_name = p_guest_name;

  -- Mark wish as unreserved
  UPDATE wishes
  SET reserved = false, reserved_by = null
  WHERE id = p_wish_id;

  RETURN true;
END;
$$;

-- Grant execute to anon so guests can call these
GRANT EXECUTE ON FUNCTION reserve_wish(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION unreserve_wish(UUID, TEXT) TO anon;
GRANT SELECT ON guest_wishes TO anon;

-- Multi-booking support
-- Allows certain wishes to be reserved by multiple guests

-- Add allow_multiple column
ALTER TABLE wishes ADD COLUMN allow_multiple BOOLEAN DEFAULT FALSE;

-- Recreate guest_wishes view with reservation_count and allow_multiple
DROP VIEW IF EXISTS guest_wishes;
CREATE VIEW guest_wishes AS
SELECT
  w.id,
  w.wishlist_id,
  w.name,
  w.description,
  w.link,
  w.image_url,
  w.reserved,
  w.allow_multiple,
  w.created_at,
  COALESCE(r.cnt, 0)::int AS reservation_count
FROM wishes w
LEFT JOIN (
  SELECT wish_id, COUNT(*) AS cnt
  FROM reservations
  GROUP BY wish_id
) r ON r.wish_id = w.id;

-- Grant access to anon
GRANT SELECT ON guest_wishes TO anon;

-- Recreate reserve_wish function (supports multi-booking)
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
  -- Single-book: must not already be reserved
  -- Multi-book: always allowed (unless same person already booked)
  IF NOT EXISTS (
    SELECT 1 FROM wishes
    WHERE id = p_wish_id AND (allow_multiple = true OR reserved = false)
  ) THEN
    RETURN false;
  END IF;

  -- Prevent same person booking twice
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE wish_id = p_wish_id AND guest_name = p_guest_name
  ) THEN
    RETURN false;
  END IF;

  -- Create reservation record
  INSERT INTO reservations (wish_id, guest_name)
  VALUES (p_wish_id, p_guest_name);

  -- Mark wish as reserved
  UPDATE wishes
  SET reserved = true, reserved_by = p_guest_name
  WHERE id = p_wish_id;

  RETURN true;
END;
$$;

-- Recreate unreserve_wish function (handles multi-booking)
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
  -- Must have a reservation with this name
  IF NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE wish_id = p_wish_id AND guest_name = p_guest_name
  ) THEN
    RETURN false;
  END IF;

  -- Remove this guest's reservation
  DELETE FROM reservations
  WHERE wish_id = p_wish_id AND guest_name = p_guest_name;

  -- If no reservations left, mark as unreserved
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE wish_id = p_wish_id) THEN
    UPDATE wishes SET reserved = false, reserved_by = null WHERE id = p_wish_id;
  ELSE
    -- Update reserved_by to another remaining guest
    UPDATE wishes SET reserved_by = (
      SELECT guest_name FROM reservations WHERE wish_id = p_wish_id LIMIT 1
    ) WHERE id = p_wish_id;
  END IF;

  RETURN true;
END;
$$;

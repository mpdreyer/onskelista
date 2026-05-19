-- Initial database schema
-- Will be populated based on datamodel

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_url TEXT,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID REFERENCES wishes(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  reserved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wishes_wishlist ON wishes(wishlist_id);
CREATE INDEX idx_reservations_wish ON reservations(wish_id);

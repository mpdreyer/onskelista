export interface WishList {
  id: string;
  name: string;
  description: string | null;
  url: string;
  created_by: string;
  created_at: string;
}

export interface GuestWish {
  id: string;
  wishlist_id: string;
  name: string;
  description: string | null;
  link: string | null;
  image_url: string | null;
  reserved: boolean;
  created_at: string;
}

export interface AdminWish extends GuestWish {
  reserved_by: string | null;
}

export interface Reservation {
  id: string;
  wish_id: string;
  guest_name: string;
  reserved_at: string;
}

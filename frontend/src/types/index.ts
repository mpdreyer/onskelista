// TypeScript type definitions
export interface WishList {
  id: string;
  name: string;
  description: string;
  url: string;
  createdBy: string;
}

export interface Wish {
  id: string;
  wishListId: string;
  name: string;
  description: string;
  link?: string;
  imageURL?: string;
  reserved: boolean;
  reservedBy?: string;
}

export interface Reservation {
  id: string;
  wishId: string;
  guestName: string;
  reservedAt: string;
}

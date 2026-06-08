# Multi-bokning & synliga reservationer

## Bakgrund

När en gäst reserverar ("paxar") en artikel i önskelistan markeras den som bokad. Två problem:
1. Reserverade artiklar kan upplevas som "försvunna" — de ska ligga kvar men visas som bokade.
2. Vissa artiklar (t.ex. "blommor", "choklad") bör kunna bokas av flera gäster samtidigt.

## Lösning

Enkel toggle `allow_multiple` på wish-nivå. Admin sätter detta per artikel.

---

## Databasändringar

### Ny kolumn

```sql
ALTER TABLE wishes ADD COLUMN allow_multiple BOOLEAN DEFAULT FALSE;
```

### Uppdaterad `guest_wishes` view

Byggs om för att inkludera `allow_multiple` och `reservation_count`:

```sql
CREATE OR REPLACE VIEW guest_wishes AS
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
  COALESCE(r.cnt, 0) AS reservation_count
FROM wishes w
LEFT JOIN (
  SELECT wish_id, COUNT(*) AS cnt
  FROM reservations
  GROUP BY wish_id
) r ON r.wish_id = w.id;
```

### Uppdaterad `reserve_wish()`

```sql
CREATE OR REPLACE FUNCTION reserve_wish(p_wish_id UUID, p_guest_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Om single-book: kräv att den inte redan är reserverad
  IF NOT EXISTS (
    SELECT 1 FROM wishes
    WHERE id = p_wish_id AND (allow_multiple = true OR reserved = false)
  ) THEN
    RETURN false;
  END IF;

  -- Förhindra dubbel-bokning av samma person
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE wish_id = p_wish_id AND guest_name = p_guest_name
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO reservations (wish_id, guest_name) VALUES (p_wish_id, p_guest_name);
  UPDATE wishes SET reserved = true, reserved_by = p_guest_name WHERE id = p_wish_id;
  RETURN true;
END;
$$;
```

### Uppdaterad `unreserve_wish()`

```sql
CREATE OR REPLACE FUNCTION unreserve_wish(p_wish_id UUID, p_guest_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM reservations WHERE wish_id = p_wish_id AND guest_name = p_guest_name
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM reservations WHERE wish_id = p_wish_id AND guest_name = p_guest_name;

  -- Om inga reservationer kvar, markera som ledig
  IF NOT EXISTS (SELECT 1 FROM reservations WHERE wish_id = p_wish_id) THEN
    UPDATE wishes SET reserved = false, reserved_by = null WHERE id = p_wish_id;
  ELSE
    -- Uppdatera reserved_by till en kvarvarande gäst
    UPDATE wishes SET reserved_by = (
      SELECT guest_name FROM reservations WHERE wish_id = p_wish_id LIMIT 1
    ) WHERE id = p_wish_id;
  END IF;

  RETURN true;
END;
$$;
```

---

## Frontend-ändringar

### Typer (`types/index.ts`)

```ts
export interface GuestWish {
  // ... befintliga fält
  allow_multiple: boolean;
  reservation_count: number;
}
```

`AdminWish` ärver via `extends GuestWish` och får fälten automatiskt.

### WishForm (admin)

Ny toggle/checkbox: "Flera kan boka denna" → sätter `allow_multiple`.

### WishCard (gäst-vy)

| Tillstånd | Visning |
|-----------|---------|
| Ej bokad | "Paxa denna"-knapp (som idag) |
| Single-book, bokad | "Paxad"-badge + "Avboka"-knapp |
| Multi-book, bokad | "X har paxat"-badge + "Paxa denna"-knapp + "Avboka"-knapp (om gästen har bokat) |
| Multi-book, ej bokad | "Paxa denna"-knapp + indikation att flera kan boka |

Notera: gäster kan inte se VEM som bokat (privacy via guest_wishes view).

### Admin-vy (`admin/list/[id].tsx`)

- Visa `allow_multiple`-status per artikel
- För multi-book: visa alla reservationer (namn + datum), inte bara en
- `useAdminWishlist` hämtar redan reservations — filtrera per wish_id (kan vara flera)

### Gäst-vy (`list/[url].tsx`)

- `handleReserve`: fungerar som idag (RPC hanterar logiken)
- Visa "Avboka"-knapp bara om gästen har bokat — kräver att vi sparar gästnamn i sessionStorage/localStorage så vi vet vilka artiklar gästen bokat

### Gästnamn i localStorage

För att veta om gästen redan bokat en multi-book-artikel (och visa "Avboka") sparas gästnamnet i `localStorage` under nyckeln `guestName`. Vid bokning sparas även wish-id:n under `reservedWishes` (array). Vid avbokning tas wish-id bort.

---

## Vad som INTE ändras

- RLS-policies (funktionerna kör SECURITY DEFINER)
- Privacy: gäster ser inte `reserved_by`
- Avbokning kräver rätt namn (enforced i unreserve_wish)
- Befintliga artiklar får `allow_multiple = false` (bakåtkompatibelt)

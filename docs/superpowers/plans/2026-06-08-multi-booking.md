# Multi-Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow wishes to be booked by multiple guests simultaneously via an `allow_multiple` toggle, while keeping reserved items visible as "booked".

**Architecture:** Add `allow_multiple` boolean column to wishes. Rewrite `reserve_wish`/`unreserve_wish` SQL functions to handle multi-booking. Rebuild `guest_wishes` view to expose `reservation_count`. Track guest identity in localStorage for unreserve UX.

**Tech Stack:** Supabase (PostgreSQL), Next.js (Pages Router), TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-06-08-multi-booking-design.md`

---

### Task 1: Database migration — add column, update view and functions

**Files:**
- Create: `supabase/migrations/003_multi_booking.sql`

This is the foundation task. All frontend work depends on these schema changes being applied.

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/003_multi_booking.sql` with:

```sql
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

-- Recreate reserve_wish function
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

-- Recreate unreserve_wish function
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
```

- [ ] **Step 2: Apply migration to Supabase**

Run via Supabase dashboard SQL editor or CLI:
```bash
supabase db push
```
Or paste the SQL directly in the Supabase SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_multi_booking.sql
git commit -m "feat: add multi-booking migration — allow_multiple column, updated functions and view"
```

---

### Task 2: Update TypeScript types

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: Add new fields to GuestWish**

In `frontend/src/types/index.ts`, update `GuestWish` to:

```ts
export interface GuestWish {
  id: string;
  wishlist_id: string;
  name: string;
  description: string | null;
  link: string | null;
  image_url: string | null;
  reserved: boolean;
  allow_multiple: boolean;
  reservation_count: number;
  created_at: string;
}
```

`AdminWish` already extends `GuestWish`, so it gets these fields automatically. Add `allow_multiple` to the admin type too since admin reads from `wishes` table directly (not the view):

```ts
export interface AdminWish extends GuestWish {
  reserved_by: string | null;
}
```

No changes needed to `AdminWish` since `allow_multiple` is now on the `wishes` table and `GuestWish` already includes it.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add allow_multiple and reservation_count to GuestWish type"
```

---

### Task 3: Update admin WishForm with toggle

**Files:**
- Modify: `frontend/src/components/WishForm.tsx`

- [ ] **Step 1: Add allow_multiple prop and checkbox**

Update `WishFormProps` to include `initialAllowMultiple` and the submit data to include `allow_multiple`:

```ts
interface WishFormProps {
  initialName?: string
  initialDescription?: string
  initialLink?: string
  initialImageUrl?: string
  initialAllowMultiple?: boolean
  onSubmit: (data: { name: string; description: string; link: string; image_url: string; allow_multiple: boolean }) => Promise<void>
  onCancel?: () => void
  submitLabel: string
}
```

Add state: `const [allowMultiple, setAllowMultiple] = useState(initialAllowMultiple ?? false)`

Add checkbox in the form, after the image URL field:

```tsx
<div className="flex items-center gap-2">
  <input
    id="wish-multi"
    type="checkbox"
    checked={allowMultiple}
    onChange={(e) => setAllowMultiple(e.target.checked)}
    className="h-4 w-4 rounded border-border"
  />
  <label htmlFor="wish-multi" className="text-sm">
    Flera kan boka denna
  </label>
</div>
```

Update `handleSubmit` to pass `allow_multiple: allowMultiple` in the submit data.

Update the reset block (when `!initialName`) to also reset: `setAllowMultiple(false)`.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/WishForm.tsx
git commit -m "feat: add allow_multiple toggle to WishForm"
```

---

### Task 4: Update admin list editor to pass allow_multiple

**Files:**
- Modify: `frontend/src/pages/admin/list/[id].tsx`

- [ ] **Step 1: Update handleAddWish to include allow_multiple**

Change the `data` parameter type in `handleAddWish` to include `allow_multiple: boolean` and pass it in the insert:

```ts
async function handleAddWish(data: { name: string; description: string; link: string; image_url: string; allow_multiple: boolean }) {
  if (!id) return
  const { error } = await supabase.from("wishes").insert({
    wishlist_id: id,
    name: data.name,
    description: data.description || null,
    link: data.link || null,
    image_url: data.image_url || null,
    allow_multiple: data.allow_multiple,
  })
  // ... rest unchanged
}
```

- [ ] **Step 2: Update handleEditWish similarly**

```ts
async function handleEditWish(data: { name: string; description: string; link: string; image_url: string; allow_multiple: boolean }) {
  if (!editingWish) return
  const { error } = await supabase
    .from("wishes")
    .update({
      name: data.name,
      description: data.description || null,
      link: data.link || null,
      image_url: data.image_url || null,
      allow_multiple: data.allow_multiple,
    })
    .eq("id", editingWish.id)
  // ... rest unchanged
}
```

- [ ] **Step 3: Pass initialAllowMultiple to WishForm when editing**

In the edit form render, add the prop:

```tsx
<WishForm
  initialName={wish.name}
  initialDescription={wish.description ?? ""}
  initialLink={wish.link ?? ""}
  initialImageUrl={wish.image_url ?? ""}
  initialAllowMultiple={wish.allow_multiple}
  onSubmit={handleEditWish}
  onCancel={() => setEditingWish(null)}
  submitLabel="Spara"
/>
```

- [ ] **Step 4: Show all reservations for multi-book wishes in admin view**

Replace the single-reservation display block. Change the `getReservation` function to `getReservations` that returns an array:

```ts
function getReservations(wishId: string) {
  return reservations.filter((r) => r.wish_id === wishId)
}
```

Update the reservation display section (around line 213-226) to:

```tsx
{wish.reserved ? (
  <div className="space-y-1">
    {getReservations(wish.id).map((res) => (
      <div key={res.id} className="rounded-md bg-reserved/10 px-3 py-2 text-sm">
        <span className="font-medium text-reserved">Paxad</span>
        {" av "}
        <span className="font-medium">{res.guest_name}</span>
        <span className="text-muted-foreground">
          {" "}&mdash; {new Date(res.reserved_at).toLocaleDateString("sv-SE")}
        </span>
      </div>
    ))}
  </div>
) : (
  <span className="text-sm text-muted-foreground">Ledig</span>
)}
```

Also add a badge next to the wish name if `allow_multiple`:

```tsx
<div className="flex items-start justify-between gap-2">
  <div className="flex items-center gap-2">
    <h3 className="font-medium">{wish.name}</h3>
    {wish.allow_multiple && (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        Flera kan boka
      </span>
    )}
  </div>
  {/* ... edit/delete buttons */}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/list/[id].tsx
git commit -m "feat: admin view supports allow_multiple — toggle, multi-reservation display"
```

---

### Task 5: Update WishCard for multi-booking guest view

**Files:**
- Modify: `frontend/src/components/WishCard.tsx`

- [ ] **Step 1: Update WishCard props and display logic**

Add `hasReserved` prop to know if current guest has booked this item:

```ts
interface WishCardProps {
  wish: GuestWish
  hasReserved?: boolean
  onReserve?: () => void
  onUnreserve?: () => void
}
```

Update the component body:

```tsx
export default function WishCard({ wish, hasReserved, onReserve, onUnreserve }: WishCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
      {wish.image_url && (
        <img
          src={wish.image_url}
          alt={wish.name}
          className="w-full h-48 object-cover rounded-md"
        />
      )}

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{wish.name}</h3>
          <div className="flex gap-1.5 shrink-0">
            {wish.allow_multiple && wish.reservation_count > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {wish.reservation_count} har paxat
              </span>
            )}
            {!wish.allow_multiple && wish.reserved && (
              <span className="shrink-0 rounded-full bg-reserved/20 px-2.5 py-0.5 text-xs font-medium text-reserved">
                Paxad
              </span>
            )}
          </div>
        </div>

        {wish.description && (
          <p className="text-sm text-muted-foreground">{wish.description}</p>
        )}

        {wish.link && (
          <a
            href={wish.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Produktlänk
          </a>
        )}
      </div>

      {wish.allow_multiple ? (
        <div className="flex gap-2">
          {!hasReserved && onReserve && (
            <button
              onClick={onReserve}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Paxa denna
            </button>
          )}
          {hasReserved && onUnreserve && (
            <button
              onClick={onUnreserve}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Avboka
            </button>
          )}
        </div>
      ) : wish.reserved ? (
        onUnreserve && (
          <button
            onClick={onUnreserve}
            className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Avboka
          </button>
        )
      ) : (
        onReserve && (
          <button
            onClick={onReserve}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Paxa denna
          </button>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/WishCard.tsx
git commit -m "feat: WishCard supports multi-booking display and actions"
```

---

### Task 6: Update guest list page with localStorage tracking

**Files:**
- Modify: `frontend/src/pages/list/[url].tsx`

- [ ] **Step 1: Add localStorage helpers and state**

Add localStorage tracking at the top of the component:

```ts
const [guestName, setGuestName] = useState<string>("")
const [reservedWishIds, setReservedWishIds] = useState<Set<string>>(new Set())

// Load from localStorage on mount
useEffect(() => {
  const storedName = localStorage.getItem("guestName") ?? ""
  setGuestName(storedName)
  try {
    const stored = JSON.parse(localStorage.getItem("reservedWishes") ?? "[]")
    setReservedWishIds(new Set(stored))
  } catch {
    setReservedWishIds(new Set())
  }
}, [])

function trackReservation(wishId: string, name: string) {
  localStorage.setItem("guestName", name)
  setGuestName(name)
  setReservedWishIds((prev) => {
    const next = new Set(prev)
    next.add(wishId)
    const arr = Array.from(next)
    localStorage.setItem("reservedWishes", JSON.stringify(arr))
    return next
  })
}

function untrackReservation(wishId: string) {
  setReservedWishIds((prev) => {
    const next = new Set(prev)
    next.delete(wishId)
    const arr = Array.from(next)
    localStorage.setItem("reservedWishes", JSON.stringify(arr))
    return next
  })
}
```

- [ ] **Step 2: Update handleReserve to track**

```ts
async function handleReserve(guestName: string) {
  if (!reserveTarget) return
  const { data, error } = await supabase.rpc("reserve_wish", {
    p_wish_id: reserveTarget.id,
    p_guest_name: guestName,
  })
  if (error || data === false) {
    toast.error("Någon hann före! Presenten är redan paxad.")
    refetch()
    return
  }
  toast.success("Paxad! Du har reserverat presenten.")
  trackReservation(reserveTarget.id, guestName)
  refetch()
}
```

- [ ] **Step 3: Update handleUnreserve to untrack**

```ts
async function handleUnreserve(guestName: string) {
  if (!unreserveTarget) return
  const { data, error } = await supabase.rpc("unreserve_wish", {
    p_wish_id: unreserveTarget.id,
    p_guest_name: guestName,
  })
  if (error || data === false) {
    toast.error("Avbokningen misslyckades. Kontrollera att du angav rätt namn.")
    return
  }
  toast.success("Reservation avbokad.")
  untrackReservation(unreserveTarget.id)
  refetch()
}
```

- [ ] **Step 4: Pass hasReserved to WishCard**

Update the WishCard render in the grid:

```tsx
{wishes.map((wish) => (
  <WishCard
    key={wish.id}
    wish={wish}
    hasReserved={reservedWishIds.has(wish.id)}
    onReserve={() => setReserveTarget(wish)}
    onUnreserve={() => setUnreserveTarget(wish)}
  />
))}
```

- [ ] **Step 5: Pre-fill guest name in ReserveDialog**

Pass `defaultName` to ReserveDialog so returning guests don't have to re-type:

Update the ReserveDialog render:

```tsx
<ReserveDialog
  wishName={reserveTarget?.name ?? ""}
  defaultName={guestName}
  open={!!reserveTarget}
  onClose={() => setReserveTarget(null)}
  onConfirm={handleReserve}
/>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/list/[url].tsx
git commit -m "feat: guest page tracks reservations in localStorage for multi-booking UX"
```

---

### Task 7: Add defaultName support to ReserveDialog

**Files:**
- Modify: `frontend/src/components/ReserveDialog.tsx`

- [ ] **Step 1: Add defaultName prop**

Update the interface and component:

```ts
interface ReserveDialogProps {
  wishName: string
  defaultName?: string
  open: boolean
  onClose: () => void
  onConfirm: (guestName: string) => Promise<void>
}
```

Change the `useState` for name to initialize from `defaultName`:

```ts
export default function ReserveDialog({ wishName, defaultName, open, onClose, onConfirm }: ReserveDialogProps) {
  const [name, setName] = useState(defaultName ?? "")
  const [loading, setLoading] = useState(false)
```

Also add a `useEffect` to update when `defaultName` changes or dialog opens:

```ts
useEffect(() => {
  if (open && defaultName) {
    setName(defaultName)
  }
}, [open, defaultName])
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ReserveDialog.tsx
git commit -m "feat: ReserveDialog accepts defaultName to pre-fill guest name"
```

---

### Task 8: Update useAdminWishlist to handle reservation_count for admin view

**Files:**
- Modify: `frontend/src/hooks/useAdminWishlist.ts`

The admin hook reads from the `wishes` table directly, which doesn't have `reservation_count`. We need to compute it from the reservations data. No hook changes needed — the admin page already fetches reservations and can count them. But `allow_multiple` is now on the `wishes` table, so it will be included automatically when we select `*`.

The `AdminWish` type extends `GuestWish` which now expects `reservation_count`. Since the admin reads from `wishes` (not `guest_wishes`), we need to add `reservation_count` manually.

- [ ] **Step 1: Compute reservation_count in the admin hook**

Update `useAdminWishlist.ts` to add `reservation_count` to each wish:

```ts
const wishIds = (wishData ?? []).map((w: AdminWish) => w.id)
if (wishIds.length > 0) {
  const { data: resData } = await supabase
    .from("reservations")
    .select("*")
    .in("wish_id", wishIds)

  setReservations(resData ?? [])

  // Add reservation_count to wishes
  const countMap = new Map<string, number>()
  for (const r of resData ?? []) {
    countMap.set(r.wish_id, (countMap.get(r.wish_id) ?? 0) + 1)
  }
  const enriched = (wishData as AdminWish[]).map((w) => ({
    ...w,
    reservation_count: countMap.get(w.id) ?? 0,
  }))
  setWishes(enriched)
} else {
  setWishes(
    (wishData as AdminWish[]).map((w) => ({ ...w, reservation_count: 0 }))
  )
}
```

This replaces the current `setWishes((wishData as AdminWish[]) ?? [])` line and the subsequent reservation fetch block.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useAdminWishlist.ts
git commit -m "feat: admin hook computes reservation_count from reservations data"
```

---

### Task 9: Verify and test end-to-end

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Test admin flow**

1. Log in to admin
2. Open a list, add a new wish with "Flera kan boka" checked
3. Add another wish without the toggle
4. Verify both display correctly — multi-book shows blue badge

- [ ] **Step 3: Test guest flow**

1. Open guest list URL
2. Reserve the single-book wish — verify "Paxad" badge, "Avboka" button
3. Reserve the multi-book wish — verify "1 har paxat" badge, button works
4. Open a different browser/incognito — reserve the same multi-book wish as another name
5. Verify "2 har paxat" shows
6. Try to reserve the single-book wish — should show "Någon hann före"

- [ ] **Step 4: Test unreserve flow**

1. Click "Avboka" on multi-book wish, enter correct name — should work
2. Verify count decreases
3. Other person's reservation should remain

- [ ] **Step 5: Commit any fixes, then final commit**

```bash
git add -A
git commit -m "feat: multi-booking complete — allow_multiple toggle with guest tracking"
```

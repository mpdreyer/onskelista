# Datamodell

## Entiteter

### WishList
- `id` (UUID): Primärnyckel
- `name` (String): Listans namn
- `description` (Text): Fritextbeskrivning
- `url` (String): Unik delbar URL
- `createdBy` (String): Skapare/admin

### Wish
- `id` (UUID): Primärnyckel
- `wishListId` (UUID): FK till WishList
- `name` (String): Önskemålets namn
- `description` (Text): Beskrivning
- `link` (String, optional): Produktlänk
- `imageURL` (String, optional): Bild-URL
- `reserved` (Boolean): Reserveringsstatus
- `reservedBy` (String, optional): Namn på reserverande gäst

### Reservation
- `id` (UUID): Primärnyckel
- `wishId` (UUID): FK till Wish
- `guestName` (String): Gästens namn
- `reservedAt` (DateTime): Tidsstämpel

## API-endpoints (planerade)

Se user stories och acceptance criteria för detaljer.

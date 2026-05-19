# Acceptance Criteria

## AC-1: Skapa önskelista (US-1)

- [ ] Admin kan fylla i namn (obligatoriskt) och beskrivning (valfritt)
- [ ] En unik URL genereras automatiskt vid skapande
- [ ] Listan sparas i databasen med korrekt `created_by`
- [ ] Admin ser den nya listan i sin listöversikt efter skapande
- [ ] Felmeddelande visas om namn saknas

## AC-2: Dela önskelista via länk (US-2)

- [ ] Varje lista har en unik, URL-säker slug (t.ex. `/list/abc123`)
- [ ] Admin kan kopiera länken med en knapp
- [ ] Länken fungerar utan inloggning för gäster
- [ ] Ogiltig URL visar ett vänligt 404-meddelande

## AC-3: Lägga till önskemål (US-3)

- [ ] Admin kan lägga till önskemål med: namn (obligatoriskt), beskrivning, länk, bild
- [ ] Produktlänk valideras som giltig URL om angiven
- [ ] Bild kan laddas upp eller anges som extern URL
- [ ] Nytt önskemål syns direkt i listan utan sidladdning

## AC-4: Redigera önskemål (US-4)

- [ ] Admin kan redigera alla fält på ett befintligt önskemål
- [ ] Admin kan ta bort ett önskemål (med bekräftelsedialog)
- [ ] Om önskemålet är reserverat visas en varning vid borttagning
- [ ] Ändringar sparas och syns direkt

## AC-5: Se önskelista som gäst (US-5)

- [ ] Gäst ser listans namn, beskrivning och alla önskemål
- [ ] Varje önskemål visar namn, beskrivning, bild och länk (om angivna)
- [ ] Reserverade önskemål markeras visuellt (t.ex. "Paxad")
- [ ] Gäst kan inte se vem som reserverat (enbart att det är paxat)
- [ ] Ingen inloggning krävs

## AC-6: Reservera present (US-6)

- [ ] Gäst kan klicka "Paxa" på ett ledigt önskemål
- [ ] Gäst anger sitt namn i en dialog/modal
- [ ] Reserveringen sparas och önskemålet markeras som paxat
- [ ] Redan reserverade önskemål har inaktiverad paxa-knapp
- [ ] Bekräftelsemeddelande visas efter lyckad reservation

## AC-7: Avboka reservation (US-7)

- [ ] Gäst som paxat kan avboka sin reservation
- [ ] Avbokning kräver att gästen anger samma namn som vid reservering
- [ ] Önskemålet blir ledigt igen efter avbokning
- [ ] Bekräftelsedialog visas innan avbokning genomförs

## AC-8: Se reserveringsstatus — admin (US-8)

- [ ] Admin ser vilka önskemål som är reserverade
- [ ] Admin ser namnet på den som reserverat
- [ ] Admin ser tidpunkt för reserveringen
- [ ] Informationen visas i admin-vyn, inte i den publika gästvyn

## AC-9: Dölj reserveringar för andra gäster (US-9)

- [ ] Gästvyn visar bara "Paxad" / "Ledig" — aldrig vem som paxat
- [ ] API:et returnerar inte `reserved_by` eller `guest_name` till gästvyn
- [ ] Admin-vyn visar fullständig reserveringsinformation

## AC-10: Hantera flera listor (US-10)

- [ ] Admin ser en översikt med alla sina listor
- [ ] Admin kan växla mellan listor
- [ ] Varje lista har en egen unik URL
- [ ] Admin kan ta bort en lista (med bekräftelsedialog)

## AC-11: Admin-inloggning (US-11)

- [ ] Admin kan registrera konto med e-post och lösenord
- [ ] Admin kan logga in och ut
- [ ] Ej inloggade användare omdirigeras från admin-sidor till inloggning
- [ ] Supabase Auth används för autentisering
- [ ] Gästvyn kräver ingen inloggning

## AC-12: Responsiv design (US-12)

- [ ] Layouten anpassas för mobil (< 640px), surfplatta (640–1024px) och desktop (> 1024px)
- [ ] Alla interaktioner (paxa, skapa, redigera) fungerar med touch
- [ ] Text är läsbar utan horisontell scrollning på alla skärmstorlekar

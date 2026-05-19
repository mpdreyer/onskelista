# Önskelista

En web-app för att dela och hantera önskelistor för fester och högtider.

## Projektbeskrivning

Önskelista gör det enkelt att:
- Skapa namngivna önskelistor för olika tillfällen
- Dela listor via unik URL
- Låta gäster "paxa" presenter för att undvika dubbletter
- Hantera flera listor samtidigt

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)

## Kom igång

### Förutsättningar

- Node.js 18+
- Supabase-konto
- Git

### Installation

1. Klona repot:
```bash
git clone [repo-url]
cd onskelista
```

2. Installera dependencies:
```bash
cd frontend
npm install
```

3. Konfigurera miljövariabler:
```bash
cp .env.example .env.local
# Fyll i dina Supabase-credentials
```

4. Kör utvecklingsserver:
```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Projektstruktur

```
onskelista/
├── frontend/           # Next.js frontend
│   ├── src/
│   │   ├── components/ # React-komponenter
│   │   ├── pages/      # Next.js sidor/routes
│   │   ├── lib/        # Utilities, Supabase-client
│   │   └── types/      # TypeScript types
│   └── public/         # Statiska filer
├── supabase/          # Supabase migrations och seed
│   ├── migrations/    # SQL-migrationer
│   └── seed/          # Test-data
└── docs/              # Projektdokumentation
```

## Datamodell

Se `docs/datamodel.md` för detaljerad beskrivning av databasschemat.

## Deployment

- Frontend: Automatisk deploy via Vercel vid push till `main`
- Backend: Supabase Cloud (manuella migrationer via Supabase CLI)

## Licens

Privat projekt

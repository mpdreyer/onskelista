# Önskelista UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete frontend UI for Önskelista — landing page, guest wishlist view with reservation, and admin dashboard with list/wish management.

**Architecture:** Next.js 14 Pages Router with client-side Supabase fetching. shadcn/ui + Tailwind CSS for components and styling. No global state — each page fetches its own data via custom hooks. Auth via Supabase Auth with an AuthProvider wrapper.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS v2, nanoid, sonner (toasts), lucide-react (icons)

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   ├── Layout.tsx           # App wrapper — conditional header/footer
│   │   ├── LandingHero.tsx      # Landing page hero section
│   │   ├── WishCard.tsx         # Wish item card (guest + admin variants)
│   │   ├── WishForm.tsx         # Create/edit wish form (admin)
│   │   ├── WishListForm.tsx     # Create/edit wishlist form (admin)
│   │   ├── WishListCard.tsx     # Wishlist card for admin dashboard
│   │   ├── ReserveDialog.tsx    # "Paxa" modal (guest)
│   │   ├── UnreserveDialog.tsx  # "Avboka" modal (guest)
│   │   └── ShareButton.tsx      # Copy URL to clipboard
│   ├── hooks/
│   │   ├── useWishlist.ts       # Guest: fetch wishlist + guest_wishes by slug
│   │   └── useAdminWishlist.ts  # Admin: fetch wishlist + wishes + reservations by id
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client (exists)
│   │   └── auth.tsx             # AuthProvider + useAuth hook
│   ├── pages/
│   │   ├── _app.tsx             # App wrapper with Layout + Toaster
│   │   ├── index.tsx            # Landing page
│   │   ├── login.tsx            # Login page
│   │   ├── signup.tsx           # Signup page
│   │   ├── admin/
│   │   │   ├── index.tsx        # Admin dashboard
│   │   │   └── list/
│   │   │       └── [id].tsx     # Admin list editor
│   │   └── list/
│   │       └── [url].tsx        # Guest wishlist view
│   ├── types/
│   │   └── index.ts             # TypeScript types (exists, needs update)
│   └── styles/
│       └── globals.css          # Tailwind directives + custom palette
├── tailwind.config.ts           # Tailwind config with custom colors
├── postcss.config.js            # PostCSS config for Tailwind
├── components.json              # shadcn/ui config
└── next.config.js               # Next.js config
```

---

### Task 1: Install dependencies and configure Tailwind + shadcn/ui

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/components.json`
- Create: `frontend/next.config.js`
- Create: `frontend/src/lib/utils.ts`

- [ ] **Step 1: Install Tailwind CSS and dependencies**

```bash
cd frontend
npm install tailwindcss@3 postcss autoprefixer nanoid sonner
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p --ts
```

- [ ] **Step 2: Install shadcn/ui dependencies manually**

shadcn/ui needs these peer deps. Install them directly rather than using `npx shadcn-ui init` which may prompt interactively:

```bash
cd frontend
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-dialog @radix-ui/react-slot
```

- [ ] **Step 3: Create `frontend/src/lib/utils.ts`**

shadcn/ui components import a `cn` utility from this file:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Configure Tailwind with custom color palette**

Replace `frontend/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF8F0",
        primary: {
          DEFAULT: "#E8736A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5E6D3",
          foreground: "#3D2C2E",
        },
        accent: {
          DEFAULT: "#D4A853",
          foreground: "#FFFFFF",
        },
        foreground: "#3D2C2E",
        muted: {
          DEFAULT: "#F5E6D3",
          foreground: "#7A6365",
        },
        border: "#E8D5C4",
        ring: "#E8736A",
        reserved: "#7BC47F",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Create `frontend/postcss.config.js`**

Check if `npx tailwindcss init -p` already created this. If not, create:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create `frontend/src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FFF8F0;
  color: #3D2C2E;
}
```

- [ ] **Step 7: Create `frontend/components.json`**

This tells shadcn/ui where to put components:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 8: Create `frontend/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

- [ ] **Step 9: Add shadcn/ui components**

```bash
cd frontend
npx shadcn@latest add button input textarea dialog card badge
```

If the CLI prompts, accept defaults. This creates files in `src/components/ui/`.

- [ ] **Step 10: Verify setup by running dev server**

```bash
cd frontend
npm run dev
```

Expected: Server starts on http://localhost:3000 without errors.

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat: configure Tailwind, shadcn/ui, and dependencies"
```

---

### Task 2: Update TypeScript types and create `_app.tsx`

**Files:**
- Modify: `frontend/src/types/index.ts`
- Create: `frontend/src/pages/_app.tsx`

- [ ] **Step 1: Update types to match database column names**

The database uses snake_case. Update `frontend/src/types/index.ts`:

```typescript
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
```

- [ ] **Step 2: Create `frontend/src/pages/_app.tsx`**

```tsx
import type { AppProps } from "next/app"
import "@/styles/globals.css"
import { Toaster } from "sonner"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="bottom-center" richColors />
    </>
  )
}
```

- [ ] **Step 3: Verify app loads**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000 — should show a blank page with no errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/pages/_app.tsx frontend/src/styles/globals.css
git commit -m "feat: update types to match DB schema, add _app with Toaster"
```

---

### Task 3: Auth — AuthProvider, login, and signup pages

**Files:**
- Create: `frontend/src/lib/auth.tsx`
- Create: `frontend/src/pages/login.tsx`
- Create: `frontend/src/pages/signup.tsx`

- [ ] **Step 1: Create `frontend/src/lib/auth.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { useRouter } from "next/router"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading && !user && router.pathname.startsWith("/admin")) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Update `_app.tsx` to include AuthProvider**

Replace `frontend/src/pages/_app.tsx`:

```tsx
import type { AppProps } from "next/app"
import "@/styles/globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="bottom-center" richColors />
    </AuthProvider>
  )
}
```

- [ ] **Step 3: Create `frontend/src/pages/login.tsx`**

```tsx
import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/router"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error("Inloggningen misslyckades: " + error.message)
      setLoading(false)
      return
    }

    router.push("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Logga in</h1>
          <p className="text-muted-foreground mt-1">Hantera dina önskelistor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Inget konto?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Registrera dig
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `frontend/src/pages/signup.tsx`**

```tsx
import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/router"
import Link from "next/link"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      toast.error("Registreringen misslyckades: " + error.message)
      setLoading(false)
      return
    }

    toast.success("Konto skapat! Kontrollera din e-post för att verifiera.")
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Skapa konto</h1>
          <p className="text-muted-foreground mt-1">Börja skapa dina önskelistor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Har du redan ett konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify login page renders**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000/login — should show a login form.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/auth.tsx frontend/src/pages/_app.tsx frontend/src/pages/login.tsx frontend/src/pages/signup.tsx
git commit -m "feat: add auth provider, login and signup pages"
```

---

### Task 4: Landing page

**Files:**
- Create: `frontend/src/components/LandingHero.tsx`
- Modify: `frontend/src/pages/index.tsx`

- [ ] **Step 1: Create `frontend/src/components/LandingHero.tsx`**

```tsx
import Link from "next/link"
import { Gift, Share2, ShieldCheck } from "lucide-react"

export default function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-end p-4">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Logga in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <Gift className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Önskelista
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
          Skapa önskelistor, dela med vänner och familj, och undvik dubbletter
          — allt på ett ställe.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Skapa din önskelista
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-secondary"
          >
            Logga in
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
          <div className="flex flex-col items-center gap-2">
            <Gift className="h-8 w-8 text-accent" />
            <h3 className="font-semibold">Skapa listor</h3>
            <p className="text-sm text-muted-foreground">
              Samla dina önskemål inför alla tillfällen
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Share2 className="h-8 w-8 text-accent" />
            <h3 className="font-semibold">Dela enkelt</h3>
            <p className="text-sm text-muted-foreground">
              Skicka en unik länk till dina gäster
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent" />
            <h3 className="font-semibold">Undvik dubbletter</h3>
            <p className="text-sm text-muted-foreground">
              Gäster paxar presenter så ingen köper samma sak
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Update `frontend/src/pages/index.tsx`**

```tsx
import LandingHero from "@/components/LandingHero"

export default function Home() {
  return <LandingHero />
}
```

- [ ] **Step 3: Verify landing page**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000 — should show hero with heading, description, two CTA buttons, and 3-icon feature grid.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/LandingHero.tsx frontend/src/pages/index.tsx
git commit -m "feat: add landing page with hero and feature grid"
```

---

### Task 5: Shared components — WishCard, ShareButton, ReserveDialog, UnreserveDialog

**Files:**
- Modify: `frontend/src/components/WishCard.tsx`
- Create: `frontend/src/components/ShareButton.tsx`
- Create: `frontend/src/components/ReserveDialog.tsx`
- Create: `frontend/src/components/UnreserveDialog.tsx`

- [ ] **Step 1: Create `frontend/src/components/ReserveDialog.tsx`**

```tsx
import { useState, FormEvent } from "react"

interface ReserveDialogProps {
  wishName: string
  open: boolean
  onClose: () => void
  onConfirm: (guestName: string) => Promise<void>
}

export default function ReserveDialog({ wishName, open, onClose, onConfirm }: ReserveDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onConfirm(name)
    setName("")
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Paxa present</h2>
        <p className="text-sm text-muted-foreground">
          Du paxar: <strong>{wishName}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium mb-1">Ditt namn</label>
            <input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Skriv ditt namn..."
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Paxar..." : "Paxa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/UnreserveDialog.tsx`**

```tsx
import { useState, FormEvent } from "react"

interface UnreserveDialogProps {
  wishName: string
  open: boolean
  onClose: () => void
  onConfirm: (guestName: string) => Promise<void>
}

export default function UnreserveDialog({ wishName, open, onClose, onConfirm }: UnreserveDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onConfirm(name)
    setName("")
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Avboka reservation</h2>
        <p className="text-sm text-muted-foreground">
          Avboka: <strong>{wishName}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="unreserve-name" className="block text-sm font-medium mb-1">
              Ange samma namn som du använde vid paxning
            </label>
            <input
              id="unreserve-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ditt namn..."
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Avbokar..." : "Avboka"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/ShareButton.tsx`**

```tsx
import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  url: string
}

export default function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const fullUrl = `${window.location.origin}/list/${url}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-reserved" />
          Kopierad!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Dela länk
        </>
      )}
    </button>
  )
}
```

- [ ] **Step 4: Update `frontend/src/components/WishCard.tsx`**

```tsx
import { ExternalLink } from "lucide-react"
import { GuestWish } from "@/types"

interface WishCardProps {
  wish: GuestWish
  onReserve?: () => void
  onUnreserve?: () => void
}

export default function WishCard({ wish, onReserve, onUnreserve }: WishCardProps) {
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
          {wish.reserved && (
            <span className="shrink-0 rounded-full bg-reserved/20 px-2.5 py-0.5 text-xs font-medium text-reserved">
              Paxad
            </span>
          )}
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

      {wish.reserved ? (
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

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add WishCard, ShareButton, ReserveDialog, UnreserveDialog"
```

---

### Task 6: Guest data hook and guest wishlist page

**Files:**
- Create: `frontend/src/hooks/useWishlist.ts`
- Rename/modify: `frontend/src/pages/list/[id].tsx` → `frontend/src/pages/list/[url].tsx`

- [ ] **Step 1: Create `frontend/src/hooks/useWishlist.ts`**

```typescript
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { WishList, GuestWish } from "@/types"

export function useWishlist(url: string | undefined) {
  const [wishlist, setWishlist] = useState<WishList | null>(null)
  const [wishes, setWishes] = useState<GuestWish[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  async function fetchData() {
    if (!url) return

    const { data: wl, error: wlError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("url", url)
      .single()

    if (wlError || !wl) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setWishlist(wl)

    const { data: wishData } = await supabase
      .from("guest_wishes")
      .select("*")
      .eq("wishlist_id", wl.id)
      .order("created_at", { ascending: true })

    setWishes(wishData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [url])

  return { wishlist, wishes, loading, notFound, refetch: fetchData }
}
```

- [ ] **Step 2: Delete old `[id].tsx` and create `frontend/src/pages/list/[url].tsx`**

Delete the old file:
```bash
rm frontend/src/pages/list/\[id\].tsx
```

Create `frontend/src/pages/list/[url].tsx`:

```tsx
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Gift } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useWishlist } from "@/hooks/useWishlist"
import { GuestWish } from "@/types"
import WishCard from "@/components/WishCard"
import ReserveDialog from "@/components/ReserveDialog"
import UnreserveDialog from "@/components/UnreserveDialog"

export default function GuestWishListPage() {
  const router = useRouter()
  const slug = router.query.url as string | undefined
  const { wishlist, wishes, loading, notFound, refetch } = useWishlist(slug)

  const [reserveTarget, setReserveTarget] = useState<GuestWish | null>(null)
  const [unreserveTarget, setUnreserveTarget] = useState<GuestWish | null>(null)

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
    refetch()
  }

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
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Gift className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Listan hittades inte</h1>
        <p className="text-muted-foreground">Kontrollera att länken är korrekt.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{wishlist?.name}</h1>
          {wishlist?.description && (
            <p className="mt-2 text-muted-foreground">{wishlist.description}</p>
          )}
        </div>

        {wishes.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Inga önskemål har lagts till ännu.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                onReserve={() => setReserveTarget(wish)}
                onUnreserve={() => setUnreserveTarget(wish)}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Skapa din egen önskelista
        </Link>
      </footer>

      <ReserveDialog
        wishName={reserveTarget?.name ?? ""}
        open={!!reserveTarget}
        onClose={() => setReserveTarget(null)}
        onConfirm={handleReserve}
      />

      <UnreserveDialog
        wishName={unreserveTarget?.name ?? ""}
        open={!!unreserveTarget}
        onClose={() => setUnreserveTarget(null)}
        onConfirm={handleUnreserve}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify page renders**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000/list/test — should show the "Listan hittades inte" 404 page (since no list with that slug exists yet).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useWishlist.ts frontend/src/pages/list/
git commit -m "feat: add guest wishlist page with reserve/unreserve flow"
```

---

### Task 7: Admin data hook

**Files:**
- Create: `frontend/src/hooks/useAdminWishlist.ts`

- [ ] **Step 1: Create `frontend/src/hooks/useAdminWishlist.ts`**

```typescript
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { WishList, AdminWish, Reservation } from "@/types"

export function useAdminWishlist(id: string | undefined) {
  const [wishlist, setWishlist] = useState<WishList | null>(null)
  const [wishes, setWishes] = useState<AdminWish[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    if (!id) return

    const { data: wl } = await supabase
      .from("wishlists")
      .select("*")
      .eq("id", id)
      .single()

    if (!wl) {
      setLoading(false)
      return
    }

    setWishlist(wl)

    const { data: wishData } = await supabase
      .from("wishes")
      .select("*")
      .eq("wishlist_id", id)
      .order("created_at", { ascending: true })

    setWishes((wishData as AdminWish[]) ?? [])

    const wishIds = (wishData ?? []).map((w: AdminWish) => w.id)
    if (wishIds.length > 0) {
      const { data: resData } = await supabase
        .from("reservations")
        .select("*")
        .in("wish_id", wishIds)

      setReservations(resData ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  return { wishlist, wishes, reservations, loading, refetch: fetchData }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useAdminWishlist.ts
git commit -m "feat: add useAdminWishlist hook"
```

---

### Task 8: Admin components — WishListForm, WishForm, WishListCard

**Files:**
- Create: `frontend/src/components/WishListForm.tsx`
- Create: `frontend/src/components/WishForm.tsx`
- Create: `frontend/src/components/WishListCard.tsx`

- [ ] **Step 1: Create `frontend/src/components/WishListForm.tsx`**

```tsx
import { useState, FormEvent } from "react"

interface WishListFormProps {
  initialName?: string
  initialDescription?: string
  onSubmit: (name: string, description: string) => Promise<void>
  submitLabel: string
}

export default function WishListForm({ initialName = "", initialDescription = "", onSubmit, submitLabel }: WishListFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(name, description)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="list-name" className="block text-sm font-medium mb-1">Namn på listan</label>
        <input
          id="list-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="T.ex. Julönskelista 2026"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="list-desc" className="block text-sm font-medium mb-1">Beskrivning (valfritt)</label>
        <textarea
          id="list-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Berätta för dina gäster vad listan är till för..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sparar..." : submitLabel}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/WishForm.tsx`**

```tsx
import { useState, FormEvent } from "react"

interface WishFormProps {
  initialName?: string
  initialDescription?: string
  initialLink?: string
  initialImageUrl?: string
  onSubmit: (data: { name: string; description: string; link: string; image_url: string }) => Promise<void>
  onCancel?: () => void
  submitLabel: string
}

export default function WishForm({
  initialName = "",
  initialDescription = "",
  initialLink = "",
  initialImageUrl = "",
  onSubmit,
  onCancel,
  submitLabel,
}: WishFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [link, setLink] = useState(initialLink)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ name, description, link, image_url: imageUrl })
    if (!initialName) {
      setName("")
      setDescription("")
      setLink("")
      setImageUrl("")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="wish-name" className="block text-sm font-medium mb-1">Önskemål</label>
        <input
          id="wish-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Vad önskar du dig?"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="wish-desc" className="block text-sm font-medium mb-1">Beskrivning (valfritt)</label>
        <textarea
          id="wish-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Storlek, färg, variant..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="wish-link" className="block text-sm font-medium mb-1">Produktlänk (valfritt)</label>
        <input
          id="wish-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="wish-img" className="block text-sm font-medium mb-1">Bild-URL (valfritt)</label>
        <input
          id="wish-img"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sparar..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Avbryt
          </button>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/WishListCard.tsx`**

```tsx
import Link from "next/link"
import { Gift } from "lucide-react"
import ShareButton from "./ShareButton"

interface WishListCardProps {
  id: string
  name: string
  description: string | null
  url: string
  wishCount: number
}

export default function WishListCard({ id, name, description, url, wishCount }: WishListCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/admin/list/${id}`}
            className="font-semibold hover:text-primary"
          >
            {name}
          </Link>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <Gift className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {wishCount} önskemål
        </span>
        <ShareButton url={url} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/WishListForm.tsx frontend/src/components/WishForm.tsx frontend/src/components/WishListCard.tsx
git commit -m "feat: add admin components — WishListForm, WishForm, WishListCard"
```

---

### Task 9: Admin dashboard page

**Files:**
- Modify: `frontend/src/pages/admin/index.tsx`

- [ ] **Step 1: Implement `frontend/src/pages/admin/index.tsx`**

```tsx
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { Plus, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { WishList } from "@/types"
import WishListForm from "@/components/WishListForm"
import WishListCard from "@/components/WishListCard"

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [wishlists, setWishlists] = useState<(WishList & { wish_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  async function fetchLists() {
    if (!user) return

    const { data } = await supabase
      .from("wishlists")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (!data) {
      setLoading(false)
      return
    }

    const listsWithCounts = await Promise.all(
      data.map(async (wl) => {
        const { count } = await supabase
          .from("wishes")
          .select("*", { count: "exact", head: true })
          .eq("wishlist_id", wl.id)
        return { ...wl, wish_count: count ?? 0 }
      })
    )

    setWishlists(listsWithCounts)
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading && user) fetchLists()
  }, [user, authLoading])

  async function handleCreateList(name: string, description: string) {
    if (!user) return

    const slug = nanoid(8)
    const { error } = await supabase.from("wishlists").insert({
      name,
      description: description || null,
      url: slug,
      created_by: user.id,
    })

    if (error) {
      toast.error("Kunde inte skapa listan: " + error.message)
      return
    }

    toast.success("Önskelista skapad!")
    setShowForm(false)
    fetchLists()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Mina önskelistor</h1>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logga ut
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Dina listor</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Ny lista
          </button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="font-medium mb-3">Skapa ny önskelista</h3>
            <WishListForm
              onSubmit={handleCreateList}
              submitLabel="Skapa lista"
            />
          </div>
        )}

        {wishlists.length === 0 && !showForm ? (
          <p className="text-center text-muted-foreground py-8">
            Du har inga önskelistor ännu. Skapa din första!
          </p>
        ) : (
          <div className="space-y-3">
            {wishlists.map((wl) => (
              <WishListCard
                key={wl.id}
                id={wl.id}
                name={wl.name}
                description={wl.description}
                url={wl.url}
                wishCount={wl.wish_count}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify admin dashboard**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000/admin — should redirect to /login (since not authenticated).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/admin/index.tsx
git commit -m "feat: add admin dashboard with list creation"
```

---

### Task 10: Admin list editor page

**Files:**
- Create: `frontend/src/pages/admin/list/[id].tsx`

- [ ] **Step 1: Create admin list directory**

```bash
mkdir -p frontend/src/pages/admin/list
```

- [ ] **Step 2: Create `frontend/src/pages/admin/list/[id].tsx`**

```tsx
import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { useAdminWishlist } from "@/hooks/useAdminWishlist"
import { AdminWish } from "@/types"
import WishForm from "@/components/WishForm"
import WishListForm from "@/components/WishListForm"
import ShareButton from "@/components/ShareButton"

export default function AdminListEditor() {
  const router = useRouter()
  const id = router.query.id as string | undefined
  const { user } = useAuth()
  const { wishlist, wishes, reservations, loading, refetch } = useAdminWishlist(id)

  const [editingWish, setEditingWish] = useState<AdminWish | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleAddWish(data: { name: string; description: string; link: string; image_url: string }) {
    if (!id) return
    const { error } = await supabase.from("wishes").insert({
      wishlist_id: id,
      name: data.name,
      description: data.description || null,
      link: data.link || null,
      image_url: data.image_url || null,
    })
    if (error) {
      toast.error("Kunde inte lägga till: " + error.message)
      return
    }
    toast.success("Önskemål tillagt!")
    setShowAddForm(false)
    refetch()
  }

  async function handleEditWish(data: { name: string; description: string; link: string; image_url: string }) {
    if (!editingWish) return
    const { error } = await supabase
      .from("wishes")
      .update({
        name: data.name,
        description: data.description || null,
        link: data.link || null,
        image_url: data.image_url || null,
      })
      .eq("id", editingWish.id)
    if (error) {
      toast.error("Kunde inte uppdatera: " + error.message)
      return
    }
    toast.success("Önskemål uppdaterat!")
    setEditingWish(null)
    refetch()
  }

  async function handleDeleteWish(wish: AdminWish) {
    const confirmed = window.confirm(
      wish.reserved
        ? `"${wish.name}" är paxad av ${wish.reserved_by}. Vill du verkligen ta bort?`
        : `Ta bort "${wish.name}"?`
    )
    if (!confirmed) return
    const { error } = await supabase.from("wishes").delete().eq("id", wish.id)
    if (error) {
      toast.error("Kunde inte ta bort: " + error.message)
      return
    }
    toast.success("Önskemål borttaget.")
    refetch()
  }

  async function handleUpdateList(name: string, description: string) {
    if (!id) return
    const { error } = await supabase
      .from("wishlists")
      .update({ name, description: description || null })
      .eq("id", id)
    if (error) {
      toast.error("Kunde inte uppdatera listan: " + error.message)
      return
    }
    toast.success("Listan uppdaterad!")
    refetch()
  }

  async function handleDeleteList() {
    if (!confirm("Vill du verkligen ta bort hela listan? Detta kan inte ångras.")) return
    const { error } = await supabase.from("wishlists").delete().eq("id", id)
    if (error) {
      toast.error("Kunde inte ta bort listan: " + error.message)
      return
    }
    toast.success("Listan borttagen.")
    router.push("/admin")
  }

  function getReservation(wishId: string) {
    return reservations.find((r) => r.wish_id === wishId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    )
  }

  if (!wishlist || !user) return null

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Mina listor
        </Link>
        <ShareButton url={wishlist.url} />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Edit list + add wishes */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-white p-4 space-y-4">
              <h2 className="font-semibold">Redigera lista</h2>
              <WishListForm
                initialName={wishlist.name}
                initialDescription={wishlist.description ?? ""}
                onSubmit={handleUpdateList}
                submitLabel="Spara ändringar"
              />
              <button
                onClick={handleDeleteList}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Ta bort listan
              </button>
            </div>

            <div className="rounded-lg border border-border bg-white p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Önskemål</h2>
                <button
                  onClick={() => { setShowAddForm(!showAddForm); setEditingWish(null) }}
                  className="text-sm text-primary hover:underline"
                >
                  {showAddForm ? "Stäng" : "+ Lägg till"}
                </button>
              </div>

              {showAddForm && (
                <WishForm
                  onSubmit={handleAddWish}
                  onCancel={() => setShowAddForm(false)}
                  submitLabel="Lägg till"
                />
              )}
            </div>
          </div>

          {/* Right: Wish list + reservations */}
          <div className="space-y-4">
            <h2 className="font-semibold">Önskemål ({wishes.length})</h2>

            {wishes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga önskemål tillagda ännu.</p>
            ) : (
              wishes.map((wish) => {
                const reservation = getReservation(wish.id)
                return (
                  <div key={wish.id} className="rounded-lg border border-border bg-white p-4 space-y-2">
                    {editingWish?.id === wish.id ? (
                      <WishForm
                        initialName={wish.name}
                        initialDescription={wish.description ?? ""}
                        initialLink={wish.link ?? ""}
                        initialImageUrl={wish.image_url ?? ""}
                        onSubmit={handleEditWish}
                        onCancel={() => setEditingWish(null)}
                        submitLabel="Spara"
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{wish.name}</h3>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => { setEditingWish(wish); setShowAddForm(false) }}
                              className="text-xs text-primary hover:underline"
                            >
                              Redigera
                            </button>
                            <button
                              onClick={() => handleDeleteWish(wish)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Ta bort
                            </button>
                          </div>
                        </div>

                        {wish.description && (
                          <p className="text-sm text-muted-foreground">{wish.description}</p>
                        )}

                        {wish.reserved ? (
                          <div className="rounded-md bg-reserved/10 px-3 py-2 text-sm">
                            <span className="font-medium text-reserved">Paxad</span>
                            {" av "}
                            <span className="font-medium">{wish.reserved_by}</span>
                            {reservation && (
                              <span className="text-muted-foreground">
                                {" "}— {new Date(reservation.reserved_at).toLocaleDateString("sv-SE")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Ledig</span>
                        )}
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify page renders**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000/admin — log in, create a list, click on it to open the editor.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/admin/list/
git commit -m "feat: add admin list editor with wish CRUD and reservation view"
```

---

### Task 11: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Test landing page**

Open http://localhost:3000 — verify hero, feature grid, and CTA buttons render. Click "Skapa din önskelista" → should go to /signup.

- [ ] **Step 3: Test signup + login flow**

Register a new account at /signup. Check for success toast. Go to /login and log in. Should redirect to /admin.

- [ ] **Step 4: Test admin — create list**

On /admin, click "Ny lista". Fill in name and description. Submit. Verify list appears in dashboard.

- [ ] **Step 5: Test admin — add wishes**

Click the list to open editor. Add 2-3 wishes with names, descriptions, links. Verify they appear on the right panel.

- [ ] **Step 6: Test admin — share link**

Click "Dela länk" on the list. Verify URL is copied. Open the URL in an incognito window.

- [ ] **Step 7: Test guest — view and reserve**

In the incognito window, verify the wishlist renders with all wishes. Click "Paxa denna" on a wish, enter a name, confirm. Verify the wish shows "Paxad".

- [ ] **Step 8: Test guest — unreserve**

Click "Avboka" on the paxed wish, enter the same name. Verify it becomes available again.

- [ ] **Step 9: Test admin — verify reservation visibility**

Back in the admin window, refresh the list editor. Verify the reservation shows "Paxad av [name]" with date.

- [ ] **Step 10: Test 404**

Open http://localhost:3000/list/nonexistent — verify friendly 404 message.

- [ ] **Step 11: Test responsive**

Resize browser to mobile width. Verify all pages stack properly and are usable.

- [ ] **Step 12: Fix any issues found, then commit**

```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```

- [ ] **Step 13: Push to GitHub**

```bash
git push
```

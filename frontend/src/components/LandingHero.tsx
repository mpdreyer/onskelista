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

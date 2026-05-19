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

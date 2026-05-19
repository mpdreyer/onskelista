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

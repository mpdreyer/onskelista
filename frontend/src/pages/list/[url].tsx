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

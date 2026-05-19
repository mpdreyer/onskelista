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

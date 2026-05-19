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

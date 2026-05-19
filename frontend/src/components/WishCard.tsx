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

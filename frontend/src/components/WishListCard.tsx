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

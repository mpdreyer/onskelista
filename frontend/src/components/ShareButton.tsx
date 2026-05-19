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

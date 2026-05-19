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

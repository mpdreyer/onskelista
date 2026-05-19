import { useState, FormEvent } from "react"

interface WishListFormProps {
  initialName?: string
  initialDescription?: string
  onSubmit: (name: string, description: string) => Promise<void>
  submitLabel: string
}

export default function WishListForm({ initialName = "", initialDescription = "", onSubmit, submitLabel }: WishListFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(name, description)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="list-name" className="block text-sm font-medium mb-1">Namn på listan</label>
        <input
          id="list-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="T.ex. Julönskelista 2026"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="list-desc" className="block text-sm font-medium mb-1">Beskrivning (valfritt)</label>
        <textarea
          id="list-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Berätta för dina gäster vad listan är till för..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sparar..." : submitLabel}
      </button>
    </form>
  )
}

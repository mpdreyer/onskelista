import { useState, FormEvent } from "react"

interface UnreserveDialogProps {
  wishName: string
  open: boolean
  onClose: () => void
  onConfirm: (guestName: string) => Promise<void>
}

export default function UnreserveDialog({ wishName, open, onClose, onConfirm }: UnreserveDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onConfirm(name)
    setName("")
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Avboka reservation</h2>
        <p className="text-sm text-muted-foreground">
          Avboka: <strong>{wishName}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="unreserve-name" className="block text-sm font-medium mb-1">
              Ange samma namn som du använde vid paxning
            </label>
            <input
              id="unreserve-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ditt namn..."
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Avbokar..." : "Avboka"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

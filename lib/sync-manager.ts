interface SyncEvent {
  id: string
  type: "rider_update" | "buyer_update" | "order_update" | "general"
  data: Record<string, unknown>
  timestamp: number
}

const syncQueue: SyncEvent[] = []
let isSyncing = false

export const addToSyncQueue = (event: SyncEvent) => {
  syncQueue.push(event)
  processSyncQueue()
}

const processSyncQueue = async () => {
  if (isSyncing || syncQueue.length === 0) return

  isSyncing = true

  while (syncQueue.length > 0) {
    const event = syncQueue.shift()
    if (!event) break

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      await fetch(`${apiUrl}/api/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("[v0] Sync error:", error)
      // Re-queue the event if it failed
      if (event) syncQueue.unshift(event)
      break
    }
  }

  isSyncing = false
}

export const getSyncQueueLength = () => syncQueue.length

export const clearSyncQueue = () => {
  syncQueue.length = 0
}

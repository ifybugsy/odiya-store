"use client"

import { useEffect, useState } from "react"
import { getSocket, initializeSocket } from "@/lib/websocket-client"

interface SyncState {
  isOnline: boolean
  syncStatus: "synced" | "syncing" | "pending" | "error"
  lastSyncTime: Date | null
  pendingUpdates: number
}

export const useSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    syncStatus: "synced",
    lastSyncTime: null,
    pendingUpdates: 0,
  })

  useEffect(() => {
    const socket = getSocket() || initializeSocket()

    const handleOnline = () => {
      setSyncState((prev) => ({
        ...prev,
        isOnline: true,
        syncStatus: "syncing",
      }))
    }

    const handleOffline = () => {
      setSyncState((prev) => ({
        ...prev,
        isOnline: false,
        syncStatus: "pending",
      }))
    }

    const handleSyncComplete = () => {
      setSyncState((prev) => ({
        ...prev,
        syncStatus: "synced",
        lastSyncTime: new Date(),
        pendingUpdates: 0,
      }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    socket.on("sync:complete", handleSyncComplete)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      socket.off("sync:complete", handleSyncComplete)
    }
  }, [])

  return syncState
}

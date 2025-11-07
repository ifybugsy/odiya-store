"use client"

import { useEffect, useState, useCallback } from "react"
import { getSocket, initializeSocket } from "@/lib/websocket-client"
import type { Socket } from "socket.io-client"

interface UseRealTimeOptions {
  channel: string
  onData?: (data: unknown) => void
  onError?: (error: Error) => void
}

export const useRealTime = (options: UseRealTimeOptions) => {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<Error | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const sock = getSocket() || initializeSocket()
    setSocket(sock)

    sock.on("connect", () => {
      setIsConnected(true)
      console.log("[v0] Real-time connected to channel:", options.channel)
    })

    sock.on("disconnect", () => {
      setIsConnected(false)
    })

    sock.on(options.channel, (incomingData: unknown) => {
      setData(incomingData)
      options.onData?.(incomingData)
    })

    sock.on("error", (err: Error) => {
      setError(err)
      options.onError?.(err)
    })

    return () => {
      sock.off("connect")
      sock.off("disconnect")
      sock.off(options.channel)
      sock.off("error")
    }
  }, [options])

  const emit = useCallback(
    (event: string, payload: unknown) => {
      if (socket?.connected) {
        socket.emit(event, payload)
      }
    },
    [socket],
  )

  return { isConnected, data, error, emit }
}

import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export const initializeSocket = (): Socket => {
  if (socketInstance) return socketInstance

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  socketInstance = io(apiUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socketInstance.on("connect", () => {
    console.log("[v0] WebSocket connected:", socketInstance?.id)
  })

  socketInstance.on("disconnect", () => {
    console.log("[v0] WebSocket disconnected")
  })

  socketInstance.on("error", (error) => {
    console.error("[v0] WebSocket error:", error)
  })

  return socketInstance
}

export const getSocket = (): Socket | null => {
  return socketInstance
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

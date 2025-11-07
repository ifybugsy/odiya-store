import { createRealTimeEvent, registerConnection, unregisterConnection } from "./realtime-service"

export interface WebSocketMessage {
  type: "subscribe" | "unsubscribe" | "ping" | "location_update"
  userId?: string
  orderId?: string
  data?: any
}

export function handleWebSocketMessage(ws: WebSocket, message: string, userId: string) {
  try {
    const data: WebSocketMessage = JSON.parse(message)

    switch (data.type) {
      case "subscribe":
        registerConnection(userId, ws)
        ws.send(JSON.stringify({ type: "subscribed", userId }))
        break

      case "location_update":
        if (data.data?.deliveryId && data.data?.latitude && data.data?.longitude) {
          createRealTimeEvent("location_update", data.data.deliveryId, "Delivery", userId, {
            latitude: data.data.latitude,
            longitude: data.data.longitude,
            timestamp: new Date(),
          })
        }
        break

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }))
        break

      case "unsubscribe":
        unregisterConnection(userId, ws)
        break

      default:
        console.log("[v0] Unknown WebSocket message type:", data.type)
    }
  } catch (error) {
    console.error("[v0] WebSocket message handler error:", error)
  }
}

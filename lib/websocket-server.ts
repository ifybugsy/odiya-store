import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { verify } from "jsonwebtoken"
import { handleWebSocketMessage, type WebSocketMessage } from "./websocket-handler"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const PORT = process.env.WS_PORT || 8080

// Map of userId -> Set of WebSocket connections
const userConnections = new Map<string, Set<WebSocket>>()

// Map of deliveryId -> Set of watching users
const deliveryWatchers = new Map<string, Set<string>>()

export function initializeWebSocketServer() {
  const server = createServer()
  const wss = new WebSocketServer({ server })

  wss.on("connection", (ws: WebSocket, request) => {
    console.log("[v0] New WebSocket connection")

    // Extract token from URL
    const url = new URL(request.url || "", `http://${request.headers.host}`)
    const token = url.searchParams.get("token")

    if (!token) {
      console.log("[v0] WebSocket connection rejected: no token")
      ws.close(1008, "Unauthorized")
      return
    }

    let userId: string
    try {
      const decoded: any = verify(token, JWT_SECRET)
      userId = decoded.id
    } catch (error) {
      console.log("[v0] WebSocket connection rejected: invalid token")
      ws.close(1008, "Unauthorized")
      return
    }

    console.log(`[v0] User ${userId} connected`)

    // Register connection
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set())
    }
    userConnections.get(userId)?.add(ws)

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connection established",
        userId,
      }),
    )

    // Handle incoming messages
    ws.on("message", (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        console.log(`[v0] WebSocket message from ${userId}:`, message.type)

        handleWebSocketMessage(ws, data.toString(), userId)

        // Additional handling
        if (message.type === "watch_delivery" && message.data?.deliveryId) {
          if (!deliveryWatchers.has(message.data.deliveryId)) {
            deliveryWatchers.set(message.data.deliveryId, new Set())
          }
          deliveryWatchers.get(message.data.deliveryId)?.add(userId)
          console.log(`[v0] User ${userId} watching delivery ${message.data.deliveryId}`)
        }
      } catch (error) {
        console.error("[v0] WebSocket message parse error:", error)
      }
    })

    // Handle disconnection
    ws.on("close", () => {
      console.log(`[v0] User ${userId} disconnected`)
      userConnections.get(userId)?.delete(ws)

      if (userConnections.get(userId)?.size === 0) {
        userConnections.delete(userId)
      }
    })

    ws.on("error", (error) => {
      console.error(`[v0] WebSocket error for user ${userId}:`, error)
    })
  })

  server.listen(PORT, () => {
    console.log(`[v0] WebSocket server listening on port ${PORT}`)
  })

  return { wss, server, userConnections, deliveryWatchers }
}

export function broadcastOrderUpdate(orderId: string, status: string, buyerId: string) {
  const connections = userConnections.get(buyerId)
  if (connections) {
    const message = JSON.stringify({
      type: "order_status",
      data: { orderId, status, timestamp: new Date() },
    })
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }
}

export function broadcastDeliveryUpdate(
  deliveryId: string,
  status: string,
  location?: { latitude: number; longitude: number },
) {
  const watchers = deliveryWatchers.get(deliveryId)
  if (watchers) {
    const message = JSON.stringify({
      type: "delivery_update",
      data: { deliveryId, status, location, timestamp: new Date() },
    })
    watchers.forEach((userId) => {
      const connections = userConnections.get(userId)
      connections?.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message)
        }
      })
    })
  }
}

export function broadcastNotification(userId: string, notification: any) {
  const connections = userConnections.get(userId)
  if (connections) {
    const message = JSON.stringify({
      type: "notification",
      data: notification,
    })
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }
}

import Notification from "@/models/Notification"
import RealTimeEvent from "@/models/RealTimeEvent"
import Order from "@/models/Order"
import Delivery from "@/models/Delivery"

interface WebSocketMessage {
  type: "location_update" | "order_status" | "delivery_update" | "subscribe" | "unsubscribe"
  userId?: string
  orderId?: string
  deliveryId?: string
  data?: any
}

// In-memory store for active connections
const activeConnections = new Map<string, Set<WebSocket>>()

export async function createNotification(
  userId: string,
  type: "order" | "delivery" | "payment" | "system" | "recommendation",
  title: string,
  message: string,
  relatedId?: string,
) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      orderId: type === "order" ? relatedId : undefined,
      deliveryId: type === "delivery" ? relatedId : undefined,
    })
    await notification.save()
    return notification
  } catch (error) {
    console.error("[v0] Error creating notification:", error)
  }
}

export async function createRealTimeEvent(
  eventType: string,
  entityId: string,
  entityType: "Order" | "Delivery" | "User",
  userId?: string,
  data?: Record<string, any>,
) {
  try {
    const event = new RealTimeEvent({
      eventType,
      entityId,
      entityType,
      userId,
      data,
      processed: false,
    })
    await event.save()

    // Broadcast to connected clients
    if (userId) {
      broadcastToUser(userId, {
        type: eventType,
        data,
      })
    }

    return event
  } catch (error) {
    console.error("[v0] Error creating real-time event:", error)
  }
}

export function registerConnection(userId: string, ws: WebSocket) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set())
  }
  activeConnections.get(userId)?.add(ws)
}

export function unregisterConnection(userId: string, ws: WebSocket) {
  activeConnections.get(userId)?.delete(ws)
  if (activeConnections.get(userId)?.size === 0) {
    activeConnections.delete(userId)
  }
}

export function broadcastToUser(userId: string, message: any) {
  const connections = activeConnections.get(userId)
  if (connections) {
    const messageStr = JSON.stringify(message)
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr)
      }
    })
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string, updatedBy?: string) {
  try {
    const order = await Order.findByIdAndUpdate(orderId, { status: newStatus, updatedAt: new Date() }, { new: true })

    if (order) {
      // Create notification
      await createNotification(
        order.buyerId.toString(),
        "order",
        `Order Status Updated`,
        `Your order status is now: ${newStatus}`,
        orderId,
      )

      // Create real-time event
      await createRealTimeEvent("order_status", orderId, "Order", order.buyerId.toString(), {
        orderId,
        newStatus,
        updatedBy,
      })
    }

    return order
  } catch (error) {
    console.error("[v0] Error updating order status:", error)
  }
}

export async function updateDeliveryLocation(deliveryId: string, latitude: number, longitude: number, riderId: string) {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      },
      { new: true },
    )

    if (delivery) {
      // Create real-time event
      await createRealTimeEvent("location_update", deliveryId, "Delivery", riderId, {
        deliveryId,
        latitude,
        longitude,
        timestamp: new Date(),
      })

      // Get the order to notify buyer
      const order = await Order.findById(delivery.orderId)
      if (order) {
        broadcastToUser(order.buyerId.toString(), {
          type: "delivery_update",
          data: {
            deliveryId,
            latitude,
            longitude,
            status: delivery.status,
          },
        })
      }
    }

    return delivery
  } catch (error) {
    console.error("[v0] Error updating delivery location:", error)
  }
}

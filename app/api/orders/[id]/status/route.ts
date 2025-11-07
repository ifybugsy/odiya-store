import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Order from "@/models/Order"
import Delivery from "@/models/Delivery"
import { createNotification, createRealTimeEvent } from "@/lib/realtime-service"
import { broadcastOrderUpdate, broadcastDeliveryUpdate } from "@/lib/websocket-server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const body = await request.json()

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check authorization (admin or seller)
    const isAuthorized = order.sellerId.toString() === decoded.id || decoded.isAdmin

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update order status
    const oldStatus = order.status
    order.status = body.status
    order.updatedAt = new Date()

    if (body.status === "in_transit" && !order.deliveryStartedAt) {
      order.deliveryStartedAt = new Date()
    } else if (body.status === "delivered") {
      order.deliveredAt = new Date()
    }

    await order.save()

    // Create notification for buyer
    await createNotification(
      order.buyerId.toString(),
      "order",
      `Order ${body.status}`,
      `Your order #${params.id.slice(-6)} status is now ${body.status}.`,
      params.id,
    )

    // Create real-time event
    await createRealTimeEvent("order_status", params.id, "Order", order.buyerId.toString(), {
      orderId: params.id,
      oldStatus,
      newStatus: body.status,
      updatedAt: new Date(),
    })

    // Broadcast to buyer via WebSocket
    broadcastOrderUpdate(params.id, body.status, order.buyerId.toString())

    // If delivery status, also update watchers
    if (order.riderId) {
      const delivery = await Delivery.findOne({ orderId: params.id })
      if (delivery) {
        broadcastDeliveryUpdate(delivery._id.toString(), body.status)
      }
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("[v0] Order status update error:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}

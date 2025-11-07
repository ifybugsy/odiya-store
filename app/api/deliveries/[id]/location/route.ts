import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Delivery from "@/models/Delivery"
import Order from "@/models/Order"
import { createRealTimeEvent } from "@/lib/realtime-service"
import { broadcastDeliveryUpdate } from "@/lib/websocket-server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const body = await request.json()

    const delivery = await Delivery.findById(params.id)

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Verify rider authorization
    if (delivery.riderId.toString() !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update location
    delivery.currentLocation = {
      latitude: body.latitude,
      longitude: body.longitude,
      timestamp: new Date(),
    }

    await delivery.save()

    // Get order for buyer notification
    const order = await Order.findById(delivery.orderId)

    if (order) {
      // Create real-time event
      await createRealTimeEvent("location_update", params.id, "Delivery", decoded.id, {
        deliveryId: params.id,
        latitude: body.latitude,
        longitude: body.longitude,
        timestamp: new Date(),
      })

      // Broadcast to buyer via WebSocket
      broadcastDeliveryUpdate(params.id, delivery.status, {
        latitude: body.latitude,
        longitude: body.longitude,
      })
    }

    return NextResponse.json({
      success: true,
      delivery,
    })
  } catch (error) {
    console.error("[v0] Location update error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

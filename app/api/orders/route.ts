import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Order from "@/models/Order"
import { createNotification, createRealTimeEvent } from "@/lib/realtime-service"
import { broadcastOrderUpdate } from "@/lib/websocket-server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const body = await request.json()

    const order = new Order({
      buyerId: decoded.id,
      sellerId: body.sellerId,
      items: body.items,
      totalAmount: body.totalAmount,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
    })

    await order.save()

    // Create notification
    await createNotification(
      decoded.id,
      "order",
      "Order Placed",
      `Your order #${order._id.toString().slice(-6)} has been placed.`,
      order._id.toString(),
    )

    // Create real-time event
    await createRealTimeEvent("order_status", order._id.toString(), "Order", decoded.id, {
      orderId: order._id,
      status: "pending",
      amount: body.totalAmount,
    })

    // Broadcast to connected clients
    broadcastOrderUpdate(order._id.toString(), "pending", decoded.id)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)

    const orders = await Order.find({ buyerId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sellerId", "firstName lastName")
      .populate("items.productId", "title price image")

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("[v0] Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Order from "@/models/Order"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)

    const orders = await Order.find({ buyerId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("items.productId")

    const stats = {
      totalOrders: await Order.countDocuments({ buyerId: decoded.id }),
      totalSpent: await Order.aggregate([
        { $match: { buyerId: decoded.Types.ObjectId(decoded.id) } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      activeDeliveries: await Order.countDocuments({
        buyerId: decoded.id,
        status: { $in: ["in_transit", "ready_for_delivery"] },
      }),
    }

    return NextResponse.json({
      success: true,
      orders,
      stats: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent[0]?.total || 0,
        activeDeliveries: stats.activeDeliveries,
      },
    })
  } catch (error) {
    console.error("[v0] Buyer orders API error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

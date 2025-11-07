import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import User from "@/models/User"
import Order from "@/models/Order"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const admin = await User.findById(decoded.id)

    if (!admin?.isAdmin && admin?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const filter = request.nextUrl.searchParams.get("filter") || "all"
    const search = request.nextUrl.searchParams.get("search") || ""
    const query: any = { role: "buyer" }

    if (filter === "active") query.isSuspended = false
    if (filter === "suspended") query.isSuspended = true
    if (filter === "new") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      query.createdAt = { $gte: sevenDaysAgo }
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ]
    }

    const buyers = await User.find(query).sort({ createdAt: -1 }).limit(100)

    // Enrich buyers with order data
    const buyersWithOrders = await Promise.all(
      buyers.map(async (buyer) => {
        const orders = await Order.find({ buyerId: buyer._id })
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

        return {
          ...buyer.toObject(),
          totalOrders: orders.length,
          totalSpent,
          lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        }
      }),
    )

    // Calculate stats
    const allBuyers = await User.find({ role: "buyer" })
    const activeBuyers = allBuyers.filter((b) => !b.isSuspended).length
    const suspendedBuyers = allBuyers.filter((b) => b.isSuspended).length

    const allOrders = await Order.find({})
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0

    return NextResponse.json({
      success: true,
      buyers: buyersWithOrders,
      stats: {
        totalBuyers: allBuyers.length,
        activeBuyers,
        suspendedBuyers,
        totalOrders: allOrders.length,
        totalRevenue,
        averageOrderValue: avgOrderValue,
      },
    })
  } catch (error) {
    console.error("[v0] Admin buyers API error:", error)
    return NextResponse.json({ error: "Failed to fetch buyers" }, { status: 500 })
  }
}

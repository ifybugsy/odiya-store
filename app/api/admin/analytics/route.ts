import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import User from "@/models/User"
import Order from "@/models/Order"
import Delivery from "@/models/Delivery"

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

    const period = request.nextUrl.searchParams.get("period") || "30d"
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
    const days = daysMap[period] || 30

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Summary Stats
    const allOrders = await Order.find({ createdAt: { $gte: startDate } })
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = allOrders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalUsers = await User.countDocuments()
    const activeDeliveries = await Delivery.countDocuments({ status: { $in: ["assigned", "picked_up", "in_transit"] } })
    const conversionRate =
      totalUsers > 0 ? (((await User.countDocuments({ role: "buyer" })) / totalUsers) * 100).toFixed(1) : 0

    // Order Trends
    const orderTrends = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Delivery Stats
    const deliveryStats = await Delivery.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Top Categories
    const topCategories = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
    ])

    // User Growth
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ])

    // Transform user growth data
    const userGrowthMap = new Map<string, any>()
    userGrowth.forEach((item: any) => {
      const date = item._id.date
      if (!userGrowthMap.has(date)) {
        userGrowthMap.set(date, { date, buyers: 0, sellers: 0, riders: 0 })
      }
      const record = userGrowthMap.get(date)
      if (item._id.role === "buyer") record.buyers += item.count
      else if (item._id.role === "seller") record.sellers += item.count
      else if (item._id.role === "rider") record.riders += item.count
    })

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          totalOrders,
          totalUsers,
          activeDeliveries,
          avgOrderValue,
          conversionRate: Number.parseFloat(conversionRate as string),
        },
        orderTrends: orderTrends.map((item) => ({
          date: item._id,
          orders: item.orders,
          revenue: item.revenue,
        })),
        deliveryStats: deliveryStats.map((item) => ({
          status: item._id,
          count: item.count,
        })),
        topCategories: topCategories.map((item, index) => ({
          category: `Category ${index + 1}`,
          sales: item.sales,
        })),
        userGrowth: Array.from(userGrowthMap.values()),
      },
    })
  } catch (error) {
    console.error("[v0] Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

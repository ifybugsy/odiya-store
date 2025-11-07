import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Rider from "@/models/Rider"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user?.isAdmin && user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const filter = request.nextUrl.searchParams.get("filter") || "all"
    const query: any = {}

    if (filter === "active") query.status = "active"
    if (filter === "pending") query.verificationStatus = "pending"
    if (filter === "suspended") query.status = "suspended"

    const riders = await Rider.find(query)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .limit(50)

    const stats = await Rider.aggregate([
      {
        $group: {
          _id: null,
          totalRiders: { $sum: 1 },
          activeRiders: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          pendingVerification: {
            $sum: { $cond: [{ $eq: ["$verificationStatus", "pending"] }, 1, 0] },
          },
          totalDeliveries: { $sum: "$totalDeliveries" },
          averageRating: { $avg: "$rating" },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      riders,
      stats: stats[0] || {},
    })
  } catch (error) {
    console.error("[v0] Admin riders API error:", error)
    return NextResponse.json({ error: "Failed to fetch riders" }, { status: 500 })
  }
}

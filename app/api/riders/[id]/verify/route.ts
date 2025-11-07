import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Rider from "@/models/Rider"
import User from "@/models/User"
import { createNotification } from "@/lib/realtime-service"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await request.json()
    const rider = await Rider.findByIdAndUpdate(params.id, body, { new: true })

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 })
    }

    // Send notification to rider
    await createNotification(
      rider.userId.toString(),
      "system",
      `Verification ${body.verificationStatus}`,
      `Your rider application has been ${body.verificationStatus}.`,
    )

    return NextResponse.json({
      success: true,
      rider,
    })
  } catch (error) {
    console.error("[v0] Rider verification API error:", error)
    return NextResponse.json({ error: "Failed to verify rider" }, { status: 500 })
  }
}

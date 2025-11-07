import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
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

    const buyer = await User.findByIdAndUpdate(params.id, { isSuspended: false }, { new: true })

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    // Send notification
    await createNotification(
      params.id,
      "system",
      "Account Reactivated",
      "Your account has been reactivated. You can now place orders again.",
    )

    return NextResponse.json({
      success: true,
      buyer,
    })
  } catch (error) {
    console.error("[v0] Error unsuspending buyer:", error)
    return NextResponse.json({ error: "Failed to unsuspend buyer" }, { status: 500 })
  }
}

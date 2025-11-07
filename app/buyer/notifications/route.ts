import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import Notification from "@/models/Notification"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)

    const notifications = await Notification.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(50)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  } catch (error) {
    console.error("[v0] Buyer notifications API error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const body = await request.json()

    if (body.markAllAsRead) {
      await Notification.updateMany({ userId: decoded.id, read: false }, { read: true, readAt: new Date() })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Buyer notifications update API error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

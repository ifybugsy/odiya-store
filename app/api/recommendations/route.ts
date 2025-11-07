import { type NextRequest, NextResponse } from "next/server"
import {
  getRecommendationsForUser,
  generateRecommendations,
  markRecommendationAsViewed,
} from "@/lib/recommendation-engine"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const limit = request.nextUrl.searchParams.get("limit") || "10"

    const recommendations = await getRecommendationsForUser(decoded.id, Number.parseInt(limit))

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    })
  } catch (error) {
    console.error("[v0] Recommendations API error:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = verify(token, JWT_SECRET)
    const body = await request.json()

    if (body.action === "generate") {
      const recommendations = await generateRecommendations({
        userId: decoded.id,
        limit: body.limit || 15,
        excludeIds: body.excludeIds || [],
      })

      return NextResponse.json({
        success: true,
        message: "Recommendations generated",
        count: recommendations.length,
      })
    } else if (body.action === "mark_viewed") {
      await markRecommendationAsViewed(body.recommendationId)

      return NextResponse.json({
        success: true,
        message: "Recommendation marked as viewed",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Recommendations POST error:", error)
    return NextResponse.json({ error: "Failed to process recommendation" }, { status: 500 })
  }
}

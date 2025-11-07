import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")
    const limit = request.nextUrl.searchParams.get("limit") || "10"
    const search = request.nextUrl.searchParams.get("search")

    let url = `${BACKEND_URL}/items?limit=${limit}`

    if (category) {
      url += `&category=${encodeURIComponent(category)}`
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`)
    }

    const data = await res.json()

    // Handle both array and object responses from backend
    const items = Array.isArray(data) ? data : data.items || []

    return NextResponse.json({
      success: true,
      items,
      total: data.total || items.length,
    })
  } catch (error) {
    console.error("[v0] Items API error:", error)
    return NextResponse.json({ success: false, items: [], total: 0, error: "Failed to fetch items" }, { status: 500 })
  }
}

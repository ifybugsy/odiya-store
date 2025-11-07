import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/riders/ratings`, {
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch ratings error:", error)
    return NextResponse.json({ message: "Failed to fetch ratings" }, { status: 500 })
  }
}
